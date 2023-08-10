import Aggregator from './aggregator';
import GraphQLGetter from './getter';
import Explorer from './explorer';
import Raw from './raw';
import Connection from '../connection';

export interface GraphQL {
  get: <TClassName extends string, TClass extends Record<string, any>>() => GraphQLGetter<TClassName, TClass>;
  aggregate: () => Aggregator;
  explore: () => Explorer;
  raw: () => Raw;
}

const graphql = (client: Connection): GraphQL => {
  return {
    get: <TClassName extends string, TClass extends Record<string, any>>() =>
      GraphQLGetter.use<TClassName, TClass>(client),
    aggregate: () => new Aggregator(client),
    explore: () => new Explorer(client),
    raw: () => new Raw(client),
  };
};

export default graphql;
export { default as Aggregator } from './aggregator';
export { default as GraphQLGetter } from './getter';
export { default as Explorer } from './explorer';
export { default as Raw } from './raw';
export { FusionType } from './getter';
