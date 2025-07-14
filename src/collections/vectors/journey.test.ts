/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { requireAtLeast } from '../../../test/version.js';
import weaviate, {
  VectorIndexConfigHNSW,
  WeaviateClient,
  WeaviateField,
  WeaviateGenericObject,
} from '../../index.js';
import { Collection } from '../collection/index.js';
import { MultiVectorType, SingleVectorType } from '../query/types.js';

requireAtLeast(1, 29, 0).describe(
  'Testing of the collection.query methods with a collection with multvectors',
  () => {
    let client: WeaviateClient;
    let collection: Collection<undefined, string, MyVectors>;
    const collectionName = 'TestCollectionQueryWithMultiVectors';

    let id1: string;
    let id2: string;

    let singleVector: SingleVectorType;
    let multiVector: MultiVectorType;

    type MyVectors = {
      regular: SingleVectorType;
      colbert: MultiVectorType;
    };

    afterAll(() => {
      return client.collections.delete(collectionName).catch((err) => {
        console.error(err);
        throw err;
      });
    });

    beforeAll(async () => {
      client = await weaviate.connectToLocal();
      collection = client.collections.use(collectionName);
    });

    afterAll(() => client.collections.delete(collectionName));

    it('should be able to create a collection including multivectors', async () => {
      collection = await client.collections.create({
        name: collectionName,
        vectorizers: [
          weaviate.configure.multiVectors.selfProvided({
            name: 'regular',
          }),
          weaviate.configure.multiVectors.selfProvided({
            name: 'colbert',
          }),
        ],
      });
    });

    it('should be able to get the config of the created collection', async () => {
      const config = await collection.config.get();
      expect(config.vectorizers.regular).toBeDefined();
      expect(config.vectorizers.colbert).toBeDefined();
      expect((config.vectorizers.regular.indexConfig as VectorIndexConfigHNSW).multiVector).toBeUndefined();
      expect((config.vectorizers.colbert.indexConfig as VectorIndexConfigHNSW).multiVector).toBeDefined();
    });

    it('should be able to insert one object with multiple multivectors', async () => {
      id1 = await collection.data.insert({
        vectors: {
          regular: [1, 2, 3, 4],
          colbert: [
            [1, 2],
            [3, 4],
          ],
        },
      });
    });

    it('should be able to get the inserted object with its vectors stated implicitly', async () => {
      const obj = await collection.query.fetchObjectById(id1, { includeVector: true });
      const assert = (obj: any): obj is WeaviateGenericObject<Record<string, WeaviateField>, MyVectors> => {
        expect(obj).not.toBeNull();
        return true;
      };
      if (assert(obj)) {
        singleVector = obj.vectors.regular;
        multiVector = obj.vectors.colbert;
        expect(obj.uuid).toBe(id1);
        expect(obj.vectors).toBeDefined();
        expect(obj.vectors.regular).toEqual([1, 2, 3, 4]);
        expect(obj.vectors.colbert).toEqual([
          [1, 2],
          [3, 4],
        ]);
      }
    });

    it('should be able to get the inserted object with its vectors stated explicitly', async () => {
      const obj = await collection.query.fetchObjectById(id1, { includeVector: ['regular', 'colbert'] });
      const assert = (obj: any): obj is WeaviateGenericObject<Record<string, WeaviateField>, MyVectors> => {
        expect(obj).not.toBeNull();
        return true;
      };
      if (assert(obj)) {
        singleVector = obj.vectors.regular;
        multiVector = obj.vectors.colbert;
        expect(obj.uuid).toBe(id1);
        expect(obj.vectors).toBeDefined();
        expect(obj.vectors.regular).toEqual([1, 2, 3, 4]);
        expect(obj.vectors.colbert).toEqual([
          [1, 2],
          [3, 4],
        ]);
      }
    });

    it('should be able to get the inserted object with one of its vectors', async () => {
      const obj = await collection.query.fetchObjectById(id1, { includeVector: ['regular'] });
      singleVector = obj?.vectors.regular!;
      expect(obj?.uuid).toBe(id1);
      expect(obj?.vectors).toBeDefined();
      expect(obj?.vectors.regular).toEqual([1, 2, 3, 4]);
      expect((obj?.vectors as MyVectors).colbert).toBeUndefined();
    });

    it('should be able to query with hybrid for the inserted object over the single vector space', async () => {
      const result = await collection.query.hybrid('', {
        alpha: 1,
        vector: singleVector,
        targetVector: ['regular'],
      });
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });

    it('should be able to query with hybrid for the inserted object over the multi vector space', async () => {
      const result = await collection.query.hybrid('', {
        alpha: 1,
        vector: multiVector,
        targetVector: ['colbert'],
      });
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });

    it('should be able to query with hybrid for the inserted object over both spaces simultaneously', async () => {
      const result = await collection.query.hybrid('', {
        alpha: 1,
        vector: { regular: singleVector, colbert: multiVector },
        targetVector: collection.multiTargetVector.sum(['regular', 'colbert']),
      });
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });

    it('should be able to query with nearVector for the inserted object over the single vector space', async () => {
      const result = await collection.query.nearVector(singleVector, {
        certainty: 0.5,
        targetVector: ['regular'],
      });
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });

    it('should be able to query with nearVector for the inserted object over the multi vector space', async () => {
      const result = await collection.query.nearVector(multiVector, {
        certainty: 0.5,
        targetVector: ['colbert'],
      });
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });

    it('should be able to query with nearVector for the inserted object over both spaces simultaneously', async () => {
      const result = await collection.query.nearVector(
        { regular: singleVector, colbert: multiVector },
        { targetVector: collection.multiTargetVector.sum(['regular', 'colbert']) }
      );
      expect(result.objects.length).toBe(1);
      expect(result.objects[0].uuid).toBe(id1);
    });
  }
);
