import ClassCreator from "./classCreator";
import ClassDeleter from "./classDeleter";
import ClassGetter from "./classGetter";
import PropertyCreator from "./propertyCreator";
import Getter from "./getter";
import ShardsGetter from "./shardsGetter";
import ShardUpdater from "./shardUpdater";
import ShardsUpdater from "./shardsUpdater";

const schema = (client) => {
  return {
    classCreator: () => new ClassCreator(client),
    classDeleter: () => new ClassDeleter(client),
    classGetter: () => new ClassGetter(client),
    getter: () => new Getter(client),
    propertyCreator: () => new PropertyCreator(client),
    shardsGetter: () => new ShardsGetter(client),
    shardUpdater: () => new ShardUpdater(client),
    shardsUpdater: () =>  new ShardsUpdater(client)
  };
};

export default schema;
