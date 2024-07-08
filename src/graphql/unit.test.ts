import GraphQLNearVector, { NearVectorTargets } from './nearVector';

describe('Unit testing of the builder classes', () => {
  describe('GraphQLNearVector', () => {
    it('should successfully pass multiple vectors', () => {
      const nearVector = new GraphQLNearVector({
        vector: {
          one: [1, 2, 3],
          two: [4, 5, 6],
        },
      });
      expect(nearVector.toString()).toEqual(
        '{vectorPerTarget:{one:[1,2,3],two:[4,5,6]},targets:{targetVectors:["one","two"]}}'
      );
    });

    it('should successfully pass sum targets', () => {
      const nearVector = new GraphQLNearVector({
        vector: [1, 2, 3],
        targetVectors: NearVectorTargets.sum(['one', 'two']),
      });
      expect(nearVector.toString()).toEqual(
        '{vector:[1,2,3],targets:{combinationMethod:sum,targetVectors:["one","two"]}}'
      );
    });

    it('should successfully pass weighted targets', () => {
      const nearVector = new GraphQLNearVector({
        vector: [1, 2, 3],
        targetVectors: NearVectorTargets.manualWeights({ one: 0.5, two: 0.5 }),
      });
      expect(nearVector.toString()).toEqual(
        '{vector:[1,2,3],targets:{combinationMethod:manualWeights,targetVectors:["one","two"],weights:{one:0.5,two:0.5}}}'
      );
    });
  });
});
