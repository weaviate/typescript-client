import { Deque } from '@datastructures-js/deque';
import { v4 as uuidv4 } from 'uuid';
import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../index.js';
import {
  BatchObject as BatchObjectGRPC,
  BatchReference as BatchReferenceGRPC,
  BatchStreamRequest,
} from '../../proto/v1/batch.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';
import { BatchObject, BatchReference, ErrorObject, ErrorReference } from '../index.js';
import { Serialize } from '../serialize/index.js';

const GCP_STREAM_TIMEOUT = 160 * 1000; // 160 seconds

type Internal<E> = {
  entry: E;
  index: number;
};

type InternalError<E> = {
  index: number;
  message: string;
  entry: E;
  type: 'error';
};

type InternalSuccess = {
  index: number;
  uuid?: string;
  beacon?: string;
  type: 'success';
};

export const isInternalError = (obj: InternalError<any> | InternalSuccess): obj is InternalError<any> => {
  return obj.type === 'error';
};

const isBatchObject = <T>(obj: BatchObject<T> | BatchReference | null): obj is BatchObject<T> => {
  return (obj as BatchObject<T>).collection !== undefined;
};

const isBatchReference = <T>(obj: BatchObject<T> | BatchReference | null): obj is BatchReference => {
  return (obj as BatchReference).fromObjectCollection !== undefined;
};

export interface Batching {
  addObject: (obj: BatchObject<any>) => Promise<string>;
  addReference: (ref: BatchReference) => Promise<void>;
  stop: () => Promise<void>;
  hasErrors: () => boolean;
  uuids: () => Record<number, string>;
  beacons: () => Record<number, string>;
  objErrors: () => Record<number, ErrorObject<any>>;
  refErrors: () => Record<number, ErrorReference>;
}

export interface Batch {
  stream: (consistencyLevel?: ConsistencyLevel) => Promise<Batching>;
}

export default function (connection: Connection, dbVersionSupport: DbVersionSupport): Batch {
  return {
    stream: async (consistencyLevel) => {
      const { supports, message } = await dbVersionSupport.supportsServerSideBatching();
      if (!supports) {
        throw new Error(message);
      }
      const batcher = new Batcher<any>({ consistencyLevel, isGcpOnWcd: connection.isGcpOnWcd() });
      let batchingErr: Error | null = null;
      const batching = batcher.start(connection).catch((err) => {
        batchingErr = err;
      });
      const check = (err: Error | null) => {
        if (err) {
          throw err;
        }
        return batcher;
      };
      return {
        addObject: (obj) => check(batchingErr).addObject(obj),
        addReference: (ref) => check(batchingErr).addReference(ref),
        stop: () => {
          check(batchingErr).stop();
          return batching;
        },
        hasErrors: () =>
          Object.keys(batcher.objErrors).length > 0 || Object.keys(batcher.refErrors).length > 0,
        uuids: () => batcher.uuids,
        beacons: () => batcher.beacons,
        objErrors: () => batcher.objErrors,
        refErrors: () => batcher.refErrors,
      };
    },
  };
}

type BatcherArgs = {
  consistencyLevel?: ConsistencyLevel;
  isGcpOnWcd: boolean;
};

class Batcher<T> {
  private consistencyLevel?: ConsistencyLevel;
  private queue: Queue<BatchObject<T> | BatchReference>;

  private inflightObjs: Set<string> = new Set();
  private inflightRefs: Set<string> = new Set();
  private batchSize: number = 1000;
  private objsCache: Record<string, Internal<BatchObject<T>>> = {};
  private refsCache: Record<string, Internal<BatchReference>> = {};
  private pendingObjs: BatchObjectGRPC[] = [];
  private pendingRefs: BatchReferenceGRPC[] = [];
  private isStarted: boolean = false;
  private isShutdown: boolean = false;
  private isShuttingDown: boolean = false;
  private isOom: boolean = false;
  private isStopped: boolean = false;
  private isGcpOnWcd: boolean = false;
  private isRenewingStream: boolean = false;

  public objErrors: Record<number, ErrorObject<T>> = {};
  public refErrors: Record<number, ErrorReference> = {};
  public uuids: Record<number, string> = {};
  public beacons: Record<number, string> = {};

  constructor(args: BatcherArgs) {
    this.consistencyLevel = args.consistencyLevel;
    this.queue = new Queue();
    this.isGcpOnWcd = args.isGcpOnWcd;
  }

  private healthy() {
    return !this.isShuttingDown && !this.isOom && !this.isShutdown;
  }

  public addObject = async (obj: BatchObject<T>) => {
    while (this.inflightObjs.size >= this.batchSize || !this.healthy()) {
      await Batcher.sleep(10); // eslint-disable-line no-await-in-loop
    }
    if (obj.id === undefined) {
      obj.id = uuidv4();
    }
    this.queue.push(obj);
    return obj.id!;
  };

  public addReference = async (ref: BatchReference) => {
    while (this.inflightRefs.size >= this.batchSize || !this.healthy()) {
      await Batcher.sleep(10); // eslint-disable-line no-await-in-loop
    }
    this.queue.push(ref);
  };

  private static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // eslint-disable-next-line complexity
  private async *generateStreamRequests(grpcMaxMessageSize: number): AsyncGenerator<BatchStreamRequest> {
    while (!this.isStarted) {
      console.info('Waiting for server to start the batch ingestion...');
      await Batcher.sleep(100); // eslint-disable-line no-await-in-loop
    }
    const streamStart = Date.now();

    const perObjectOverhead = 4; // extra overhead bytes per object in the request

    let req = BatchStreamRequest.create({
      data: { objects: { values: this.pendingObjs }, references: { values: this.pendingRefs } },
    });
    let totalSize = BatchStreamRequest.encode(req).finish().length;

    let objIndex = 0;
    let refIndex = 0;

    while (true) {
      if (this.isShuttingDown) {
        console.warn('Server shutting down, closing the client-side of the stream');
        this.pendingObjs = req.data?.objects?.values || [];
        this.pendingRefs = req.data?.references?.values || [];
        return;
      }
      if (this.isOom) {
        console.warn('Server out-of-memory, closing the client-side of the stream');
        this.pendingObjs = req.data?.objects?.values || [];
        this.pendingRefs = req.data?.references?.values || [];
        return;
      }
      if (this.isGcpOnWcd && Date.now() - streamStart > GCP_STREAM_TIMEOUT) {
        console.info(
          'GCP connections have a maximum lifetime. Re-establishing the batch stream to avoid timeout errors.'
        );
        this.isRenewingStream = true;
        yield BatchStreamRequest.create({ stop: {} });
        return;
      }

      const entry = await this.queue.pull(100); // eslint-disable-line no-await-in-loop
      if (entry === null && !this.isStopped) {
        // user may be holding the batcher open and not added to it in the last second
        continue;
      }
      if (entry === null && this.isStopped) {
        // user has signaled to stop batching and there's nothing left in the queue, so close the stream
        console.info('Batching stopped by user, closing the client-side of the stream');
        if (
          (req.data?.objects?.values.length !== undefined && req.data.objects.values.length > 0) ||
          (req.data?.references?.values.length !== undefined && req.data.references.values.length > 0)
        ) {
          yield req;
        }

        yield BatchStreamRequest.create({ stop: {} });
        return;
      }

      if (isBatchObject<T>(entry)) {
        const { grpc } = Serialize.batchObject<T>(entry.collection, entry, false, entry.tenant);
        this.objsCache[grpc.uuid] = { entry, index: objIndex };

        const objSize = BatchObjectGRPC.encode(grpc).finish().length + perObjectOverhead;
        if (totalSize + objSize >= grpcMaxMessageSize || req.data!.objects!.values.length >= this.batchSize) {
          while (this.inflightObjs.size > this.batchSize) {
            await Batcher.sleep(10); // eslint-disable-line no-await-in-loop
          }
          this.inflightObjs = new Set(req.data?.objects?.values.map((o) => o.uuid!));

          yield req;
          req = BatchStreamRequest.create({ data: { objects: { values: [] }, references: { values: [] } } });
          totalSize = BatchStreamRequest.encode(req).finish().length;
        }

        req.data!.objects!.values.push(grpc);
        totalSize += objSize;
        objIndex++; // eslint-disable-line no-plusplus
      }

      if (isBatchReference<T>(entry)) {
        const { grpc, beacon } = Serialize.batchReference(entry);
        this.refsCache[beacon] = { entry, index: refIndex };

        const refSize = BatchReferenceGRPC.encode(grpc).finish().length + perObjectOverhead;
        if (
          totalSize + refSize >= grpcMaxMessageSize ||
          req.data!.references!.values.length >= this.batchSize
        ) {
          this.inflightRefs = new Set(
            req.data?.references?.values.map(
              (r) => `weaviate://localhost/${r.fromCollection}/${r.fromUuid}/${r.name}`
            )
          );
          yield req;
          req = BatchStreamRequest.create({ data: { objects: { values: [] }, references: { values: [] } } });
          totalSize = BatchStreamRequest.encode(req).finish().length;
        }

        req.data!.references!.values.push(grpc);
        totalSize += refSize;
        refIndex++; // eslint-disable-line no-plusplus
      }
    }
  }

  async start(connection: Connection): Promise<void> {
    console.info('Starting batch ingestion');
    for await (const result of this.do(connection)) {
      if (isInternalError(result)) {
        const { index, ...error } = result;
        if (isBatchObject<T>(error.entry))
          this.objErrors[index] = { message: error.message, object: error.entry };
        if (isBatchReference(error.entry))
          this.refErrors[index] = { message: error.message, reference: error.entry };
      } else if (result.type === 'success') {
        if (result.uuid !== undefined) this.uuids[result.index] = result.uuid;
        if (result.beacon !== undefined) this.beacons[result.index] = result.beacon;
      }
    }
    if (this.isShutdown) {
      console.warn('Reconnecting after server shutdown...');
      await this.reconnect(connection);
      console.warn('Reconnected, resuming batch ingestion...');
      return this.restart(connection);
    } else if (this.isRenewingStream) {
      console.info('Restarting batch recv after renewing stream...');
      this.isRenewingStream = false;
      return this.restart(connection);
    }
  }

  private async reconnect(connection: Connection, retries: number = 0): Promise<void> {
    try {
      await connection.reconnect();
    } catch (error) {
      if (retries >= 5) {
        throw new Error('Failed to reconnect after server shutdown');
      }
      console.warn(`Reconnect attempt ${retries + 1} failed, retrying...`);
      await Batcher.sleep(2 ** retries * 1000);
      return this.reconnect(connection, retries + 1);
    }
  }

  private restart(connection: Connection): Promise<void> {
    this.isShutdown = false;
    this.isStarted = false;
    return this.start(connection);
  }

  public stop() {
    this.isStopped = true;
  }

  async *do(
    connection: Connection
  ): AsyncGenerator<InternalError<BatchObject<T>> | InternalError<BatchReference> | InternalSuccess> {
    const gen = await connection
      .batch('', this.consistencyLevel)
      .then((batch) => batch.withStream(this.generateStreamRequests(connection.grpcMaxMessageLength)));
    for await (const msg of gen) {
      if (msg.acks !== undefined) {
        this.inflightObjs = this.inflightObjs.difference(new Set(msg.acks.uuids));
        this.inflightRefs = this.inflightRefs.difference(new Set(msg.acks.beacons));
      }
      if (msg.backoff !== undefined) {
        if (this.batchSize !== msg.backoff.batchSize && this.healthy() && !this.isStopped) {
          this.batchSize = msg.backoff.batchSize;
        }
      }
      if (msg.outOfMemory !== undefined) {
        this.isOom = true;
        msg.outOfMemory.uuids.forEach((uuid) => this.queue.push(this.objsCache[uuid].entry));
        msg.outOfMemory.beacons.forEach((beacon) => this.queue.push(this.refsCache[beacon].entry));
        this.inflightObjs = this.inflightObjs.difference(new Set(msg.outOfMemory.uuids));
        this.inflightRefs = this.inflightRefs.difference(new Set(msg.outOfMemory.beacons));
      }
      if (msg.shuttingDown !== undefined) {
        console.warn('Received shutting down signal from server');
        this.isShuttingDown = true;
        this.isOom = false;
      }
      if (msg.shutdown !== undefined) {
        console.warn('Received shutdown signal from server');
        this.isShutdown = true;
        this.isShuttingDown = false;
      }
      if (msg.started !== undefined) {
        this.isStarted = true;
      }
      if (msg.results !== undefined) {
        for (const error of msg.results.errors) {
          if (error.uuid !== undefined) {
            const cached = this.objsCache[error.uuid];
            if (cached === undefined) {
              continue;
            }
            yield {
              index: cached.index,
              message: error.error,
              entry: cached.entry,
              type: 'error',
            };
            delete this.objsCache[error.uuid];
          }
          if (error.beacon !== undefined) {
            const cached = this.refsCache[error.beacon];
            if (cached === undefined) {
              continue;
            }
            yield {
              index: cached.index,
              message: error.error,
              entry: cached.entry,
              type: 'error',
            };
            delete this.refsCache[error.beacon];
          }
        }
        for (const success of msg.results.successes) {
          if (success.uuid !== undefined) {
            const cached = this.objsCache[success.uuid];
            if (cached === undefined) {
              continue;
            }
            yield {
              index: cached.index,
              uuid: success.uuid,
              type: 'success',
            };
            delete this.objsCache[success.uuid];
          }
          if (success.beacon !== undefined) {
            const cached = this.refsCache[success.beacon];
            if (cached === undefined) {
              continue;
            }
            yield {
              index: cached.index,
              beacon: success.beacon,
              type: 'success',
            };
            delete this.refsCache[success.beacon];
          }
        }
      }
    }
    console.info('Server closed its side of the stream');
  }
}

type Resolver<T> = (value: T) => void;

export class Queue<T> {
  private resolvers: Deque<Resolver<T>>;
  private promises: Deque<Promise<T>>;
  constructor() {
    // invariant: at least one of the arrays is empty
    this.resolvers = new Deque<Resolver<T>>();
    this.promises = new Deque<Promise<T>>();
  }
  _add() {
    this.promises.pushBack(new Promise((resolve) => this.resolvers.pushBack(resolve)));
  }
  _readd(promise: Promise<T>) {
    this.promises.pushFront(promise);
  }
  push(t: T) {
    if (!this.resolvers.size()) this._add();
    this.resolvers.popFront()!(t);
  }
  pull(timeout?: number): Promise<T | null> {
    if (!this.promises.size()) this._add();
    const promise = this.promises.popFront()!;
    if (timeout === undefined) return promise;

    let timeoutRes: Resolver<null>;
    const mainPromise = promise.then((value) => {
      clearTimeout(timer);
      return value;
    });
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutRes = resolve;
    });
    const timer = setTimeout(() => {
      this._readd(promise);
      timeoutRes(null);
    }, timeout);
    return Promise.race([mainPromise, timeoutPromise]);
  }
  get length() {
    return this.promises.size() - this.resolvers.size();
  }
}
