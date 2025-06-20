import Connection from '../../connection/index.js';
import ConceptsGetter from './conceptsGetter.js';
import ExtensionCreator from './extensionCreator.js';

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
export { default as ConceptsGetter } from './conceptsGetter.js';
export { default as ExtensionCreator } from './extensionCreator.js';
