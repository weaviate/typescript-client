import { beforeAll, expect, it } from 'vitest';
import weaviate, { WeaviateClient } from '../../src/index.js';
import { TokenizeResult } from '../../src/tokenize/types.js';
import { requireAtLeast } from '../version.js';

requireAtLeast(1, 37, 0).describe('tokenize integration test', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
  });

  it('should tokenize text without configs', async () => {
    const result = await client.tokenize.text('Hello world', 'word');
    expect(result).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['hello', 'world'],
      query: ['hello', 'world'],
    });
  });

  it('should tokenize text with ignore', async () => {
    const result = await client.tokenize.text('Bună dimineața, lume', 'word', {
      analyzerConfig: {
        asciiFold: {
          ignore: ['ț'],
        },
        stopwordPreset: 'en',
      },
    });
    expect(result).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['buna', 'dimineața', 'lume'],
      query: ['buna', 'dimineața', 'lume'],
      analyzerConfig: {
        asciiFold: {
          ignore: ['ț'],
        },
        stopwordPreset: 'en',
      },
    });
  });

  it('should tokenize text without ignore', async () => {
    const result = await client.tokenize.text('Bună dimineața, lume', 'word', {
      analyzerConfig: {
        asciiFold: true,
        stopwordPreset: 'en',
      },
    });
    expect(result).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['buna', 'dimineata', 'lume'],
      query: ['buna', 'dimineata', 'lume'],
      analyzerConfig: {
        asciiFold: true,
        stopwordPreset: 'en',
      },
    });
  });

  it('should tokenize text with the tokenization config of a property and default stopwords', async () => {
    const c = await client.collections.create({
      name: 'TestPropertyTokenizeEnStopwords',
      properties: [
        {
          name: 'textProp',
          dataType: 'text',
          tokenization: 'word',
        },
      ],
    });
    const conf = await c.config.get();
    const tokens = await client.tokenize.forProperty(conf.name, conf.properties[0].name, 'This is a test');
    expect(tokens).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['this', 'is', 'a', 'test'],
      query: ['test'],
    });
  });

  it('should tokenize text with the tokenization config of a property and no stopwords', async () => {
    const c = await client.collections.create({
      name: 'TestPropertyTokenizeNoneStopwords',
      properties: [
        {
          name: 'textProp',
          dataType: 'text',
          tokenization: 'word',
        },
      ],
      invertedIndex: { stopwords: { preset: 'none' } },
    });
    const conf = await c.config.get();
    const tokens = await client.tokenize.forProperty(conf.name, conf.properties[0].name, 'This is a test');
    expect(tokens).toEqual<TokenizeResult>({
      tokenization: 'word',
      indexed: ['this', 'is', 'a', 'test'],
      query: ['this', 'is', 'a', 'test'],
    });
  });
});
