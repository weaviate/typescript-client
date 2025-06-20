import Connection from '../../connection/index.js';
import Aggregator from './aggregator.js';
import Explorer from './explorer.js';
import GraphQLGetter from './getter.js';
import Raw from './raw.js';

export interface GraphQL {
  get: () => GraphQLGetter;
  aggregate: () => Aggregator;
  explore: () => Explorer;
  raw: () => Raw;
}

const graphql = (client: Connection): GraphQL => {
  return {
    get: () => new GraphQLGetter(client),
    aggregate: () => new Aggregator(client),
    explore: () => new Explorer(client),
    raw: () => new Raw(client),
  };
};

export default graphql;
export { default as Aggregator } from './aggregator.js';
export { default as Explorer } from './explorer.js';
export { FusionType, default as GraphQLGetter } from './getter.js';
export { default as Raw } from './raw.js';
