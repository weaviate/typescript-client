/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import weaviate, { WeaviateClient } from '../../../src/index';
import basicSchema from './schemas/basic.json';
import basicSchemaWithName from './schemas/basic_with_name.json';
import withDescriptionSchema from './schemas/withDescription.json';
import withMultiTenancySchema from './schemas/withMultiTenancy.json';
import withPropertiesSchema from './schemas/withProperties.json';
import withPropertiesMixedDataType from './schemas/withPropertiesMixedDataType.json';
import withVectorConfigSchema from './schemas/withVectorConfig.json';

import complexSchema from './schemas/complex.json';
import withExtraPropertySchema from './schemas/with_extra_property.json';

describe('Testing of the collections.createFromSchema method for backwards compatibility', () => {
  let client: WeaviateClient;
  let openai: WeaviateClient;

  beforeAll(async () => {
    client = await weaviate.connectToLocal({
      port: 8080,
      grpcPort: 50051,
    });
    openai = await weaviate.connectToLocal({
      port: 8086,
      grpcPort: 50051,
    });
  });

  afterAll(() => Promise.all([client.collections.deleteAll(), openai.collections.deleteAll()]));

  it('should create a collection using legacy {"class": "CollectionName"} format', async () => {
    console.log('basicSchema:', JSON.stringify(basicSchema, null, 2));
    const collection = await client.collections.createFromSchema(basicSchema);

    expect(collection.name).toEqual(basicSchema.class);
    const exists = await collection.exists();
    expect(exists).toEqual(true);

    const config = await collection.config.get();
    expect(config.name).toEqual(basicSchema.class);
  });

  it('should create a collection using {"name": "CollectionName"} format', async () => {
    console.log('basicSchemaWithName:', JSON.stringify(basicSchemaWithName, null, 2));
    const collection = await client.collections.createFromSchema(basicSchemaWithName);

    expect(collection.name).toEqual(basicSchemaWithName.name);
    const exists = await collection.exists();
    expect(exists).toEqual(true);

    const config = await collection.config.get();
    expect(config.name).toEqual(basicSchemaWithName.name);
  });

  it('should create a collection with description using legacy schema format', async () => {
    console.log('withDescriptionSchema:', JSON.stringify(withDescriptionSchema, null, 2));
    const collection = await client.collections.createFromSchema(withDescriptionSchema);

    expect(collection.name).toEqual(withDescriptionSchema.class);
    const config = await collection.config.get();
    expect(config.name).toEqual(withDescriptionSchema.class);
    expect(config.description).toEqual(withDescriptionSchema.description);
  });

  it('should create a collection with properties using legacy dataType array format', async () => {
    console.log('withPropertiesSchema:', JSON.stringify(withPropertiesSchema, null, 2));
    const collection = await client.collections.createFromSchema(withPropertiesSchema as any);

    expect(collection.name).toEqual(withPropertiesSchema.class);
    const config = await collection.config.get();

    expect(config.properties).toHaveLength(3);

    const textField = config.properties.find((p) => p.name === 'textField');
    expect(textField).toBeDefined();
    expect(textField?.dataType).toEqual('text');
    expect(textField?.indexFilterable).toEqual(true);
    expect(textField?.indexSearchable).toEqual(true);
    expect(textField?.tokenization).toEqual('field');

    const textArray = config.properties.find((p) => p.name === 'textArray');
    expect(textArray).toBeDefined();
    expect(textArray?.dataType).toEqual('text[]');
    expect(textArray?.tokenization).toEqual('word');

    const numberField = config.properties.find((p) => p.name === 'numberField');
    expect(numberField).toBeDefined();
    expect(numberField?.dataType).toEqual('number');
    expect(numberField?.indexFilterable).toEqual(true);
  });

  it('should create a collection with multi-tenancy using legacy multiTenancyConfig', async () => {
    console.log('withMultiTenancySchema:', JSON.stringify(withMultiTenancySchema, null, 2));
    const collection = await client.collections.createFromSchema(withMultiTenancySchema);

    expect(collection.name).toEqual(withMultiTenancySchema.class);
    const config = await collection.config.get();

    expect(config.multiTenancy).toBeDefined();
    expect(config.multiTenancy?.enabled).toEqual(true);
    expect(config.multiTenancy?.autoTenantCreation).toEqual(true);
    expect(config.multiTenancy?.autoTenantActivation).toEqual(true);
  });

  it('should create a collection with vectorConfig using legacy format', async () => {
    console.log('withVectorConfigSchema:', JSON.stringify(withVectorConfigSchema, null, 2));
    const collection = await openai.collections.createFromSchema(withVectorConfigSchema);

    expect(collection.name).toEqual(withVectorConfigSchema.class);
    const config = await collection.config.get();

    expect(config.vectorizers).toBeDefined();
    expect(config.vectorizers.namedVector1).toBeDefined();
    expect(config.vectorizers.namedVector1.vectorizer.name).toEqual('text2vec-openai');
    expect(config.vectorizers.namedVector1.indexType).toEqual('hnsw');
    expect(config.vectorizers.namedVector1.properties).toEqual(['content']);
  });

  it('should create a complex collection with all legacy schema features combined', async () => {
    console.log('complexSchema:', JSON.stringify(complexSchema, null, 2));
    const collection = await openai.collections.createFromSchema(complexSchema);

    expect(collection.name).toEqual(complexSchema.class);
    const exists = await collection.exists();
    expect(exists).toEqual(true);

    const config = await collection.config.get();

    // Verify basic config
    expect(config.name).toEqual(complexSchema.class);
    expect(config.description).toEqual(complexSchema.description);

    // Verify properties
    expect(config.properties).toHaveLength(3);
    const title = config.properties.find((p) => p.name === 'title');
    const tags = config.properties.find((p) => p.name === 'tags');

    expect(title?.dataType).toEqual('text');
    expect(title?.tokenization).toEqual('field');
    expect(tags?.dataType).toEqual('text[]');
    expect(tags?.tokenization).toEqual('word');

    // Verify vector config
    expect(config.vectorizers.mainVector).toBeDefined();
    expect(config.vectorizers.mainVector.vectorizer.name).toEqual('text2vec-openai');
    expect(config.vectorizers.mainVector.indexType).toEqual('hnsw');
    expect(config.vectorizers.mainVector.properties).toEqual(['title', 'tags']);

    // Verify multi-tenancy
    expect(config.multiTenancy?.enabled).toEqual(true);
    expect(config.multiTenancy?.autoTenantCreation).toEqual(true);
    expect(config.multiTenancy?.autoTenantActivation).toEqual(true);
  });

  it('should handle properties with extra fields without breaking dataType', async () => {
    console.log('withExtraPropertySchema:', JSON.stringify(withExtraPropertySchema, null, 2));
    const collection = await client.collections.createFromSchema(withExtraPropertySchema);

    expect(collection.name).toEqual(withExtraPropertySchema.class);
    const config = await collection.config.get();

    // Verify that dataType is NOT double-wrapped
    const title = config.properties.find((p) => p.name === 'title');
    expect(title?.dataType).toEqual('text');
    expect(title?.dataType).not.toEqual(['text']);
  });

  it('should handle legacy schema with dataType arrays in collections.create', async () => {
    // This tests the fix for double-wrapping dataType arrays
    // When passing legacy format with dataType as array, it should not be double-wrapped
    const collection = await client.collections.create({
      name: 'TestLegacyDataTypeArray',
      properties: [
        {
          name: 'title',
          dataType: ['text'] as any, // Legacy format - already an array
        },
      ],
    });

    const config = await collection.config.get();
    const title = config.properties.find((p) => p.name === 'title');
    expect(title?.dataType).toEqual('text'); // Should be string, not array
  });

  it('should create a collection with properties where dataType can be string or array', async () => {
    console.log('withPropertiesMixedDataType:', JSON.stringify(withPropertiesMixedDataType, null, 2));
    const collection = await client.collections.createFromSchema(withPropertiesMixedDataType as any);

    expect(collection.name).toEqual(withPropertiesMixedDataType.class);
    const config = await collection.config.get();

    expect(config.properties).toHaveLength(3);

    // textField has dataType as string (not array)
    const textField = config.properties.find((p) => p.name === 'textField');
    expect(textField).toBeDefined();
    expect(textField?.dataType).toEqual('text');
    expect(textField?.indexFilterable).toEqual(true);
    expect(textField?.indexSearchable).toEqual(true);
    expect(textField?.tokenization).toEqual('field');

    // textArray has dataType as array
    const textArray = config.properties.find((p) => p.name === 'textArray');
    expect(textArray).toBeDefined();
    expect(textArray?.dataType).toEqual('text[]');
    expect(textArray?.tokenization).toEqual('word');

    // numberField has dataType as array
    const numberField = config.properties.find((p) => p.name === 'numberField');
    expect(numberField).toBeDefined();
    expect(numberField?.dataType).toEqual('number');
    expect(numberField?.indexFilterable).toEqual(true);
  });
});
