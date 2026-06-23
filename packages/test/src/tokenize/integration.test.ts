import { WeaviateInvalidInputError } from '@weaviate/core/errors.js';
import { TokenizeResult } from '@weaviate/core/tokenize/types.js';
import weaviate, { WeaviateClient } from '@weaviate/node';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { requireAtLeast } from '../version.js';

requireAtLeast(1, 37, 0).describe('client tokenize integration test', () => {
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

requireAtLeast(1, 37, 2).describe('tokenize stopwords / stopwordPresets', () => {
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

describe('collection tokenization: schema config round-trip', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
  });

  afterAll(async () => {
    // Only clean up collections this suite owns; deleteAll() races with
    // sibling integration tests that share the same Weaviate instance.
    await client.collections.delete('TestTokenizationRoundTrip').catch(() => {});
    await client.collections.delete('TestTokenizationRoundTripErgonomic').catch(() => {});
    await client.close();
  });

  it('round-trips invertedIndex.stopwordPresets and per-property textAnalyzer through collection.config.get()', async () => {
    const collectionName = 'TestTokenizationRoundTrip';
    await client.collections.delete(collectionName).catch(() => {});

    await client.collections.create({
      name: collectionName,
      invertedIndex: {
        stopwordPresets: {
          fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et'],
        },
      },
      properties: [
        {
          name: 'name_en',
          dataType: 'text' as const,
          tokenization: 'word' as const,
          textAnalyzer: { stopwordPreset: 'en' },
        },
        {
          name: 'name_fr',
          dataType: 'text' as const,
          tokenization: 'word' as const,
          textAnalyzer: { stopwordPreset: 'fr' },
        },
        {
          name: 'description',
          dataType: 'text' as const,
          tokenization: 'word' as const,
          // Same union shape the tokenize endpoint accepts.
          textAnalyzer: { asciiFold: { ignore: ['é'] } },
        },
      ],
      vectorizers: weaviate.configure.vectors.selfProvided(),
    });

    // Insert + query end-to-end so the user-facing surface is exercised
    // beyond just the schema serializer.
    const collection = client.collections.use(collectionName);
    await collection.data.insertMany([
      {
        name_en: 'The Blue Cup and the Bowl',
        name_fr: 'La Tasse Bleue et le Bol',
        description: 'Café au lait',
      },
      {
        name_en: 'A Red Plate with the Saucer',
        name_fr: 'Une Assiette Rouge avec la Soucoupe',
        description: 'Crème brûlée',
      },
    ]);

    const config = await collection.config.get();

    // Collection-level preset library is round-tripped verbatim
    expect(config.invertedIndex.stopwordPresets).toEqual({
      fr: ['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et'],
    });

    // Per-property textAnalyzer is also round-tripped through PropertyConfig.
    // The deserializer translates the wire flat shape (asciiFold + asciiFoldIgnore)
    // back into the user-facing union shape (asciiFold: { ignore: [...] }).
    const enProp = config.properties.find((p) => p.name === 'name_en')!;
    const frProp = config.properties.find((p) => p.name === 'name_fr')!;
    const descProp = config.properties.find((p) => p.name === 'description')!;

    expect(enProp.textAnalyzer?.stopwordPreset).toBe('en');
    expect(frProp.textAnalyzer?.stopwordPreset).toBe('fr');
    expect(descProp.textAnalyzer?.asciiFold).toEqual({ ignore: ['é'] });
  });

  it('round-trips textAnalyzer when configured via the ergonomic asciiFold object form', async () => {
    const collectionName = 'TestTokenizationRoundTripErgonomic';
    await client.collections.delete(collectionName).catch(() => {});

    await client.collections.create({
      name: collectionName,
      properties: [
        {
          name: 'description',
          dataType: 'text' as const,
          tokenization: 'word' as const,
          // Same shorthand the tokenize endpoint accepts — should produce the
          // same wire payload and the same read-back value as the example above.
          textAnalyzer: { asciiFold: { ignore: ['é'] } },
        },
      ],
      vectorizers: weaviate.configure.vectors.selfProvided(),
    });

    const config = await client.collections.use(collectionName).config.get();
    const descProp = config.properties.find((p) => p.name === 'description')!;
    expect(descProp.textAnalyzer?.asciiFold).toEqual({ ignore: ['é'] });

    await client.collections.delete(collectionName);
  });
});
