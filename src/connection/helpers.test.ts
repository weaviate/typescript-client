import { ApiKey } from '.';
import { connectToWCS } from './helpers';

describe('Testing of the connection helper methods', () => {
  const collectionName = 'MyHelperConnectionsTestCollection';
  it('should connect to a WCS cluster using REST', () => {
    connectToWCS('https://grpc-web-testing-832t1mjs.weaviate.network', {
      authCredentials: new ApiKey('X8FEXBFBaHVRmDix9FgVHwoSfslD40FTc61b'),
    })
      .then((client) => client.getMeta())
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('should connect to a WCS cluster using gRPC', () => {
    return connectToWCS('https://grpc-web-testing-832t1mjs.weaviate.network', {
      authCredentials: new ApiKey('X8FEXBFBaHVRmDix9FgVHwoSfslD40FTc61b'),
    })
      .then((client) => {
        return client.collections
          .delete(collectionName)
          .then(() =>
            client.collections.create({
              name: collectionName,
            })
          )
          .then(() => client.collections.get(collectionName).query.fetchObjects());
      })
      .then((res) => {
        expect(res.objects.length).toEqual(0);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });
});
