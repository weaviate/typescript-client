import ExtensionCreator from "./extensionCreator";
import ConceptsGetter from "./conceptsGetter";
import Connection from "../connection";

export interface IWeaviateClientC11y {
  conceptsGetter: () => ConceptsGetter
  extensionCreator: () => ExtensionCreator
}

const c11y = (client: Connection): IWeaviateClientC11y => {
  return {
    conceptsGetter: () => new ConceptsGetter(client),
    extensionCreator: () => new ExtensionCreator(client),
  };
};

export default c11y;
