import Aggregator from './aggregator';
import Getter from './getter';
import Explorer from './explorer';
import Raw from './raw';
import Connection from '../connection';

export interface IWeaviateClientGraphQL {
  get: () => Getter;
  aggregate: () => Aggregator;
  explore: () => Explorer;
  raw: () => Raw;
}

const graphql = (client: Connection): IWeaviateClientGraphQL => {
  return {
    get: () => new Getter(client),
    aggregate: () => new Aggregator(client),
    explore: () => new Explorer(client),
    raw: () => new Raw(client),
  };
};

export default graphql;
