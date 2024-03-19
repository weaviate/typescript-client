import ExtensionCreator from './extensionCreator.js';
import ConceptsGetter from './conceptsGetter.js';
import Connection from '../connection/index.js';

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
export { default as ExtensionCreator } from './extensionCreator.js';
export { default as ConceptsGetter } from './conceptsGetter.js';
