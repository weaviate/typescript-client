/* eslint-disable @typescript-eslint/no-non-null-assertion */
import weaviate, {
  Meta,
  Reference,
  ReferenceCreator,
  Tenant,
  WeaviateClass,
  WeaviateClient,
  WeaviateError,
  WeaviateObject,
  WhereFilter,
} from '../v2/index.js';
import { FusionType } from './hybrid.js';

describe('the graphql journey', () => {
  let client: WeaviateClient;
  let versionLessThan125: boolean;

  beforeEach(async () => {
    client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
    versionLessThan125 = await client.misc
      .metaGetter()
      .do()
      .then((res: Meta) => res.version!.localeCompare('1.25.0') < 0);
  });

  it('creates a schema class', () => {
    // this is just test setup, not part of what we want to test here
    return setup(client);
  });

  test('graphql raw method', () => {
    return client.graphql
      .raw()
      .withQuery('{Get{Article{title url wordCount}}}')
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toEqual(3);
      });
  });

  test('graphql get method with minimal fields', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title url wordCount')
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toEqual(3);
      });
  });

  test('graphql get objects after id (Cursor API)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withLimit(10)
      .withAfter('abefd256-8574-442b-9293-9205193737e0')
      .withFields('title url wordCount')
      .do()
      .then(function (result) {
        // one fewer than all
        expect(result.data.Get.Article.length).toEqual(2);
      });
  });

  test('graphql get method with optional fields (with certainty)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title url wordCount')
      .withNearText({ concepts: ['news'], certainty: 0.1 })
      .withWhere({
        operator: 'GreaterThanEqual',
        path: ['wordCount'],
        valueInt: 50,
      })
      .withLimit(7)
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBeLessThan(3);
        expect(result.data.Get.Article[0].title.length).toBeGreaterThan(0);
        expect(result.data.Get.Article[0].url.length).toBeGreaterThan(0);
        expect(result.data.Get.Article[0].wordCount).toBeGreaterThanOrEqual(50);
      });
  });

  test('graphql get method with optional fields (with distance)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title url wordCount')
      .withNearText({ concepts: ['news'], distance: 0.9 })
      .withWhere({
        operator: 'GreaterThanEqual',
        path: ['wordCount'],
        valueInt: 50,
      })
      .withLimit(7)
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBeLessThan(3);
        expect(result.data.Get.Article[0].title.length).toBeGreaterThan(0);
        expect(result.data.Get.Article[0].url.length).toBeGreaterThan(0);
        expect(result.data.Get.Article[0].wordCount).toBeGreaterThanOrEqual(50);
      });
  });

  test('graphql get with group', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title url wordCount')
      .withGroup({ type: 'merge', force: 1.0 })
      .withLimit(7)
      .do()
      .then(function (result) {
        // merging with a force of 1 means we merge everyting into a single
        // element
        expect(result.data.Get.Article.length).toBe(1);
      });
  });

  test('graphql get with nearVector (with certainty)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .get()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, certainty: 0.7 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearVector (with distance)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .get()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, distance: 0.3 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearObject (with certainty)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        certainty: 0.7,
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearObject (with distance)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        distance: 0.3,
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get bm25 with query (without properties)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withBm25({ query: 'Article' })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get bm25 with query (with properties)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withBm25({ query: 'Apple', properties: ['title', 'url'] })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get bm25 with query (with properties not having searched query)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withBm25({ query: 'Apple', properties: ['url'] })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(0);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get bm25 with query and groupby', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withBm25({ query: 'Apple' })
      .withGroupBy({
        path: ['title'],
        objectsPerGroup: 1,
        groups: 1,
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get nearText with autocut', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'] })
      .withAutocut(3)
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query (no vector, alpha 0)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'apple', alpha: 0 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query (no vector, alpha 0.5)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'Apple', alpha: 0.5 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query (with vector)', () => {
    const dummyVec300x0 = Array.from({ length: 300 }, () => 0);

    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'Apple', alpha: 0.5, vector: dummyVec300x0 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query, alpha, and properties', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'Apple', properties: ['title'], alpha: 0 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query, alpha, properties and fushionType: rankedFusion', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'Apple', properties: ['title'], alpha: 0, fusionType: FusionType.rankedFusion })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query, alpha, properties and fushionType: relativeScoreFusion', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({
        query: 'Apple',
        properties: ['title'],
        alpha: 0,
        fusionType: FusionType.relativeScoreFusion,
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query and groupby', () => {
    if (versionLessThan125) {
      return Promise.resolve();
    }
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({ query: 'Apple', properties: ['title'], alpha: 0 })
      .withGroupBy({
        path: ['title'],
        objectsPerGroup: 1,
        groups: 1,
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query and nearText subsearch', () => {
    if (versionLessThan125) {
      return Promise.resolve();
    }
    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({
        query: '',
        searches: [
          {
            nearText: {
              concepts: ['Article'],
              certainty: 0.7,
            },
          },
        ],
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get hybrid with query and nearVector subsearch', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    if (versionLessThan125) {
      return Promise.resolve();
    }

    return client.graphql
      .get()
      .withClassName('Article')
      .withHybrid({
        query: '',
        searches: [
          {
            nearVector: {
              vector: searchVec,
              certainty: 0.7,
            },
          },
        ],
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearText (with certainty)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], certainty: 0.7 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearText (with distance)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], distance: 0.3 })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearText with moveTo and moveAwayFrom (with certainty)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearText({
        concepts: ['Article'],
        certainty: 0.7,
        moveTo: {
          objects: [{ id: 'abefd256-8574-442b-9293-9205193737e2' }],
          force: 0.7,
        },
        moveAwayFrom: {
          objects: [{ id: 'abefd256-8574-442b-9293-9205193737e1' }],
          force: 0.5,
        },
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get with nearText with moveTo and moveAwayFrom (with distance)', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withNearText({
        concepts: ['Article'],
        distance: 0.3,
        moveTo: {
          objects: [{ id: 'abefd256-8574-442b-9293-9205193737e2' }],
          force: 0.7,
        },
        moveAwayFrom: {
          objects: [{ id: 'abefd256-8574-442b-9293-9205193737e1' }],
          force: 0.5,
        },
      })
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBe(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get expected failure - multiple nearMedia filters (with certainty)', () => {
    return expect(() => {
      client.graphql
        .get()
        .withClassName('Article')
        .withNearText({ concepts: ['iphone'] })
        .withNearObject({
          id: 'abefd256-8574-442b-9293-9205193737e0',
          certainty: 0.65,
        })
        .do();
    }).toThrow('cannot use multiple near<Media> filters in a single query');
  });

  test('graphql get expected failure - multiple nearMedia filters (with distance)', () => {
    return expect(() => {
      client.graphql
        .get()
        .withClassName('Article')
        .withNearText({ concepts: ['iphone'] })
        .withNearObject({
          id: 'abefd256-8574-442b-9293-9205193737e0',
          distance: 0.35,
        })
        .do();
    }).toThrow('cannot use multiple near<Media> filters in a single query');
  });

  test('graphql aggregate method with minimal fields', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method optional fields', () => {
    // Note this test is ignoring `.withGroupBy()` due to
    // https://github.com/semi-technologies/weaviate/issues/1238

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withWhere({
        path: ['title'],
        valueText: 'apple',
        operator: 'Equal',
      })
      .withLimit(10)
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearVector (with certainty)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, certainty: 0.7 })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearVector (with distance)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, distance: 0.3 })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearObject (with certainty)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        certainty: 0.7,
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearObject (with distance)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        distance: 0.3,
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearText (with certainty)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], certainty: 0.7 })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with nearText (with distance)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], distance: 0.3 })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(3);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method expected failure - multiple nearMedia filters (with certainty)', () => {
    return expect(() => {
      client.graphql
        .aggregate()
        .withClassName('Article')
        .withNearText({ concepts: ['iphone'] })
        .withNearObject({
          id: 'abefd256-8574-442b-9293-9205193737e0',
          certainty: 0.65,
        })
        .do();
    }).toThrow('cannot use multiple near<Media> filters in a single query');
  });

  test('graphql aggregate method expected failure - multiple nearMedia filters (with distance)', () => {
    return expect(() => {
      client.graphql
        .aggregate()
        .withClassName('Article')
        .withNearText({ concepts: ['iphone'] })
        .withNearObject({
          id: 'abefd256-8574-442b-9293-9205193737e0',
          distance: 0.35,
        })
        .do();
    }).toThrow('cannot use multiple near<Media> filters in a single query');
  });

  test('graphql aggregate method with where and nearVector (with certainty)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, certainty: 0.7 })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with where and nearVector (with distance)', () => {
    const searchVec = [
      -0.15047126, 0.061322376, -0.17812507, 0.12811552, 0.36847013, -0.50840724, -0.10406531, 0.11413283,
      0.2997712, 0.7039331, 0.22155242, 0.1413957, 0.025396502, 0.14802167, 0.26640236, 0.15965445,
      -0.45570126, -0.5215438, 0.14628491, 0.10946681, 0.0040095793, 0.017442623, -0.1988451, -0.05362646,
      0.104278944, -0.2506941, 0.2667653, 0.36438593, -0.44370207, 0.07204353, 0.077371456, 0.14557181,
      0.6026817, 0.45073593, 0.09438019, 0.03936342, -0.20441438, 0.12333719, -0.20247602, 0.5078446,
      -0.06079732, -0.02166342, 0.02165861, -0.11712191, 0.0493167, -0.012123002, 0.26458082, -0.10784768,
      -0.26852348, 0.049759883, -0.39999008, -0.08977922, 0.003169497, -0.36184034, -0.069065355, 0.18940343,
      0.5684866, -0.24626277, -0.2326087, 0.090373255, 0.33161184, -1.0541122, -0.039116446, -0.17496277,
      -0.16834813, -0.0765323, -0.16189013, -0.062876746, -0.19826415, 0.07437007, -0.018362755, 0.23634757,
      -0.19062655, -0.26524994, 0.33691254, -0.1926698, 0.018848037, 0.1735524, 0.34301907, -0.014238952,
      -0.07596742, -0.61302894, -0.044652265, 0.1545376, 0.67256856, 0.08630557, 0.50236076, 0.23438522,
      0.27686095, 0.13633616, -0.27525797, 0.04282576, 0.18319897, -0.008353968, -0.27330264, 0.12624736,
      -0.17051372, -0.35854533, -0.008455927, 0.154786, -0.20306401, -0.09021733, 0.80594194, 0.036562894,
      -0.48894945, -0.27981675, -0.5001396, -0.3581464, -0.057082724, -0.0051904973, -0.3209166, 0.057098284,
      0.111587055, -0.09097725, -0.213181, -0.5038173, -0.024070809, -0.05350453, 0.13345918, -0.42136985,
      0.24050911, -0.2556207, 0.03156968, 0.4381214, 0.053237516, -0.20783865, 1.885739, 0.28429136,
      -0.12231187, -0.30934808, 0.032250155, -0.32959512, 0.08670603, -0.60112613, -0.43010503, 0.70870006,
      0.3548015, -0.010406012, 0.036294986, 0.0030629474, -0.017579105, 0.28948352, -0.48063236, -0.39739868,
      0.17860937, 0.5099417, -0.24304488, -0.12671146, -0.018249692, -0.32057074, -0.08146134, 0.3572229,
      -0.47601065, 0.35100546, -0.19663939, 0.34194613, -0.04653828, 0.47278664, -0.8723091, -0.19756387,
      -0.5890681, 0.16688067, -0.23709822, -0.26478595, -0.18792373, 0.2204168, 0.030987943, 0.15885714,
      -0.38817936, -0.4194334, -0.3287098, 0.15394142, -0.09496768, 0.6561987, -0.39340565, -0.5479265,
      -0.22363484, -0.1193662, 0.2014849, 0.31138006, -0.45485613, -0.9879565, 0.3708223, 0.17318928,
      0.21229307, 0.042776756, -0.077399045, 0.42621315, -0.09917796, 0.34220153, 0.06380378, 0.14129028,
      -0.14563583, -0.07081333, 0.026335392, 0.10566285, -0.28074324, -0.059861198, -0.24855351, 0.13623764,
      -0.8228192, -0.15095113, 0.16250934, 0.031107651, -0.1504525, 0.20840737, 0.12919411, -0.0926323,
      0.30937102, 0.16636328, -0.36754072, 0.035581365, -0.2799259, 0.1446048, -0.11680267, 0.13226685,
      0.175023, -0.18840964, 0.27609056, -0.09350581, 0.08284562, 0.45897093, 0.13188471, -0.07115303,
      0.18009436, 0.16689545, -0.6991295, 0.26496106, -0.29619592, -0.19242188, -0.6362671, -0.16330126,
      0.2474778, 0.37738156, -0.12921557, -0.07843309, 0.28509396, 0.5658691, 0.16096894, 0.095068075,
      0.02419672, -0.30691084, 0.21180221, 0.21670066, 0.0027263877, 0.30853105, -0.16187873, 0.20786561,
      0.22136153, -0.008828387, -0.011165021, 0.60076475, 0.0089871045, 0.6179727, -0.38049766, -0.08179336,
      -0.15306218, -0.13186441, -0.5360041, -0.06123339, -0.06399122, 0.21292226, -0.18383273, -0.21540102,
      0.28566808, -0.29953584, -0.36946672, 0.03341637, -0.08435299, -0.5381947, -0.28651953, 0.08704594,
      -0.25493965, 0.0019178925, -0.7242109, 0.3578676, -0.55617595, -0.01930952, 0.32922924, 0.14903364,
      0.21613406, -0.11927183, 0.15165499, -0.10101261, 0.2499076, -0.18526322, -0.057230365, 0.10008554,
      0.16178907, 0.39356324, -0.03106238, 0.09375929, 0.17185533, 0.10400415, -0.36850816, 0.18424486,
      -0.081376314, 0.23645392, 0.05198973, 0.09471436,
    ];

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearVector({ vector: searchVec, distance: 0.3 })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with where and nearObject (with certainty)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        certainty: 0.7,
      })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with where and nearObject (with distance)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearObject({
        id: 'abefd256-8574-442b-9293-9205193737e0',
        distance: 0.3,
      })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with where and nearText (with certainty)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], certainty: 0.7 })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with where and nearText (with distance)', () => {
    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], distance: 0.3 })
      .withWhere({
        operator: 'Equal',
        path: ['_id'],
        valueText: 'abefd256-8574-442b-9293-9205193737e0',
      })
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with objectLimit (with certainty)', () => {
    const objectLimit = 1;

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], certainty: 0.7 })
      .withObjectLimit(objectLimit)
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(objectLimit);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with objectLimit (with distance)', () => {
    const objectLimit = 1;

    return client.graphql
      .aggregate()
      .withClassName('Article')
      .withNearText({ concepts: ['Article'], distance: 0.3 })
      .withObjectLimit(objectLimit)
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        const count = res.data.Aggregate.Article[0].meta.count;
        expect(count).toEqual(objectLimit);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql aggregate method with bad objectLimit input (with certainty)', () => {
    const objectLimit = -1.1;

    return expect(() => {
      client.graphql
        .aggregate()
        .withClassName('Article')
        .withNearText({ concepts: ['Article'], certainty: 0.7 })
        .withObjectLimit(objectLimit)
        .withFields('meta { count }')
        .do();
    }).toThrow('objectLimit must be a non-negative integer');
  });

  test('graphql aggregate method with bad objectLimit input (with distance)', () => {
    const objectLimit = -1.1;

    return expect(() => {
      client.graphql
        .aggregate()
        .withClassName('Article')
        .withNearText({ concepts: ['Article'], distance: 0.3 })
        .withObjectLimit(objectLimit)
        .withFields('meta { count }')
        .do();
    }).toThrow('objectLimit must be a non-negative integer');
  });

  test('graphql explore with minimal fields', () => {
    return client.graphql
      .explore()
      .withNearText({ concepts: ['iphone'] })
      .withFields('beacon certainty className')
      .do()
      .then((res: any) => {
        expect(res.data.Explore.length).toBeGreaterThan(0);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql explore with optional fields', () => {
    return client.graphql
      .explore()
      .withNearText({ concepts: ['iphone'] })
      .withFields('beacon certainty distance className')
      .withLimit(1)
      .do()
      .then((res: any) => {
        expect(res.data.Explore.length).toEqual(1);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql explore with nearObject field', () => {
    return client.graphql
      .explore()
      .withNearObject({ id: 'abefd256-8574-442b-9293-9205193737e0' })
      .withFields('beacon certainty distance className')
      .do()
      .then((res: any) => {
        expect(res.data.Explore.length).toBeGreaterThan(0);
      })
      .catch((e: any) => {
        throw new Error('it should not have errord' + e);
      });
  });

  test('graphql get method with sort filter: wordCount asc', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('wordCount')
      .withSort([{ path: ['wordCount'] }])
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBe(3);
        expect(result.data.Get.Article[0].wordCount).toEqual(40);
        expect(result.data.Get.Article[1].wordCount).toEqual(60);
        expect(result.data.Get.Article[2].wordCount).toEqual(600);
      });
  });

  test('graphql get method with [sort] filter: wordCount asc', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('wordCount')
      .withSort([{ path: ['wordCount'], order: 'asc' }])
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBe(3);
        expect(result.data.Get.Article[0].wordCount).toEqual(40);
        expect(result.data.Get.Article[1].wordCount).toEqual(60);
        expect(result.data.Get.Article[2].wordCount).toEqual(600);
      });
  });

  test('graphql get method with sort filter: title desc', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title')
      .withSort([{ path: ['title'], order: 'desc' }])
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBe(3);
        expect(result.data.Get.Article[0].title).toEqual('Article about Apple');
        expect(result.data.Get.Article[1].title).toEqual('Article 2');
        expect(result.data.Get.Article[2].title).toEqual('Article 1');
      });
  });

  test('graphql get method with [sort] filter: title desc', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title')
      .withSort([{ path: ['title'], order: 'desc' }])
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBe(3);
        expect(result.data.Get.Article[0].title).toEqual('Article about Apple');
        expect(result.data.Get.Article[1].title).toEqual('Article 2');
        expect(result.data.Get.Article[2].title).toEqual('Article 1');
      });
  });

  test('graphql get method with [sort] filters', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('title')
      .withSort([
        { path: ['wordCount'], order: 'asc' },
        { path: ['title'], order: 'desc' },
      ])
      .do()
      .then(function (result) {
        expect(result.data.Get.Article.length).toBe(3);
        expect(result.data.Get.Article[0].title).toEqual('Article 2');
        expect(result.data.Get.Article[1].title).toEqual('Article 1');
        expect(result.data.Get.Article[2].title).toEqual('Article about Apple');
      });
  });

  test('graphql get method with creationTimeUnix filter', async () => {
    const expected = await client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { creationTimeUnix }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        return res;
      });

    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { id creationTimeUnix }')
      .withWhere({
        path: ['_creationTimeUnix'],
        operator: 'Equal',
        valueText: expected.data.Get.Article[0]._additional.creationTimeUnix,
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        expect(res.data.Get.Article[0]._additional.creationTimeUnix).toEqual(
          expected.data.Get.Article[0]._additional.creationTimeUnix
        );
      });
  });

  test('graphql get method with lastUpdateTimeUnix filter', async () => {
    const expected = await client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { lastUpdateTimeUnix }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        return res;
      });

    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { id lastUpdateTimeUnix }')
      .withWhere({
        path: ['_lastUpdateTimeUnix'],
        operator: 'Equal',
        valueText: expected.data.Get.Article[0]._additional.lastUpdateTimeUnix,
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        expect(res.data.Get.Article[0]._additional.lastUpdateTimeUnix).toEqual(
          expected.data.Get.Article[0]._additional.lastUpdateTimeUnix
        );
      });
  });

  it('search object with uuid and uuid props', async () => {
    const client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });

    const className = 'ClassUUID';
    const id = 'abefd256-8574-442b-9293-9205193737ee';

    await client.schema
      .classCreator()
      .withClass({
        class: className,
        properties: [
          {
            dataType: ['uuid'],
            name: 'uuidProp',
          },
          {
            dataType: ['uuid[]'],
            name: 'uuidArrayProp',
          },
        ],
      })
      .do()
      .then((res: WeaviateClass) => {
        expect(res).toBeTruthy();
      });

    await client.data
      .creator()
      .withClassName(className)
      .withId(id)
      .withProperties({
        uuidProp: '7aaa79d3-a564-45db-8fa8-c49e20b8a39a',
        uuidArrayProp: ['f70512a3-26cb-4ae4-9369-204555917f15', '9e516f40-fd54-4083-a476-f4675b2b5f92'],
      })
      .do()
      .then((res: WeaviateObject) => {
        expect(res).toBeTruthy();
      });

    const expectObjectFound = async (propName: string, value: string) => {
      await client.graphql
        .get()
        .withClassName(className)
        .withFields('_additional { id }')
        .withWhere({
          path: [propName],
          operator: 'Equal',
          valueText: value,
        })
        .do()
        .then((res: any) => {
          expect(res.data.Get[className].length).toBeGreaterThan(0);
          expect(res.data.Get[className][0]._additional.id).toEqual(id);
        });
    };

    await expectObjectFound('uuidProp', '7aaa79d3-a564-45db-8fa8-c49e20b8a39a');
    await expectObjectFound('uuidArrayProp', 'f70512a3-26cb-4ae4-9369-204555917f15');
    await expectObjectFound('uuidArrayProp', '9e516f40-fd54-4083-a476-f4675b2b5f92');

    return client.schema
      .classDeleter()
      .withClassName(className)
      .do()
      .then((res: void) => {
        expect(res).toEqual(undefined);
      });
  });

  it('tears down and cleans up', () => {
    return Promise.all([client.schema.classDeleter().withClassName('Article').do()]);
  });
});

describe('query with generative search', () => {
  jest.setTimeout(30000);

  if (process.env.OPENAI_APIKEY == undefined || process.env.OPENAI_APIKEY == '') {
    console.warn('Skipping because `WCS_DUMMY_CI_PW` is not set');
    return;
  }

  const client = weaviate.client({
    host: 'localhost:8086',
    scheme: 'http',
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_APIKEY! },
  });

  it('sets up the test environment', async () => {
    await client.schema
      .classCreator()
      .withClass({
        class: 'Wine',
        properties: [
          { name: 'name', dataType: ['string'] },
          { name: 'review', dataType: ['string'] },
        ],
        moduleConfig: {
          'generative-openai': {},
        },
      })
      .do()
      .catch((e: any) => {
        throw new Error(`unexpected error with class creation: ${JSON.stringify(e)}`);
      });

    await client.data
      .creator()
      .withClassName('Wine')
      .withProperties({ name: 'Super expensive wine', review: 'Tastes like a fresh ocean breeze' })
      .do()
      .catch((e: any) => {
        throw new Error(`unexpected error with object creation: ${JSON.stringify(e)}`);
      });

    return client.data
      .creator()
      .withClassName('Wine')
      .withProperties({ name: 'cheap wine', review: 'Tastes like forest' })
      .do()
      .catch((e: any) => {
        throw new Error(`unexpected error with object creation: ${JSON.stringify(e)}`);
      });
  });

  test('singlePrompt', async () => {
    await client.graphql
      .get()
      .withClassName('Wine')
      .withFields('name review')
      .withGenerate({
        singlePrompt: `Describe the following as a Facebook Ad:
Tastes like a fresh ocean breeze: {review}`,
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Wine[0]._additional.generate.singleResult).toBeDefined();
        expect(res.data.Get.Wine[0]._additional.generate.error).toBeNull();
      });
  });

  test('groupedTask', async () => {
    await client.graphql
      .get()
      .withClassName('Wine')
      .withFields('name review')
      .withGenerate({
        groupedTask: 'Describe the following as a LinkedIn Ad: {review}',
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Wine[0]._additional.generate.groupedResult).toBeDefined();
        expect(res.data.Get.Wine[0]._additional.generate.error).toBeNull();
      });
  });

  test('groupedTask with groupedProperties', async () => {
    await client.graphql
      .get()
      .withClassName('Wine')
      .withFields('name review')
      .withGenerate({
        groupedTask: 'Describe the following as a LinkedIn Ad:',
        groupedProperties: ['name', 'review'],
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Wine[0]._additional.generate.groupedResult).toBeDefined();
        expect(res.data.Get.Wine[0]._additional.generate.error).toBeNull();
      });
  });

  test('singlePrompt and groupedTask', async () => {
    await client.graphql
      .get()
      .withClassName('Wine')
      .withFields('name review')
      .withGenerate({
        singlePrompt: 'Describe the following as a Twitter Ad: {review}',
        groupedTask: 'Describe the following as a Mastodon Ad: {review}',
      })
      .do()
      .then((res: any) => {
        expect(res.data.Get.Wine[0]._additional.generate.singleResult).toBeDefined();
        expect(res.data.Get.Wine[0]._additional.generate.groupedResult).toBeDefined();
        expect(res.data.Get.Wine[0]._additional.generate.error).toBeNull();
      });
  });

  it('tears down schema', () => {
    return Promise.all([client.schema.classDeleter().withClassName('Wine').do()]);
  });
});

describe('query cluster with consistency level', () => {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8087',
  });

  it('sets up replicated class', () => {
    return setupReplicated(client);
  });

  test('One', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { id isConsistent }')
      .withConsistencyLevel('ONE')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        res.data.Get.Article.forEach((article: any) => {
          expect(article._additional.isConsistent).toBeTruthy();
        });
        return res;
      })
      .catch((e: any) => {
        throw new Error(`unexpected error: ${JSON.stringify(e)}`);
      });
  });

  test('Quorum', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { id isConsistent }')
      .withConsistencyLevel('QUORUM')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        res.data.Get.Article.forEach((article: any) => {
          expect(article._additional.isConsistent).toBeTruthy();
        });
      })
      .catch((e: any) => {
        throw new Error(`unexpected error: ${JSON.stringify(e)}`);
      });
  });

  test('All', () => {
    return client.graphql
      .get()
      .withClassName('Article')
      .withFields('_additional { id isConsistent }')
      .withConsistencyLevel('ALL')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Article.length).toBeGreaterThan(0);
        res.data.Get.Article.forEach((article: any) => {
          expect(article._additional.isConsistent).toBeTruthy();
        });
      })
      .catch((e: any) => {
        throw new Error(`unexpected error: ${JSON.stringify(e)}`);
      });
  });

  it('tears down cluster schema', () => {
    return Promise.all([client.schema.classDeleter().withClassName('Article').do()]);
  });
});

describe.skip('query with group by SKIPPED BECAUSE OF XREFS RETURN OPTIMISATION BUG', () => {
  let client: WeaviateClient;

  beforeEach(() => {
    client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
  });

  it('creates Document Passage schema classes', () => {
    // this is just test setup, not part of what we want to test here
    return setupGroupBy(client);
  });

  test('should return 3 groups', async () => {
    interface GroupHit {
      passageIds: string[];
      ofDocumentId: string;
    }
    const hits = 'hits{ofDocument{... on Document{_additional{id}}} _additional{id distance}}';
    const group = `group{id groupedBy{value path} count maxDistance minDistance ${hits}}`;
    const _additional = `_additional{${group}}`;
    const expectedGroupHits1: GroupHit = {
      passageIds: [
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000009',
        '00000000-0000-0000-0000-000000000007',
        '00000000-0000-0000-0000-000000000008',
        '00000000-0000-0000-0000-000000000006',
        '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000005',
        '00000000-0000-0000-0000-000000000004',
        '00000000-0000-0000-0000-000000000003',
        '00000000-0000-0000-0000-000000000002',
      ],
      ofDocumentId: '00000000-0000-0000-0000-00000000000a',
    };
    const expectedGroupHits2: GroupHit = {
      passageIds: [
        '00000000-0000-0000-0000-000000000011',
        '00000000-0000-0000-0000-000000000013',
        '00000000-0000-0000-0000-000000000012',
        '00000000-0000-0000-0000-000000000014',
      ],
      ofDocumentId: '00000000-0000-0000-0000-00000000000b',
    };
    const expectedGroupHits: GroupHit[] = [expectedGroupHits1, expectedGroupHits2];

    await client.graphql
      .get()
      .withClassName('Passage')
      .withGroupBy({ path: ['ofDocument'], groups: 3, objectsPerGroup: 10 })
      .withNearObject({ id: '00000000-0000-0000-0000-000000000001' })
      .withFields(_additional)
      .do()
      .then((res: any) => {
        expect(res.data.Get.Passage).toHaveLength(3);
        expect(res.data.Get.Passage[0]._additional.group.hits).toHaveLength(10);
        expect(res.data.Get.Passage[1]._additional.group.hits).toHaveLength(4);
        expect(res.data.Get.Passage[2]._additional.group.hits).toHaveLength(6);
        for (let i = 0; i < 3; i++) {
          expect(res.data.Get.Passage[i]._additional.group).toBeDefined();
          expect(res.data.Get.Passage[i]._additional.group.minDistance).toBe(
            res.data.Get.Passage[i]._additional.group.hits[0]._additional.distance
          );
          expect(res.data.Get.Passage[i]._additional.group.maxDistance).toBe(
            res.data.Get.Passage[i]._additional.group.hits[
              res.data.Get.Passage[i]._additional.group.hits.length - 1
            ]._additional.distance
          );
        }
        for (let i = 0; i < 2; i++) {
          const expectedResults = expectedGroupHits[i];
          const hits = res.data.Get.Passage[i]._additional.group.hits;
          for (let j = 0; j < hits.length; j++) {
            expect(hits[j]._additional.id).toBe(expectedResults.passageIds[j]);
            expect(hits[j].ofDocument[0]._additional.id).toBe(expectedResults.ofDocumentId);
          }
        }
      });
  });

  it('tears down Document Passage schema', () => {
    return Promise.all([
      client.schema.classDeleter().withClassName('Passage').do(),
      client.schema.classDeleter().withClassName('Document').do(),
    ]);
  });
});

describe('multi tenancy', () => {
  let client: WeaviateClient;

  beforeEach(() => {
    client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
  });

  const tenants: Array<Tenant> = [{ name: 'tenantA' }, { name: 'tenantB' }];

  it('creates Document Passage schema classes with tenants', () => {
    // this is just test setup, not part of what we want to test here
    return setupMultiTenancy(client, tenants);
  });

  it('should not be able to Get results without a tenant parameter', () => {
    return client.graphql
      .get()
      .withClassName('Passage')
      .withFields('_additional { id }')
      .do()
      .catch((e: WeaviateError) => {
        expect(e).toBeDefined();
      });
  });

  it('should not be able to Get results without a tenant parameter', () => {
    return client.graphql
      .aggregate()
      .withClassName('Passage')
      .withFields('meta { count }')
      .do()
      .catch((e: WeaviateError) => {
        expect(e).toBeDefined();
      });
  });

  it('should not be able to Explore results', () => {
    return client.graphql
      .explore()
      .withNearText({ concepts: ['SpaceX'] })
      .withFields('beacon certainty className')
      .do()
      .catch((e: WeaviateError) => {
        expect(e).toBeDefined();
      });
  });

  it('should Get results with a proper tenant assigned to Passage objects', () => {
    return client.graphql
      .get()
      .withClassName('Passage')
      .withTenant(tenants[0].name!)
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Passage).toHaveLength(20);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord ' + e);
      });
  });

  it('should Aggregate results with a proper tenant assigned to Passage objects', () => {
    return client.graphql
      .aggregate()
      .withClassName('Passage')
      .withTenant(tenants[0].name!)
      .withFields('meta { count }')
      .do()
      .then((res: any) => {
        expect(res.data.Aggregate.Passage).toHaveLength(1);
        expect(res.data.Aggregate.Passage[0].meta.count).toBe(20);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord ' + e);
      });
  });

  it('should Aggregate results with a tenant that has no objects', () => {
    return client.graphql
      .aggregate()
      .withClassName('Passage')
      .withTenant(tenants[1].name!)
      .withFields('meta{count}')
      .do()
      .then((res: any) => {
        expect(res.data.Aggregate.Passage).toHaveLength(1);
        expect(res.data.Aggregate.Passage[0].meta.count).toBe(0);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord ' + e);
      });
  });

  it('should Get results with tenants and nearText', () => {
    return client.graphql
      .get()
      .withClassName('Passage')
      .withTenant(tenants[0].name!)
      .withNearText({ concepts: ['SpaceX'] })
      .withLimit(2)
      .withFields('_additional { id }')
      .do()
      .then((res: any) => {
        expect(res.data.Get.Passage).toHaveLength(2);
      })
      .catch((e: WeaviateError) => {
        throw new Error('it should not have errord ' + e);
      });
  });

  it('tears down Document Passage schema with tenants', () => {
    return Promise.all([
      client.schema.classDeleter().withClassName('Passage').do(),
      client.schema.classDeleter().withClassName('Document').do(),
    ]);
  });
});

describe('where test', () => {
  let client: WeaviateClient;

  beforeEach(() => {
    client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
  });

  const className = 'WhereTest';
  const id1 = '00000000-0000-0000-0000-000000000001';
  const id2 = '00000000-0000-0000-0000-000000000002';
  const id3 = '00000000-0000-0000-0000-000000000003';
  const ids: Array<string> = [id1, id2, id3];

  describe('setup', () => {
    it('should create WhereTest class', () => {
      const whereTest = {
        class: className,
        invertedIndexConfig: { indexTimestamps: true },
        properties: [
          {
            name: 'color',
            dataType: ['text'],
          },
          {
            name: 'colors',
            dataType: ['text[]'],
          },
          {
            name: 'author',
            dataType: ['string'],
          },
          {
            name: 'authors',
            dataType: ['string[]'],
          },
          {
            name: 'number',
            dataType: ['number'],
          },
          {
            name: 'numbers',
            dataType: ['number[]'],
          },
          {
            name: 'int',
            dataType: ['int'],
          },
          {
            name: 'ints',
            dataType: ['int[]'],
          },
          {
            name: 'date',
            dataType: ['date'],
          },
          {
            name: 'dates',
            dataType: ['date[]'],
          },
          {
            name: 'bool',
            dataType: ['boolean'],
          },
          {
            name: 'bools',
            dataType: ['boolean[]'],
          },
          {
            name: 'uuid',
            dataType: ['uuid'],
          },
          {
            name: 'uuids',
            dataType: ['uuid[]'],
          },
        ],
      };
      return client.schema.classCreator().withClass(whereTest).do();
    });

    it('should insert WhereTest data', () => {
      const authors = ['John', 'Jenny', 'Joseph'];
      const authorsArray = [['John', 'Jenny', 'Joseph'], ['John', 'Jenny'], ['John']];
      const colors = ['red', 'blue', 'green'];
      const colorssArray = [['red', 'blue', 'green'], ['red', 'blue'], ['red']];
      const numbers = [1.1, 2.2, 3.3];
      const numbersArray = [[1.1, 2.2, 3.3], [1.1, 2.2], [1.1]];
      const ints = [1, 2, 3];
      const intsArray = [[1, 2, 3], [1, 2], [1]];
      const uuids = [id1, id2, id3];
      const uuidsArray = [[id1, id2, id3], [id1, id2], [id1]];
      const dates = ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z', '2009-11-03T23:00:00Z'];
      const datesArray = [
        ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z', '2009-11-03T23:00:00Z'],
        ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z'],
        ['2009-11-01T23:00:00Z'],
      ];
      const bools = [true, false, true];
      const boolsArray = [[true, false, true], [true, false], [true]];

      const objects: WeaviateObject[] = [];
      for (let i = 0; i < ids.length; i++) {
        const obj: WeaviateObject = {
          id: ids[i],
          class: className,
          properties: {
            color: colors[i],
            colors: colorssArray[i],
            author: authors[i],
            authors: authorsArray[i],
            number: numbers[i],
            numbers: numbersArray[i],
            int: ints[i],
            ints: intsArray[i],
            uuid: uuids[i],
            uuids: uuidsArray[i],
            date: dates[i],
            dates: datesArray[i],
            bool: bools[i],
            bools: boolsArray[i],
          },
        };
        objects.push(obj);
      }
      let batch = client.batch.objectsBatcher();
      objects.forEach((elem) => {
        batch = batch.withObject(elem);
      });
      return batch.do();
    });
  });

  describe('test contains operators', () => {
    interface testCase {
      name: string;
      where: WhereFilter;
      expectedIds: Array<string>;
    }
    const testCases: Array<testCase> = [
      // arrays
      {
        name: 'contains all authors with string array',
        where: {
          path: ['authors'],
          operator: 'ContainsAll',
          valueStringArray: ['John', 'Jenny', 'Joseph'],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any authors with string array',
        where: {
          path: ['authors'],
          operator: 'ContainsAny',
          valueStringArray: ['John', 'Jenny', 'Joseph'],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains all colors with text array',
        where: {
          path: ['colors'],
          operator: 'ContainsAll',
          valueTextArray: ['red', 'blue', 'green'],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any colors with text array',
        where: {
          path: ['colors'],
          operator: 'ContainsAny',
          valueTextArray: ['red', 'blue', 'green'],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains all numbers with number array',
        where: {
          path: ['numbers'],
          operator: 'ContainsAll',
          valueNumberArray: [1.1, 2.2, 3.3],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any numbers with number array',
        where: {
          path: ['numbers'],
          operator: 'ContainsAny',
          valueNumberArray: [1.1, 2.2, 3.3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains all ints with int array',
        where: {
          path: ['ints'],
          operator: 'ContainsAll',
          valueIntArray: [1, 2, 3],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any ints with int array',
        where: {
          path: ['ints'],
          operator: 'ContainsAny',
          valueIntArray: [1, 2, 3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains all uuids with uuid array',
        where: {
          path: ['uuids'],
          operator: 'ContainsAll',
          valueTextArray: [id1, id2, id3],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any uuids with uuid array',
        where: {
          path: ['uuids'],
          operator: 'ContainsAny',
          valueTextArray: [id1, id2, id3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains all dates with date array',
        where: {
          path: ['dates'],
          operator: 'ContainsAll',
          valueDateArray: ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z', '2009-11-03T23:00:00Z'],
        },
        expectedIds: [id1],
      },
      {
        name: 'contains any dates with date array',
        where: {
          path: ['dates'],
          operator: 'ContainsAny',
          valueDateArray: ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z', '2009-11-03T23:00:00Z'],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'complex contains all ints and all numbers with AND on int array',
        where: {
          path: ['dates'],
          operator: 'And',
          operands: [
            {
              path: ['ints'],
              operator: 'ContainsAll',
              valueIntArray: [1, 2, 3],
            },
            {
              path: ['ints'],
              operator: 'ContainsAll',
              valueIntArray: [1, 2, 3],
            },
          ],
        },
        expectedIds: [id1],
      },
      {
        name: 'complex contains any ints and all numbers with OR on int array',
        where: {
          path: ['dates'],
          operator: 'Or',
          operands: [
            {
              path: ['ints'],
              operator: 'ContainsAll',
              valueIntArray: [1, 2, 3],
            },
            {
              path: ['ints'],
              operator: 'ContainsAny',
              valueIntArray: [1, 2, 3],
            },
          ],
        },
        expectedIds: [id1, id2, id3],
      },
      // primitives
      {
        name: 'contains any author with string',
        where: {
          path: ['author'],
          operator: 'ContainsAny',
          valueStringArray: ['John', 'Jenny', 'Joseph'],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains any color with text',
        where: {
          path: ['color'],
          operator: 'ContainsAny',
          valueTextArray: ['red', 'blue', 'green'],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains any number with number',
        where: {
          path: ['number'],
          operator: 'ContainsAny',
          valueNumberArray: [1.1, 2.2, 3.3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains any int with int',
        where: {
          path: ['int'],
          operator: 'ContainsAny',
          valueIntArray: [1, 2, 3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains any uuid with uuid',
        where: {
          path: ['uuid'],
          operator: 'ContainsAny',
          valueTextArray: [id1, id2, id3],
        },
        expectedIds: [id1, id2, id3],
      },
      {
        name: 'contains any date with date',
        where: {
          path: ['date'],
          operator: 'ContainsAny',
          valueDateArray: ['2009-11-01T23:00:00Z', '2009-11-02T23:00:00Z', '2009-11-03T23:00:00Z'],
        },
        expectedIds: [id1, id2, id3],
      },
    ];
    it.each(testCases.map((tc) => [tc.name, tc]))('%s', (_, t) => {
      const tc = t as testCase;
      return client.graphql
        .get()
        .withClassName(className)
        .withWhere(tc.where)
        .withFields('_additional { id }')
        .do()
        .then((res: any) => {
          expect(res.data.Get.WhereTest.length).toBe(tc.expectedIds.length);
          const result: Array<string> = [];
          for (let i = 0; i < tc.expectedIds.length; i++) {
            result.push(res.data.Get.WhereTest[i]._additional.id);
          }
          for (const expectedId of tc.expectedIds) {
            expect(result).toContainEqual(expectedId);
          }
        })
        .catch((e: any) => {
          throw new Error('it should not have errord' + e);
        });
    });
  });

  describe('destroy', () => {
    it('tears down WhereTest class', () => {
      return client.schema.classDeleter().withClassName(className).do();
    });
  });
});

describe('named vectors test', () => {
  let client: WeaviateClient;

  beforeEach(() => {
    client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
  });

  const className = 'VectorTest';
  const oneUUID = 'abefd256-8574-442b-9293-9205193737e1';

  describe('setup', () => {
    it(`should create ${className} class`, () => {
      const namedVectorTest: WeaviateClass = {
        class: className,
        properties: [
          {
            name: 'title',
            dataType: ['text'],
          },
          {
            name: 'rating',
            dataType: ['text'],
          },
        ],
        vectorConfig: {
          title: {
            vectorIndexType: 'hnsw',
            vectorizer: {
              'text2vec-contextionary': {
                vectorizeClassName: false,
                properties: ['title'],
              },
            },
          },
          rating: {
            vectorIndexType: 'hnsw',
            vectorizer: {
              'text2vec-contextionary': {
                vectorizeClassName: false,
                properties: ['rating'],
              },
            },
          },
        },
      };
      return client.schema.classCreator().withClass(namedVectorTest).do();
    });

    it('should insert VectorTest data', () => {
      const objects: WeaviateObject[] = [
        {
          class: className,
          properties: {
            title: 'One',
            rating: 'Good',
          },
          id: oneUUID,
        },
        {
          class: className,
          properties: {
            title: 'Two',
            rating: 'Better',
          },
        },
        {
          class: className,
          properties: {
            title: 'Three',
            rating: 'Best',
          },
        },
      ];
      let batch = client.batch.objectsBatcher();
      objects.forEach((elem) => {
        batch = batch.withObject(elem);
      });
      return batch.do();
    });

    it('should perform a nearText query on the title vector', () => {
      return client.graphql
        .get()
        .withClassName(className)
        .withNearText({
          concepts: ['Two'],
          targetVectors: ['title'],
        })
        .withFields('title')
        .do()
        .then((res) => {
          expect(res.data.Get.VectorTest).toHaveLength(3);
          expect(res.data.Get.VectorTest[0].title).toBe('Two');
        });
    });

    it('should perform a nearObject query on the rating vector', () => {
      return client.graphql
        .get()
        .withClassName(className)
        .withNearObject({
          id: oneUUID,
          targetVectors: ['rating'],
        })
        .withFields('rating')
        .do()
        .then((res) => {
          expect(res.data.Get.VectorTest).toHaveLength(3);
          expect(res.data.Get.VectorTest[0].rating).toBe('Good');
        });
    });
  });

  it('should perform a nearVector query on the title vector', () => {
    return client.data
      .getterById()
      .withClassName(className)
      .withId(oneUUID)
      .withVector()
      .do()
      .then((res) =>
        client.graphql
          .get()
          .withClassName(className)
          .withNearVector({
            vector: res.vectors?.title as any,
            targetVectors: ['title'],
          })
          .withFields('title')
          .do()
      )
      .then((res) => {
        expect(res.data.Get.VectorTest).toHaveLength(3);
        expect(res.data.Get.VectorTest[0].title).toBe('One');
      });
  });

  it('should perform a hybrid query on the rating vector', () => {
    return client.graphql
      .get()
      .withClassName(className)
      .withHybrid({
        query: 'Best',
        targetVectors: ['rating'],
      })
      .withFields('rating')
      .do()
      .then((res) => {
        expect(res.data.Get.VectorTest).toHaveLength(3);
        expect(res.data.Get.VectorTest[0].rating).toBe('Best');
      });
  });

  describe('destroy', () => {
    it('tears down VectorTest class', () => {
      return client.schema.classDeleter().withClassName(className).do();
    });
  });
});

const setup = async (client: WeaviateClient) => {
  const thing = {
    class: 'Article',
    invertedIndexConfig: { indexTimestamps: true },
    properties: [
      {
        name: 'title',
        dataType: ['text'],
      },
      {
        name: 'url',
        dataType: ['string'],
      },
      {
        name: 'wordCount',
        dataType: ['int'],
      },
    ],
  };

  await Promise.all([client.schema.classCreator().withClass(thing).do()]);

  // Note that the UUIDs are in ascending order. This is on purpose as the
  // Cursor API test relies on this fact.
  const toImport = [
    {
      id: 'abefd256-8574-442b-9293-9205193737e0',
      class: 'Article',
      properties: {
        wordCount: 60,
        url: 'http://articles.local/my-article-1',
        title: 'Article 1',
      },
    },
    {
      id: 'abefd256-8574-442b-9293-9205193737e1',
      class: 'Article',
      properties: {
        wordCount: 40,
        url: 'http://articles.local/my-article-2',
        title: 'Article 2',
      },
    },
    {
      id: 'abefd256-8574-442b-9293-9205193737e2',
      class: 'Article',
      properties: {
        wordCount: 600,
        url: 'http://articles.local/my-article-3',
        title: 'Article about Apple',
      },
    },
  ];

  let batch = client.batch.objectsBatcher();

  toImport.forEach((elem) => {
    batch = batch.withObject(elem);
  });

  await batch.do();
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const setupReplicated = async (client: WeaviateClient) => {
  const thing = {
    class: 'Article',
    invertedIndexConfig: { indexTimestamps: true },
    replicationConfig: {
      factor: 2,
    },
    properties: [
      {
        name: 'title',
        dataType: ['text'],
      },
      {
        name: 'url',
        dataType: ['string'],
      },
      {
        name: 'wordCount',
        dataType: ['int'],
      },
    ],
  };

  await Promise.all([client.schema.classCreator().withClass(thing).do()]);

  // Note that the UUIDs are in ascending order. This is on purpose as the
  // Cursor API test relies on this fact.
  const toImport = [
    {
      id: 'abefd256-8574-442b-9293-9205193737e0',
      class: 'Article',
      properties: {
        wordCount: 60,
        url: 'http://articles.local/my-article-1',
        title: 'Article 1',
      },
    },
    {
      id: 'abefd256-8574-442b-9293-9205193737e1',
      class: 'Article',
      properties: {
        wordCount: 40,
        url: 'http://articles.local/my-article-2',
        title: 'Article 2',
      },
    },
    {
      id: 'abefd256-8574-442b-9293-9205193737e2',
      class: 'Article',
      properties: {
        wordCount: 600,
        url: 'http://articles.local/my-article-3',
        title: 'Article about Apple',
      },
    },
  ];

  let batch = client.batch.objectsBatcher();

  toImport.forEach((elem) => {
    batch = batch.withObject(elem);
  });

  await batch.do();
  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const setupGroupBy = async (client: WeaviateClient) => {
  const res = await setupDocumentPassageSchema(client, false);
  return res;
};

const setupMultiTenancy = async (client: WeaviateClient, tenants: Array<Tenant>) => {
  const res = await setupDocumentPassageSchema(client, true, tenants);
  return res;
};

const setupDocumentPassageSchema = async (
  client: WeaviateClient,
  multiTenancyEnabled: boolean,
  tenants?: Array<Tenant>
) => {
  const document: WeaviateClass = {
    class: 'Document',
    invertedIndexConfig: { indexTimestamps: true },
    properties: [
      {
        name: 'title',
        dataType: ['text'],
      },
    ],
    multiTenancyConfig: {
      enabled: multiTenancyEnabled,
    },
  };

  const passage: WeaviateClass = {
    class: 'Passage',
    invertedIndexConfig: { indexTimestamps: true },
    properties: [
      {
        name: 'content',
        dataType: ['text'],
      },
      {
        name: 'type',
        dataType: ['text'],
      },
      {
        name: 'ofDocument',
        dataType: ['Document'],
      },
    ],
    multiTenancyConfig: {
      enabled: multiTenancyEnabled,
    },
  };

  await Promise.all([client.schema.classCreator().withClass(document).do()]);
  await Promise.all([client.schema.classCreator().withClass(passage).do()]);

  if (tenants) {
    const documentTenants = await client.schema.tenantsCreator(document.class!, tenants).do();
    expect(documentTenants).toBeDefined();
    expect(documentTenants).toHaveLength(tenants.length);

    const passageTenants = await client.schema.tenantsCreator(passage.class!, tenants).do();
    expect(passageTenants).toBeDefined();
    expect(passageTenants).toHaveLength(tenants.length);
  }

  // document, passage uuids
  const documentIds: string[] = [
    '00000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-00000000000b',
    '00000000-0000-0000-0000-00000000000c',
    '00000000-0000-0000-0000-00000000000d',
  ];

  const passageIds: string[] = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-000000000020',
  ];

  const documents: WeaviateObject[] = [];
  for (let i = 0; i < documentIds.length; i++) {
    const obj: WeaviateObject = {
      id: documentIds[i],
      class: 'Document',
      properties: {
        title: `Title of the document ${i}`,
      },
    };
    if (tenants) {
      obj.tenant = tenants[0].name!;
    }
    documents.push(obj);
  }

  const passages: WeaviateObject[] = [];
  for (let i = 0; i < passageIds.length; i++) {
    const obj: WeaviateObject = {
      id: passageIds[i],
      class: 'Passage',
      properties: {
        content: `Passage content ${i}`,
        type: 'document-passage',
      },
    };
    if (tenants) {
      obj.tenant = tenants[0].name!;
    }
    passages.push(obj);
  }

  let batch = client.batch.objectsBatcher();
  [...documents, ...passages].forEach((elem) => {
    batch = batch.withObject(elem);
  });
  await batch.do();

  const createReferences = (
    client: WeaviateClient,
    document: WeaviateObject,
    passages: WeaviateObject[],
    tenants?: Array<Tenant>
  ): void => {
    const ref: Reference = client.data
      .referencePayloadBuilder()
      .withId(document.id!)
      .withClassName(document.class!)
      .payload();
    for (const passage of passages) {
      const refCreator: ReferenceCreator = client.data
        .referenceCreator()
        .withId(passage.id!)
        .withClassName(passage.class!)
        .withReferenceProperty('ofDocument')
        .withReference(ref);
      if (tenants) {
        refCreator.withTenant(tenants[0].name!);
      }
      refCreator.do().catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
    }
  };

  createReferences(client, documents[0], passages.slice(0, 10), tenants);
  createReferences(client, documents[1], passages.slice(10, 14), tenants);

  return new Promise((resolve) => setTimeout(resolve, 1000));
};

const setupWhereTestSchema = async (
  client: WeaviateClient,
  multiTenancyEnabled: boolean,
  tenants?: Array<Tenant>
) => {
  const document: WeaviateClass = {
    class: 'Document',
    invertedIndexConfig: { indexTimestamps: true },
    properties: [
      {
        name: 'title',
        dataType: ['text'],
      },
    ],
    multiTenancyConfig: {
      enabled: multiTenancyEnabled,
    },
  };

  const passage: WeaviateClass = {
    class: 'Passage',
    invertedIndexConfig: { indexTimestamps: true },
    properties: [
      {
        name: 'content',
        dataType: ['text'],
      },
      {
        name: 'type',
        dataType: ['text'],
      },
      {
        name: 'ofDocument',
        dataType: ['Document'],
      },
    ],
    multiTenancyConfig: {
      enabled: multiTenancyEnabled,
    },
  };

  await Promise.all([client.schema.classCreator().withClass(document).do()]);
  await Promise.all([client.schema.classCreator().withClass(passage).do()]);

  if (tenants) {
    const documentTenants = await client.schema.tenantsCreator(document.class!, tenants).do();
    expect(documentTenants).toBeDefined();
    expect(documentTenants).toHaveLength(tenants.length);

    const passageTenants = await client.schema.tenantsCreator(passage.class!, tenants).do();
    expect(passageTenants).toBeDefined();
    expect(passageTenants).toHaveLength(tenants.length);
  }

  // document, passage uuids
  const documentIds: string[] = [
    '00000000-0000-0000-0000-00000000000a',
    '00000000-0000-0000-0000-00000000000b',
    '00000000-0000-0000-0000-00000000000c',
    '00000000-0000-0000-0000-00000000000d',
  ];

  const passageIds: string[] = [
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008',
    '00000000-0000-0000-0000-000000000009',
    '00000000-0000-0000-0000-000000000010',
    '00000000-0000-0000-0000-000000000011',
    '00000000-0000-0000-0000-000000000012',
    '00000000-0000-0000-0000-000000000013',
    '00000000-0000-0000-0000-000000000014',
    '00000000-0000-0000-0000-000000000015',
    '00000000-0000-0000-0000-000000000016',
    '00000000-0000-0000-0000-000000000017',
    '00000000-0000-0000-0000-000000000018',
    '00000000-0000-0000-0000-000000000019',
    '00000000-0000-0000-0000-000000000020',
  ];

  const documents: WeaviateObject[] = [];
  for (let i = 0; i < documentIds.length; i++) {
    const obj: WeaviateObject = {
      id: documentIds[i],
      class: 'Document',
      properties: {
        title: `Title of the document ${i}`,
      },
    };
    if (tenants) {
      obj.tenant = tenants[0].name!;
    }
    documents.push(obj);
  }

  const passages: WeaviateObject[] = [];
  for (let i = 0; i < passageIds.length; i++) {
    const obj: WeaviateObject = {
      id: passageIds[i],
      class: 'Passage',
      properties: {
        content: `Passage content ${i}`,
        type: 'document-passage',
      },
    };
    if (tenants) {
      obj.tenant = tenants[0].name!;
    }
    passages.push(obj);
  }

  let batch = client.batch.objectsBatcher();
  [...documents, ...passages].forEach((elem) => {
    batch = batch.withObject(elem);
  });
  await batch.do();

  const createReferences = (
    client: WeaviateClient,
    document: WeaviateObject,
    passages: WeaviateObject[],
    tenants?: Array<Tenant>
  ): void => {
    const ref: Reference = client.data
      .referencePayloadBuilder()
      .withId(document.id!)
      .withClassName(document.class!)
      .payload();
    for (const passage of passages) {
      const refCreator: ReferenceCreator = client.data
        .referenceCreator()
        .withId(passage.id!)
        .withClassName(passage.class!)
        .withReferenceProperty('ofDocument')
        .withReference(ref);
      if (tenants) {
        refCreator.withTenant(tenants[0].name!);
      }
      refCreator.do().catch((e: WeaviateError) => {
        throw new Error('it should not have errord: ' + e);
      });
    }
  };

  createReferences(client, documents[0], passages.slice(0, 10), tenants);
  createReferences(client, documents[1], passages.slice(10, 14), tenants);

  return new Promise((resolve) => setTimeout(resolve, 1000));
};
