import { beforeAll, expect, it } from 'vitest';
import { WeaviateInvalidInputError } from '../../src/errors.js';
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
      indexed: ['buna', 'dimineața', 'lume'],
      query: ['buna', 'dimineața', 'lume'],
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
      indexed: ['buna', 'dimineata', 'lume'],
      query: ['buna', 'dimineata', 'lume'],
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
      indexed: ['this', 'is', 'a', 'test'],
      query: ['this', 'is', 'a', 'test'],
    });
  });
});

requireAtLeast(1, 37, 2).describe('tokenize stopwords / stopwordPresets (>= 1.37.2)', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
  });

  it('applies a one-off stopwords block with preset + additions', async () => {
    const result = await client.tokenize.text('the quick brown fox', 'word', {
      stopwords: { preset: 'en', additions: ['quick'] },
    });
    expect(result).toEqual<TokenizeResult>({
      indexed: ['the', 'quick', 'brown', 'fox'],
      query: ['brown', 'fox'],
    });
  });

  it('applies a one-off stopwords block with additions only (server defaults preset to en)', async () => {
    const result = await client.tokenize.text('the quick hello world', 'word', {
      stopwords: { additions: ['hello'] },
    });
    expect(result).toEqual<TokenizeResult>({
      indexed: ['the', 'quick', 'hello', 'world'],
      query: ['quick', 'world'],
    });
  });

  it('applies a one-off stopwords block with removals only (server defaults preset to en)', async () => {
    const result = await client.tokenize.text('the quick is fast', 'word', {
      stopwords: { removals: ['the'] },
    });
    expect(result).toEqual<TokenizeResult>({
      indexed: ['the', 'quick', 'is', 'fast'],
      query: ['the', 'quick', 'fast'],
    });
  });

  it('resolves a stopwordPresets entry referenced by analyzerConfig.stopwordPreset', async () => {
    const result = await client.tokenize.text('hello world test', 'word', {
      analyzerConfig: { stopwordPreset: 'custom' },
      stopwordPresets: { custom: ['test'] },
    });
    expect(result).toEqual<TokenizeResult>({
      indexed: ['hello', 'world', 'test'],
      query: ['hello', 'world'],
    });
  });

  it('overrides a built-in preset by reusing its name in stopwordPresets', async () => {
    const result = await client.tokenize.text('the quick hello world', 'word', {
      stopwordPresets: { en: ['hello'] },
    });
    expect(result).toEqual<TokenizeResult>({
      indexed: ['the', 'quick', 'hello', 'world'],
      query: ['the', 'quick', 'world'],
    });
  });

  it('rejects passing both stopwords and stopwordPresets client-side', async () => {
    await expect(
      client.tokenize.text('hello', 'word', {
        stopwords: { preset: 'en' },
        stopwordPresets: { custom: ['hello'] },
      })
    ).rejects.toThrow(WeaviateInvalidInputError);
  });
});
