import ExtensionCreator from './extensionCreator';
import ConceptsGetter from './conceptsGetter';
import Connection from '../connection';

export interface C11y {
  conceptsGetter: () => ConceptsGetter;
  extensionCreator: () => ExtensionCreator;
}

const c11y = (client: Connection): C11y => {
  return {
    conceptsGetter: () => new ConceptsGetter(client),
    extensionCreator: () => new ExtensionCreator(client),
  };
};

export default c11y;
export { default as ExtensionCreator } from './extensionCreator';
export { default as ConceptsGetter } from './conceptsGetter';
