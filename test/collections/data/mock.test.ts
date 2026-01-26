import { ServerError, Status } from 'nice-grpc-common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WeaviateBatchStreamError } from '../../../src/errors.js';
import weaviate from '../../../src/index.js';
import { listen, makeGrpcApp, makeRestApp } from '../../mocks';

describe('Mock testing of batch streaming when the server errors', () => {
  let closeFn: () => Promise<any>;

  const serverErr = new ServerError(Status.INTERNAL, 'Simulated server error');
  const clientErr = new WeaviateBatchStreamError(
    '/weaviate.v1.Weaviate/BatchStream INTERNAL: Simulated server error'
  );

  beforeAll(async () => {
    const restApp = makeRestApp('1.36.0');
    const grpcApp = makeGrpcApp({
      async *batchStream(request, context) {
        yield { started: {} };
        throw serverErr;
      },
    });
    const { close } = await listen(restApp, grpcApp, 8080, 'localhost:50051');
    closeFn = close;
  });

  afterAll(() => closeFn());

  it('should handle server errors in batch streaming', async () => {
    const client = await weaviate.connectToLocal();
    const batching = await client.batch.stream();

    // give time for the server to throw the expected error
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // errors are thrown at the creation of the promise and not as part of the promise rejection
    expect(() => batching.addObject({ collection: 'Test Object' })).toThrowError(clientErr);

    // verify that error is still thrown if the promise is awaited instead
    // eslint-disable-next-line no-return-await
    await expect(async () => await batching.addObject({ collection: 'Test Object' })).rejects.toThrow(
      clientErr
    );

    // ensure that error is thrown when stopping the batch too in case users aren't calling .addObject
    expect(() => batching.stop()).toThrowError(clientErr);
  });
});
