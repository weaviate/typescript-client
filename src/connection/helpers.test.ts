import weaviate from '../index.js';
import { connectToWeaviateCloud } from './helpers.js';

const WCD_URL = 'https://piblpmmdsiknacjnm1ltla.c1.europe-west3.gcp.weaviate.cloud';
const WCD_KEY = 'cy4ua772mBlMdfw3YnclqAWzFhQt0RLIN0sl';

describe('Testing of the connection helper methods', () => {
  it('should connect to a WCS cluster', () => {
    return weaviate
      .connectToWeaviateCloud(WCD_URL, {
        authCredentials: new weaviate.ApiKey(WCD_KEY),
      })
      .then((client) => client.getMeta())
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  it('should connect to a local cluster', () => {
    return weaviate
      .connectToLocal()
      .then((client) => client.getMeta())
      .then((res: any) => {
        expect(res.version).toBeDefined();
      })
      .catch((e: any) => {
        throw new Error('it should not have errord: ' + e);
      });
  });

  describe('adds Weaviate Embedding Service headers', () => {
    it('to empty headers', async () => {
      const clientMakerMock = jest.fn().mockResolvedValue(undefined);

      await connectToWeaviateCloud(WCD_URL, clientMakerMock, {
        authCredentials: new weaviate.ApiKey(WCD_KEY),
      });

      expect(clientMakerMock.mock.calls[0][0].headers).toEqual({
        'X-Weaviate-Api-Key': WCD_KEY,
        'X-Weaviate-Cluster-Url': WCD_URL,
      });
    });

    it('to existing headers', async () => {
      const clientMakerMock = jest.fn().mockResolvedValue(undefined);

      await connectToWeaviateCloud(WCD_URL, clientMakerMock, {
        authCredentials: new weaviate.ApiKey(WCD_KEY),
        headers: { existingHeader: 'existingValue' },
      });

      expect(clientMakerMock.mock.calls[0][0].headers).toEqual({
        existingHeader: 'existingValue',
        'X-Weaviate-Api-Key': WCD_KEY,
        'X-Weaviate-Cluster-Url': WCD_URL,
      });
    });
  });

  describe('does not add Weaviate Embedding Service headers when not using API key', () => {
    it('to empty headers', async () => {
      const clientMakerMock = jest.fn().mockResolvedValue(undefined);

      await connectToWeaviateCloud(WCD_URL, clientMakerMock, {
        authCredentials: new weaviate.AuthUserPasswordCredentials({ username: 'test' }),
      });

      expect(clientMakerMock.mock.calls[0][0].headers).toBe(undefined);
    });

    it('to existing headers', async () => {
      const clientMakerMock = jest.fn().mockResolvedValue(undefined);

      await connectToWeaviateCloud(WCD_URL, clientMakerMock, {
        authCredentials: new weaviate.AuthUserPasswordCredentials({ username: 'test' }),
        headers: { existingHeader: 'existingValue' },
      });

      expect(clientMakerMock.mock.calls[0][0].headers).toEqual({ existingHeader: 'existingValue' });
    });
  });
});
