import Aggregator from "./aggregator";
import Getter from "./getter";
import Explorer from "./explorer";
import Raw from "./raw";

const graphql = (client) => {
  return {
    get: () => new Getter(client),
    aggregate: () => new Aggregator(client),
    explore: () => new Explorer(client),
    raw: () => new Raw(client),
  };
};

export default graphql;
