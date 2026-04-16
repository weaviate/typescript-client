import { afterAll, beforeAll, expect, it } from 'vitest';
import { Collection, WeaviateClient } from '../../../src';
import weaviate from '../../../src/index.js';
import { TokenizeResult } from '../../../src/tokenize/types';
import { requireAtLeast } from '../../version';

requireAtLeast(1, 37, 0).describe('Collection tokenize integration tests', () => {
  let client: WeaviateClient;
  let collection: Collection;
  const collectionName = 'TestCollectionTokenization';

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    collection = await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: 'textProp',
          dataType: 'text',
          tokenization: 'word',
        },
      ],
    });
  });

  afterAll(async () => {
    await client.collections.delete(collectionName);
    await client.close();
  });

  it('should tokenize text with the tokenization config of a property and a non-generic collection', async () => {
    const tokens = await collection.tokenize.property('textProp', 'This is a test');
    expect(tokens).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['this', 'is', 'a', 'test'],
      query: ['this', 'is', 'a', 'test'],
    });
  });

  it('should tokenize text with the tokenization config of a property and a generic collection', async () => {
    type Props = {
      textProp: string;
    };
    const c = client.collections.use<string, Props, any>('TestCollectionTokenization');
    const tokens = await c.tokenize.property('textProp', 'This is a test');
    expect(tokens).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['this', 'is', 'a', 'test'],
      query: ['test'],
    });
  });
});
