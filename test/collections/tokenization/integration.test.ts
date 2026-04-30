/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterAll, beforeAll, expect } from 'vitest';
import weaviate, { WeaviateClient } from '../../../src/index.js';
import { requireAtLeast } from '../../version.js';

const { describe, it } = requireAtLeast(1, 37, 2);

describe('Tokenization v1.37: schema config round-trip', () => {
  let client: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
  });

  afterAll(async () => {
    // Only clean up collections this suite owns; deleteAll() races with
    // sibling integration tests that share the same Weaviate instance.
    await client.collections.delete('TestTokenizationRoundTrip').catch(() => {});
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
