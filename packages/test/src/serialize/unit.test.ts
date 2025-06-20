import { Filters as FiltersFactory } from '@weaviate/core/filters/classes';
import filter from '@weaviate/core/filters';
import {
  SearchBm25Args,
  SearchFetchArgs,
  SearchHybridArgs,
  SearchNearAudioArgs,
  SearchNearDepthArgs,
  SearchNearIMUArgs,
  SearchNearImageArgs,
  SearchNearObjectArgs,
  SearchNearTextArgs,
  SearchNearThermalArgs,
  SearchNearVectorArgs,
  SearchNearVideoArgs,
} from '@weaviate/core/grpc/searcher';
import { Filters, Filters_Operator } from '@weaviate/core/proto/v1/base';
import {
  BM25,
  CombinationMethod,
  Hybrid,
  Hybrid_FusionType,
  NearAudioSearch,
  NearDepthSearch,
  NearIMUSearch,
  NearImageSearch,
  NearObject,
  NearTextSearch,
  NearTextSearch_Move,
  NearThermalSearch,
  NearVector,
  NearVideoSearch,
  Targets,
} from '@weaviate/core/proto/v1/base_search';
import { GenerativeSearch } from '@weaviate/core/proto/v1/generative';
import { GroupBy, MetadataRequest, PropertiesRequest } from '@weaviate/core/proto/v1/search_get';
import { TargetVectorInputType } from '@weaviate/core/query/types';
import { Reference } from '@weaviate/core/references';
import sort from '@weaviate/core/sort';
import { WeaviateField } from '@weaviate/core/types';
import multiTargetVector from '@weaviate/core/vectors/multiTargetVector';
import { DataGuards, Serialize } from '@weaviate/core/serialize';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Unit testing of Serialize', () => {
  it('should parse args for fetchObjects', () => {
    const args = Serialize.search.fetchObjects({
      limit: 1,
      offset: 0,
      after: 'one',
      filters: filter<any>().byProperty('name').equal('test'),
      sort: sort<any>().byProperty('name'),
      includeVector: true,
      returnMetadata: 'all',
      returnProperties: ['name'],
      returnReferences: [{ linkOn: 'ref' }],
    });
    expect(args).toEqual<SearchFetchArgs>({
      limit: 1,
      offset: 0,
      after: 'one',
      filters: Filters.fromPartial({
        operator: Filters_Operator.OPERATOR_EQUAL,
        target: {
          property: 'name',
        },
        valueText: 'test',
      }),
      sortBy: [{ ascending: true, path: ['name'] }],
      metadata: MetadataRequest.fromPartial({
        certainty: true,
        distance: true,
        uuid: true,
        vector: true,
        vectors: undefined,
        creationTimeUnix: true,
        lastUpdateTimeUnix: true,
        isConsistent: true,
        explainScore: true,
        score: true,
      }),
      properties: PropertiesRequest.fromPartial({
        nonRefProperties: ['name'],
        refProperties: [
          {
            metadata: MetadataRequest.fromPartial({ uuid: true }),
            properties: PropertiesRequest.fromPartial({ returnAllNonrefProperties: true }),
            referenceProperty: 'ref',
            targetCollection: '',
          },
        ],
      }),
    });
  });

  it('should parse args for fetchObjectById', () => {
    const args = Serialize.search.fetchObjectById({
      id: '1',
      includeVector: ['title'],
      returnProperties: ['name'],
      returnReferences: [{ linkOn: 'ref' }],
    });
    expect(args).toEqual<SearchFetchArgs>({
      filters: Filters.fromPartial({
        operator: Filters_Operator.OPERATOR_EQUAL,
        target: {
          property: '_id',
        },
        valueText: '1',
      }),
      metadata: MetadataRequest.fromPartial({
        creationTimeUnix: true,
        lastUpdateTimeUnix: true,
        isConsistent: true,
        uuid: true,
        vectors: ['title'],
      }),
      properties: PropertiesRequest.fromPartial({
        nonRefProperties: ['name'],
        refProperties: [
          {
            metadata: MetadataRequest.fromPartial({ uuid: true }),
            properties: PropertiesRequest.fromPartial({ returnAllNonrefProperties: true }),
            referenceProperty: 'ref',
            targetCollection: '',
          },
        ],
      }),
    });
  });

  it('should parse args for bm25', () => {
    const args = Serialize.search.bm25('test', {
      queryProperties: ['name'],
      autoLimit: 1,
    });
    expect(args).toEqual<SearchBm25Args>({
      bm25Search: BM25.fromPartial({
        query: 'test',
        properties: ['name'],
      }),
      autocut: 1,
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for simple hybrid', () => {
    const args = Serialize.search.hybrid(
      {
        query: 'test',
        supportsTargets: false,
        supportsVectorsForTargets: false,
        supportsWeightsForTargets: false,
      },
      {
        queryProperties: ['name'],
        alpha: 0.6,
        vector: [1, 2, 3],
        targetVector: 'title',
        fusionType: 'Ranked',
        maxVectorDistance: 0.4,
      }
    );
    expect(args).toEqual<SearchHybridArgs>({
      hybridSearch: Hybrid.fromPartial({
        query: 'test',
        properties: ['name'],
        alpha: 0.6,
        vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer),
        targetVectors: ['title'],
        fusionType: Hybrid_FusionType.FUSION_TYPE_RANKED,
        vectorDistance: 0.4,
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for multi-vector & multi-target hybrid', () => {
    const args = Serialize.search.hybrid(
      {
        query: 'test',
        supportsTargets: true,
        supportsVectorsForTargets: true,
        supportsWeightsForTargets: true,
      },
      {
        queryProperties: ['name'],
        alpha: 0.6,
        vector: {
          title: [
            [1, 2, 3],
            [4, 5, 6],
          ],
          description: [7, 8, 9],
        },
        targetVector: multiTargetVector().manualWeights({ title: [0.5, 0.5], description: 0.5 }),
        fusionType: 'Ranked',
      }
    );
    expect(args).toEqual<SearchHybridArgs>({
      hybridSearch: Hybrid.fromPartial({
        query: 'test',
        properties: ['name'],
        alpha: 0.6,
        nearVector: NearVector.fromPartial({
          vectorForTargets: [
            { name: 'title', vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer) },
            { name: 'title', vectorBytes: new Uint8Array(new Float32Array([4, 5, 6]).buffer) },
            { name: 'description', vectorBytes: new Uint8Array(new Float32Array([7, 8, 9]).buffer) },
          ],
        }),
        targets: Targets.fromPartial({
          combination: CombinationMethod.COMBINATION_METHOD_TYPE_MANUAL,
          targetVectors: ['title', 'title', 'description'],
          weightsForTargets: [
            {
              target: 'title',
              weight: 0.5,
            },
            {
              target: 'title',
              weight: 0.5,
            },
            {
              target: 'description',
              weight: 0.5,
            },
          ],
        }),
        fusionType: Hybrid_FusionType.FUSION_TYPE_RANKED,
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearAudio', () => {
    const args = Serialize.search.nearAudio(
      {
        audio: 'audio',
        supportsTargets: false,
        supportsWeightsForTargets: false,
      },
      {
        certainty: 0.6,
        distance: 0.4,
        targetVector: 'audio',
      }
    );
    expect(args).toEqual<SearchNearAudioArgs>({
      nearAudio: NearAudioSearch.fromPartial({
        audio: 'audio',
        certainty: 0.6,
        distance: 0.4,
        targetVectors: ['audio'],
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearDepth', () => {
    const args = Serialize.search.nearDepth({
      depth: 'depth',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearDepthArgs>({
      nearDepth: NearDepthSearch.fromPartial({
        depth: 'depth',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearIMU', () => {
    const args = Serialize.search.nearIMU({
      imu: 'imu',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearIMUArgs>({
      nearIMU: NearIMUSearch.fromPartial({
        imu: 'imu',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearImage', () => {
    const args = Serialize.search.nearImage({
      image: 'image',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearImageArgs>({
      nearImage: NearImageSearch.fromPartial({
        image: 'image',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearObject', () => {
    const args = Serialize.search.nearObject({
      id: 'id',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearObjectArgs>({
      nearObject: NearObject.fromPartial({
        id: 'id',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearText', () => {
    const args = Serialize.search.nearText(
      {
        query: 'test',
        supportsTargets: false,
        supportsWeightsForTargets: false,
      },
      {
        moveAway: {
          objects: ['0'],
          concepts: ['bad'],
          force: 0.4,
        },
        moveTo: {
          objects: ['1'],
          concepts: ['good'],
          force: 0.6,
        },
      }
    );
    expect(args).toEqual<SearchNearTextArgs>({
      nearText: NearTextSearch.fromPartial({
        query: ['test'],
        moveAway: NearTextSearch_Move.fromPartial({
          uuids: ['0'],
          concepts: ['bad'],
          force: 0.4,
        }),
        moveTo: NearTextSearch_Move.fromPartial({
          uuids: ['1'],
          concepts: ['good'],
          force: 0.6,
        }),
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearThermal', () => {
    const args = Serialize.search.nearThermal({
      thermal: 'thermal',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearThermalArgs>({
      nearThermal: NearThermalSearch.fromPartial({
        thermal: 'thermal',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVector with single vector', () => {
    const args = Serialize.search.nearVector({
      vector: [1, 2, 3],
      supportsTargets: false,
      supportsVectorsForTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearVectorArgs>({
      nearVector: NearVector.fromPartial({
        vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer),
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVector with two named vectors and supportsTargets (<1.27.0)', () => {
    const args = Serialize.search.nearVector({
      vector: {
        a: [1, 2, 3],
        b: [4, 5, 6],
      },
      supportsTargets: true,
      supportsVectorsForTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearVectorArgs>({
      nearVector: NearVector.fromPartial({
        vectorPerTarget: {
          a: new Uint8Array(new Float32Array([1, 2, 3]).buffer),
          b: new Uint8Array(new Float32Array([4, 5, 6]).buffer),
        },
        targets: { targetVectors: ['a', 'b'] },
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVector with two named vectors and all supports (==1.27.x)', () => {
    const args = Serialize.search.nearVector({
      vector: {
        a: [
          [1, 2, 3],
          [4, 5, 6],
        ],
        b: [7, 8, 9],
      },
      supportsTargets: true,
      supportsVectorsForTargets: true,
      supportsWeightsForTargets: true,
    });
    expect(args).toEqual<SearchNearVectorArgs>({
      nearVector: NearVector.fromPartial({
        vectorForTargets: [
          { name: 'a', vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer) },
          { name: 'a', vectorBytes: new Uint8Array(new Float32Array([4, 5, 6]).buffer) },
          { name: 'b', vectorBytes: new Uint8Array(new Float32Array([7, 8, 9]).buffer) },
        ],
        targets: { targetVectors: ['a', 'a', 'b'] },
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVideo', () => {
    const args = Serialize.search.nearVideo({
      video: 'video',
      supportsTargets: false,
      supportsWeightsForTargets: false,
    });
    expect(args).toEqual<SearchNearVideoArgs>({
      nearVideo: NearVideoSearch.fromPartial({
        video: 'video',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for generative', async () => {
    const args = await Serialize.generative({ supportsSingleGrouped: false }, (any) => Promise.resolve(''), {
      singlePrompt: 'test',
      groupedProperties: ['name'],
      groupedTask: 'testing',
    });
    expect(args).toEqual<GenerativeSearch>({
      singleResponsePrompt: 'test',
      groupedProperties: ['name'],
      groupedResponseTask: 'testing',
      single: undefined,
      grouped: undefined,
    });
  });

  it('should parse args for groupBy', () => {
    const args = Serialize.search.groupBy({
      property: 'name',
      numberOfGroups: 1,
      objectsPerGroup: 2,
    });
    expect(args).toEqual<GroupBy>({
      path: ['name'],
      numberOfGroups: 1,
      objectsPerGroup: 2,
    });
  });

  it('should parse args for isGroupBy', () => {
    const isGroupBy = Serialize.search.isGroupBy({
      groupBy: {
        property: 'name',
        numberOfGroups: 1,
        objectsPerGroup: 2,
      },
    });
    const isNotGroupBy = Serialize.search.isGroupBy({});
    expect(isGroupBy).toEqual(true);
    expect(isNotGroupBy).toEqual(false);
  });

  it('should parse args for restProperties', () => {
    const args = Serialize.restProperties(
      {
        name: 'John',
        age: 30,
        height: 1.8,
        isHappy: true,
        birthday: new Date(),
        namedays: [new Date(), new Date()],
        location: {
          latitude: 1,
          longitude: 1,
        },
        phoneNumber: {
          number: '+44 1234 567890',
        },
        clothing: [
          {
            type: 'shirt',
            color: 'blue',
            whenMade: new Date(),
          },
          {
            type: 'pants',
            color: 'black',
            whenMade: new Date(),
          },
        ],
        mindset: {
          hopeful: true,
          optimistic: true,
        },
      },
      {
        str: '1',
        strs: ['2', '3'],
        typeStr: {
          targetCollection: 'A',
          uuids: '4',
        },
        typesStr: [
          {
            targetCollection: 'B',
            uuids: '5',
          },
          {
            targetCollection: 'C',
            uuids: '6',
          },
        ],
        typeStrs: {
          targetCollection: 'D',
          uuids: ['7', '8'],
        },
        typesStrs: [
          {
            targetCollection: 'E',
            uuids: ['9', '10'],
          },
          {
            targetCollection: 'F',
            uuids: ['11', '12'],
          },
        ],
        mngrStrSngl: Reference.to('13'),
        mngrsStrSngl: [Reference.to('14'), Reference.to('15')],
        mngrStrMlt: Reference.toMultiTarget('16', 'G'),
        mngrsStrMlt: [Reference.toMultiTarget(['17', '18'], 'H'), Reference.toMultiTarget(['19', '20'], 'I')],
        mngrStrsSngl: Reference.to(['21', '22']),
        mngrsStrsSngl: [Reference.to(['23', '24']), Reference.to(['25', '26'])],
        mngrStrsMlt: Reference.toMultiTarget(['27', '28'], 'J'),
        mngrsStrsMlt: [
          Reference.toMultiTarget(['29', '30'], 'K'),
          Reference.toMultiTarget(['31', '32'], 'L'),
        ],
      }
    );
    expect(args).toEqual({
      name: 'John',
      age: 30,
      height: 1.8,
      isHappy: true,
      birthday: expect.any(String),
      namedays: [expect.any(String), expect.any(String)],
      location: {
        latitude: 1,
        longitude: 1,
      },
      phoneNumber: {
        input: '+44 1234 567890',
      },
      clothing: [
        {
          type: 'shirt',
          color: 'blue',
          whenMade: expect.any(String),
        },
        {
          type: 'pants',
          color: 'black',
          whenMade: expect.any(String),
        },
      ],
      mindset: {
        hopeful: true,
        optimistic: true,
      },
      str: [{ beacon: 'weaviate://localhost/1' }],
      strs: [{ beacon: 'weaviate://localhost/2' }, { beacon: 'weaviate://localhost/3' }],
      typeStr: [{ beacon: 'weaviate://localhost/A/4' }],
      typesStr: [{ beacon: 'weaviate://localhost/B/5' }, { beacon: 'weaviate://localhost/C/6' }],
      typeStrs: [{ beacon: 'weaviate://localhost/D/7' }, { beacon: 'weaviate://localhost/D/8' }],
      typesStrs: [
        { beacon: 'weaviate://localhost/E/9' },
        { beacon: 'weaviate://localhost/E/10' },
        { beacon: 'weaviate://localhost/F/11' },
        { beacon: 'weaviate://localhost/F/12' },
      ],
      mngrStrSngl: [{ beacon: 'weaviate://localhost/13' }],
      mngrsStrSngl: [{ beacon: 'weaviate://localhost/14' }, { beacon: 'weaviate://localhost/15' }],
      mngrStrMlt: [{ beacon: 'weaviate://localhost/G/16' }],
      mngrsStrMlt: [
        { beacon: 'weaviate://localhost/H/17' },
        { beacon: 'weaviate://localhost/H/18' },
        { beacon: 'weaviate://localhost/I/19' },
        { beacon: 'weaviate://localhost/I/20' },
      ],
      mngrStrsSngl: [{ beacon: 'weaviate://localhost/21' }, { beacon: 'weaviate://localhost/22' }],
      mngrsStrsSngl: [
        { beacon: 'weaviate://localhost/23' },
        { beacon: 'weaviate://localhost/24' },
        { beacon: 'weaviate://localhost/25' },
        { beacon: 'weaviate://localhost/26' },
      ],
      mngrStrsMlt: [{ beacon: 'weaviate://localhost/J/27' }, { beacon: 'weaviate://localhost/J/28' }],
      mngrsStrsMlt: [
        { beacon: 'weaviate://localhost/K/29' },
        { beacon: 'weaviate://localhost/K/30' },
        { beacon: 'weaviate://localhost/L/31' },
        { beacon: 'weaviate://localhost/L/32' },
      ],
    });
  });

  it('should parse isMultiWeightPerTarget', () => {
    expect(
      Serialize.isMultiWeightPerTarget({
        targetVector: 'a',
      })
    ).toEqual(false);
    expect(
      Serialize.isMultiWeightPerTarget({
        targetVector: ['a'],
      })
    ).toEqual(false);
    expect(
      Serialize.isMultiWeightPerTarget({
        targetVector: multiTargetVector().manualWeights({ a: 0.5, b: 0.5 }),
      })
    ).toEqual(false);
    expect(
      Serialize.isMultiWeightPerTarget({
        targetVector: multiTargetVector().manualWeights({ a: [0.5, 0.5], b: 0.5 }),
      })
    ).toEqual(true);
  });

  describe('should parse TargetVectorInput type', () => {
    type Out = {
      targets?: Targets;
      targetVectors?: string[];
    };
    type Test = {
      name: string;
      targetVector: TargetVectorInputType;
      supportsTargets: boolean;
      supportsWeightsForTargets: boolean;
      out: Out;
    };
    const tests: Test[] = [
      {
        name: 'should parse single target vector into targets',
        targetVector: 'a',
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({ targetVectors: ['a'] }),
        },
      },
      {
        name: 'should parse list of target vectors into targets',
        targetVector: ['a', 'b'],
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({ targetVectors: ['a', 'b'] }),
        },
      },
      {
        name: 'should parse MultiTargetJoin sum',
        targetVector: multiTargetVector().average(['a', 'b']),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_AVERAGE,
            targetVectors: ['a', 'b'],
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin manual single weight per target',
        targetVector: multiTargetVector().manualWeights({ a: 0.5, b: 0.5 }),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_MANUAL,
            targetVectors: ['a', 'b'],
            weights: { a: 0.5, b: 0.5 },
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin manual multiple weights per target',
        targetVector: multiTargetVector().manualWeights({ a: [0.5, 0.5], b: 0.5 }),
        supportsTargets: true,
        supportsWeightsForTargets: true,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_MANUAL,
            targetVectors: ['a', 'a', 'b'],
            weightsForTargets: [
              { target: 'a', weight: 0.5 },
              { target: 'a', weight: 0.5 },
              { target: 'b', weight: 0.5 },
            ],
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin minimum',
        targetVector: multiTargetVector().minimum(['a', 'b']),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_MIN,
            targetVectors: ['a', 'b'],
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin sum',
        targetVector: multiTargetVector().average(['a', 'b']),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_AVERAGE,
            targetVectors: ['a', 'b'],
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin relativeScore single weight per target',
        targetVector: multiTargetVector().relativeScore({ a: 0.5, b: 0.5 }),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_RELATIVE_SCORE,
            targetVectors: ['a', 'b'],
            weights: { a: 0.5, b: 0.5 },
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin relativeScore multiple weights per target',
        targetVector: multiTargetVector().relativeScore({ a: [0.5, 0.5], b: 0.5 }),
        supportsTargets: true,
        supportsWeightsForTargets: true,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_RELATIVE_SCORE,
            targetVectors: ['a', 'a', 'b'],
            weightsForTargets: [
              { target: 'a', weight: 0.5 },
              { target: 'a', weight: 0.5 },
              { target: 'b', weight: 0.5 },
            ],
          }),
        },
      },
      {
        name: 'should parse MultiTargetJoin sum',
        targetVector: multiTargetVector().sum(['a', 'b']),
        supportsTargets: true,
        supportsWeightsForTargets: false,
        out: {
          targets: Targets.fromPartial({
            combination: CombinationMethod.COMBINATION_METHOD_TYPE_SUM,
            targetVectors: ['a', 'b'],
          }),
        },
      },
    ];
    const test = (test: Test) =>
      it(test.name, () => {
        const args = Serialize.targetVector(test);
        expect(args).toEqual<Out>(test.out);
      });
    tests.forEach(test);
  });

  describe('.filtersGRPC', () => {
    it('should parse a text property', () => {
      const f = filter<any>().byProperty('name').equal('test');
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'name',
        },
        valueText: 'test',
      });
    });
    it('should parse a text array property', () => {
      const f = filter<any>().byProperty('name').equal(['test1', 'test2']);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'name',
        },
        valueTextArray: { values: ['test1', 'test2'] },
      });
    });
    it('should parse an int property', () => {
      const f = filter<any>().byProperty('age').equal(10);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'age',
        },
        valueInt: 10,
      });
    });
    it('should parse an int array property', () => {
      const f = filter<any>().byProperty('age').equal([10, 20]);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'age',
        },
        valueIntArray: { values: [10, 20] },
      });
    });
    it('should parse a float property', () => {
      const f = filter<any>().byProperty('height').equal(1.8);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'height',
        },
        valueNumber: 1.8,
      });
    });
    it('should parse a float array property', () => {
      const f = filter<any>().byProperty('height').equal([1.8, 2.8]);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'height',
        },
        valueNumberArray: { values: [1.8, 2.8] },
      });
    });
    it('should parse a boolean property', () => {
      const f = filter<any>().byProperty('isHappy').equal(true);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'isHappy',
        },
        valueBoolean: true,
      });
    });
    it('should parse a boolean array property', () => {
      const f = filter<any>().byProperty('isHappy').equal([true, false]);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'isHappy',
        },
        valueBooleanArray: { values: [true, false] },
      });
    });
    it('should parse a date property', () => {
      const date = new Date();
      const f = filter<any>().byProperty('birthday').equal(date);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'birthday',
        },
        valueText: date.toISOString(),
      });
    });
    it('should parse a date array property', () => {
      const date1 = new Date();
      const date2 = new Date();
      const f = filter<any>().byProperty('birthday').equal([date1, date2]);
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_EQUAL,
        on: [],
        filters: [],
        target: {
          property: 'birthday',
        },
        valueTextArray: { values: [date1.toISOString(), date2.toISOString()] },
      });
    });
    it('should parse a geo property', () => {
      const f = filter<any>()
        .byProperty('location')
        .withinGeoRange({ latitude: 1, longitude: 1, distance: 1 });
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_WITHIN_GEO_RANGE,
        on: [],
        filters: [],
        target: {
          property: 'location',
        },
        valueGeo: {
          distance: 1,
          latitude: 1,
          longitude: 1,
        },
      });
    });
    it('should parse several filters in a Filters.and', () => {
      const f = FiltersFactory.and(
        filter<any>().byProperty('name').equal('test'),
        filter<any>().byProperty('age').equal(10)
      );
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_AND,
        on: [],
        target: undefined,
        filters: [
          {
            operator: Filters_Operator.OPERATOR_EQUAL,
            on: [],
            filters: [],
            target: {
              property: 'name',
            },
            valueText: 'test',
          },
          {
            operator: Filters_Operator.OPERATOR_EQUAL,
            on: [],
            filters: [],
            target: {
              property: 'age',
            },
            valueInt: 10,
          },
        ],
      });
    });
    it('should parse several filters in a Filters.or', () => {
      const f = FiltersFactory.or(
        filter<any>().byProperty('name').equal('test'),
        filter<any>().byProperty('age').equal(10)
      );
      const args = Serialize.filtersGRPC(f);
      expect(args).toEqual<Filters>({
        operator: Filters_Operator.OPERATOR_OR,
        on: [],
        target: undefined,
        filters: [
          {
            operator: Filters_Operator.OPERATOR_EQUAL,
            on: [],
            filters: [],
            target: {
              property: 'name',
            },
            valueText: 'test',
          },
          {
            operator: Filters_Operator.OPERATOR_EQUAL,
            on: [],
            filters: [],
            target: {
              property: 'age',
            },
            valueInt: 10,
          },
        ],
      });
    });
  });
});

describe('Unit testing of DataGuards', () => {
  const values: WeaviateField[] = [
    1,
    1.1,
    NaN,
    Infinity,
    new Date(),
    { prop: 'hi' },
    [],
    true,
    'text',
    {
      latitude: 1,
      longitude: 1,
    },
    {
      number: '+44 1234 567890',
    },
    [1],
    [1.1],
    [NaN],
    [Infinity],
    [new Date()],
    [{ prop: 'hi' }],
    [true],
    ['text'],
  ];
  const opposite =
    (f: (...args: any[]) => any) =>
    (...args: any[]): any =>
      !f(...args);
  it('should check isText', () => {
    const pred = (v: any) => v === 'text';
    values
      .filter(pred)
      .map(DataGuards.isText)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isText)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isTextArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0] === 'text';
    values
      .filter(pred)
      .map(DataGuards.isTextArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isTextArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isInt', () => {
    const pred = (v: any) => v === 1;
    values
      .filter(pred)
      .map(DataGuards.isInt)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isInt)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isIntArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0] === 1;
    values
      .filter(pred)
      .map(DataGuards.isIntArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isIntArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isFloat', () => {
    const pred = (v: any) => v === 1.1;
    values
      .filter(pred)
      .map(DataGuards.isFloat)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isFloat)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isFloatArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0] === 1.1;
    values
      .filter(pred)
      .map(DataGuards.isFloatArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isFloatArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isBoolean', () => {
    const pred = (v: any) => v === true;
    values
      .filter(pred)
      .map(DataGuards.isBoolean)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isBoolean)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isBooleanArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0] === true;
    values
      .filter(pred)
      .map(DataGuards.isBooleanArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isBooleanArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isDate', () => {
    const pred = (v: any) => v instanceof Date;
    values
      .filter(pred)
      .map(DataGuards.isDate)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isDate)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isDateArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0] instanceof Date;
    values
      .filter(pred)
      .map(DataGuards.isDateArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isDateArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isGeoCoordinate', () => {
    const pred = (v: any) => v.latitude && v.longitude;
    values
      .filter(pred)
      .map(DataGuards.isGeoCoordinate)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isGeoCoordinate)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isPhoneNumber', () => {
    const pred = (v: any) => v.number;
    values
      .filter(pred)
      .map(DataGuards.isPhoneNumber)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isPhoneNumber)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isNested', () => {
    const pred = (v: any) => v.prop === 'hi';
    values
      .filter(pred)
      .map(DataGuards.isNested)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isNested)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isNestedArray', () => {
    const pred = (v: any) => Array.isArray(v) && v[0]?.prop === 'hi';
    values
      .filter(pred)
      .map(DataGuards.isNestedArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isNestedArray)
      .forEach((result) => expect(result).toEqual(false));
  });

  it('should check isEmptyArray', () => {
    const pred = (v: any) => Array.isArray(v) && v.length === 0;
    values
      .filter(pred)
      .map(DataGuards.isEmptyArray)
      .forEach((result) => expect(result).toEqual(true));
    values
      .filter(opposite(pred))
      .map(DataGuards.isEmptyArray)
      .forEach((result) => expect(result).toEqual(false));
  });
});
