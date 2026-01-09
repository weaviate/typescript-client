import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../index.js';
import { BatchObject as BatchObjectGRPC, BatchStreamRequest } from '../../proto/v1/batch.js';
import { BatchObject, DataObject, NonReferenceInputs } from '../index.js';
import { Serialize } from '../serialize/index.js';

type InternalObject<T> = {
  object: BatchObject<T>;
  index: number;
};

type InternalError<T> = {
  index: number;
  message: string;
  object: BatchObject<T>;
  originalUuid?: string;
  type: 'error';
};

type InternalSuccess = {
  index: number;
  uuid: string;
  type: 'success';
};

export const isInternalError = <T>(obj: InternalError<T> | InternalSuccess): obj is InternalError<T> => {
  return obj.type === 'error';
};

export const isInternalSuccess = <T>(obj: InternalError<T> | InternalSuccess): obj is InternalSuccess => {
  return obj.type === 'success';
};

export class Batch<T> {
  private collection: string;
  private consistencyLevel?: ConsistencyLevel;
  private tenant?: string;

  private generator?: AsyncGenerator<DataObject<T> | NonReferenceInputs<T>>;

  private inflightObjs: Set<string> = new Set();
  private batchSize: number = 1000;
  private objsCache: Record<string, InternalObject<T>> = {};
  private pendingObjs: BatchObjectGRPC[] = [];
  private started: boolean = false;
  private isShuttingDown: boolean = false;
  private isShutdown: boolean = false;
  private isOom: boolean = false;
  private stop: boolean = false;

  constructor(collection: string, consistencyLevel?: ConsistencyLevel, tenant?: string) {
    this.collection = collection;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
  }

  withGenerator(objs: AsyncGenerator<DataObject<T> | NonReferenceInputs<T>>) {
    this.generator = objs;
    return this;
  }

  withIterable(objs: Iterable<DataObject<T> | NonReferenceInputs<T>>) {
    return this.withGenerator(this.iterableToGenerator(objs));
  }

  private iterableToGenerator(
    objs: Iterable<DataObject<T> | NonReferenceInputs<T>>
  ): AsyncGenerator<DataObject<T> | NonReferenceInputs<T>> {
    async function* gen() {
      let count = 0;
      for (const obj of objs) {
        yield obj;
        if (count % 1000 === 0) {
          await Batch.sleep(0); // eslint-disable-line no-await-in-loop
        }
        count++; // eslint-disable-line no-plusplus
      }
    }
    return gen();
  }

  private static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async *generateStreamRequests(grpcMaxMessageSize: number): AsyncGenerator<BatchStreamRequest> {
    if (!this.generator) {
      throw new Error('No objects generator provided for batch');
    }

    const perObjectOverhead = 4; // extra overhead bytes per object in the request

    // pending objects from previous incomplete batch if the client had to close the stream prematurely due to either shutdown or oom
    let req = BatchStreamRequest.create({ data: { objects: { values: this.pendingObjs } } });
    let totalSize = BatchStreamRequest.encode(req).finish().length;

    let index = 0;
    for await (const obj of this.generator!) {
      if (this.stop && !(this.isShuttingDown || this.isShutdown)) {
        console.log('Batching finished, closing the client-side of the stream');
        yield BatchStreamRequest.create({ stop: {} });
        return;
      }
      if (this.isShuttingDown) {
        console.log('Server shutting down, closing the client-side of the stream');
        this.pendingObjs = req.data?.objects?.values || [];
        return;
      }
      if (this.isOom) {
        console.log('Server out-of-memory, closing the client-side of the stream');
        this.pendingObjs = req.data?.objects?.values || [];
        return;
      }

      while (!this.started) {
        await Batch.sleep(10); // eslint-disable-line no-await-in-loop
      }
      while (this.inflightObjs.size >= this.batchSize) {
        await Batch.sleep(10); // eslint-disable-line no-await-in-loop
      }

      const { grpc, object } = Serialize.batchObject<T>(this.collection, obj, false, this.tenant);
      this.objsCache[grpc.uuid] = { object, index };

      const objSize = BatchObjectGRPC.encode(grpc).finish().length + perObjectOverhead;
      if (totalSize + objSize >= grpcMaxMessageSize || req.data!.objects!.values.length >= this.batchSize) {
        yield req;
        this.inflightObjs = new Set(req.data?.objects?.values.map((o) => o.uuid!));
        req = BatchStreamRequest.create({ data: { objects: { values: [] } } });
        totalSize = BatchStreamRequest.encode(req).finish().length;
      }

      req.data!.objects!.values.push(grpc);
      totalSize += objSize;
      index++; // eslint-disable-line no-plusplus
    }

    if (req.data?.objects?.values.length !== undefined && req.data.objects.values.length > 0) {
      yield req;
    }

    yield BatchStreamRequest.create({ stop: {} });
  }

  async *do(connection: Connection): AsyncGenerator<InternalError<T> | InternalSuccess> {
    const gen = await connection
      .batch(this.collection, this.consistencyLevel, this.tenant)
      .then((batch) => batch.withStream(this.generateStreamRequests(connection.grpcMaxMessageLength)));
    for await (const msg of gen) {
      if (msg.acks != undefined) {
        this.inflightObjs = this.inflightObjs.difference(new Set(msg.acks.uuids));
      }
      if (msg.backoff != undefined) {
        if (
          msg.backoff.batchSize != this.batchSize &&
          !this.isShuttingDown &&
          !this.isShutdown &&
          !this.stop
        ) {
          this.batchSize = msg.backoff.batchSize;
        }
      }
      if (msg.shutdown != undefined) {
        this.isShutdown = true;
        this.isShuttingDown = false;
      }
      if (msg.started != undefined) {
        this.started = true;
      }
      if (msg.results != undefined) {
        for (const error of msg.results.errors) {
          if (error.uuid !== undefined) {
            const cached = this.objsCache[error.uuid];
            if (cached === undefined) {
              continue;
            }
            yield {
              index: cached.index,
              message: error.error,
              object: cached.object,
              originalUuid: error.uuid,
              type: 'error',
            };
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
              uuid: success.uuid!,
              type: 'success',
            };
          }
        }
      }
    }
  }
}
