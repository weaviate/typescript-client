import Serialize, { DataGuards } from '.';
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
} from '../../grpc/searcher';
import { Filters, Filters_Operator } from '../../proto/v1/base';
import {
  BM25,
  GenerativeSearch,
  GroupBy,
  Hybrid,
  Hybrid_FusionType,
  MetadataRequest,
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
  PropertiesRequest,
} from '../../proto/v1/search_get';
import filter from '../filters';
import { GenerateGroupByNearOptions } from '../generate';
import sort, { Sorting } from '../sort';
import { WeaviateField } from '../types';

describe('Unit testing of Serialize', () => {
  it('should parse args for fetchObjects', () => {
    const args = Serialize.fetchObjects({
      limit: 1,
      offset: 0,
      after: 'one',
      filters: filter<any>().byProperty('name').equal('test'),
      sort: sort<any>().byProperty('name'),
      includeVector: true,
      returnMetadata: ['certainty'],
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
        uuid: true,
        vector: true,
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
    const args = Serialize.fetchObjectById({
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
    const args = Serialize.bm25({
      query: 'test',
      queryProperties: ['name'],
      autoLimit: 1,
    });
    expect(args).toEqual<SearchBm25Args>({
      bm25: BM25.fromPartial({
        query: 'test',
        properties: ['name'],
      }),
      autocut: 1,
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for hybrid', () => {
    const args = Serialize.hybrid({
      query: 'test',
      queryProperties: ['name'],
      alpha: 0.6,
      vector: [1, 2, 3],
      targetVector: 'title',
      fusionType: 'Ranked',
    });
    expect(args).toEqual<SearchHybridArgs>({
      hybrid: Hybrid.fromPartial({
        query: 'test',
        properties: ['name'],
        alpha: 0.6,
        vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer),
        targetVectors: ['title'],
        fusionType: Hybrid_FusionType.FUSION_TYPE_RANKED,
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearAudio', () => {
    const args = Serialize.nearAudio({
      audio: 'audio',
      certainty: 0.6,
      distance: 0.4,
      targetVector: 'audio',
    });
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
    const args = Serialize.nearDepth({
      depth: 'depth',
    });
    expect(args).toEqual<SearchNearDepthArgs>({
      nearDepth: NearDepthSearch.fromPartial({
        depth: 'depth',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearIMU', () => {
    const args = Serialize.nearIMU({
      imu: 'imu',
    });
    expect(args).toEqual<SearchNearIMUArgs>({
      nearIMU: NearIMUSearch.fromPartial({
        imu: 'imu',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearImage', () => {
    const args = Serialize.nearImage({
      image: 'image',
    });
    expect(args).toEqual<SearchNearImageArgs>({
      nearImage: NearImageSearch.fromPartial({
        image: 'image',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearObject', () => {
    const args = Serialize.nearObject({
      id: 'id',
    });
    expect(args).toEqual<SearchNearObjectArgs>({
      nearObject: NearObject.fromPartial({
        id: 'id',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearText', () => {
    const args = Serialize.nearText({
      query: 'test',
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
    });
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
    const args = Serialize.nearThermal({
      thermal: 'thermal',
    });
    expect(args).toEqual<SearchNearThermalArgs>({
      nearThermal: NearThermalSearch.fromPartial({
        thermal: 'thermal',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVector', () => {
    const args = Serialize.nearVector({
      vector: [1, 2, 3],
    });
    expect(args).toEqual<SearchNearVectorArgs>({
      nearVector: NearVector.fromPartial({
        vectorBytes: new Uint8Array(new Float32Array([1, 2, 3]).buffer),
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for nearVideo', () => {
    const args = Serialize.nearVideo({
      video: 'video',
    });
    expect(args).toEqual<SearchNearVideoArgs>({
      nearVideo: NearVideoSearch.fromPartial({
        video: 'video',
      }),
      metadata: MetadataRequest.fromPartial({ uuid: true }),
    });
  });

  it('should parse args for generative', () => {
    const args = Serialize.generative({
      singlePrompt: 'test',
      groupedProperties: ['name'],
      groupedTask: 'testing',
    });
    expect(args).toEqual<GenerativeSearch>({
      singleResponsePrompt: 'test',
      groupedProperties: ['name'],
      groupedResponseTask: 'testing',
    });
  });

  it('should parse args for groupBy', () => {
    const args = Serialize.groupBy({
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
    const isGroupBy = Serialize.isGroupBy({
      groupBy: {
        property: 'name',
        numberOfGroups: 1,
        objectsPerGroup: 2,
      },
    });
    const isNotGroupBy = Serialize.isGroupBy({});
    expect(isGroupBy).toEqual(true);
    expect(isNotGroupBy).toEqual(false);
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
