import { ListOfVectors, PrimitiveVectorType } from './types.js';
import { NearVectorInputGuards } from './utils.js';

const hybridVector = {
  nearText: () => {},
  nearVector: () => {},
};

const nearVector = {
  listOfVectors: <V extends PrimitiveVectorType>(...vectors: V[]): ListOfVectors<V> => {
    return {
      kind: 'listOfVectors',
      dimensionality: NearVectorInputGuards.is1D(vectors[0]) ? '1D' : '2D',
      vectors,
    };
  },
};

export const queryFactory = {
  hybridVector,
  nearVector,
};
