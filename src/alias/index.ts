import { ConnectionREST } from '../index.js';
import { WeaviateAlias, WeaviateAliasResponse } from '../openapi/types.js';
import { Alias, CreateAliasInput, UpdateAliasInput } from './types.js';

export interface Aliases {
  /**
   * Create alias for a collection.
   *
   * The collection must exist prior to aliasing it.
   * One alias cannot be created for multiple collections simultaneously.
   *
   * @param {string} [opt.collection] Original collection name.
   * @param {string} [opt.alias] Alias for collection.
   * @returns {Promise<void>} Awaitable promise.
   * */
  create: (opt: CreateAliasInput) => Promise<void>;

  /**
   * List all aliases defined in the schema.
   *
   * @param {string | undefined} collection Get all aliases defined for this collection.
   * @returns {Promise<Alias[] | undefined>} An array of aliases.
   */
  listAll: (collection?: string) => Promise<Alias[] | undefined>;

  /**
   * Get information about an alias.
   *
   * @param {string} alias Alias to fetch.
   * @return {Promise<Alias>} Alias definition.
   */
  get: (alias: string) => Promise<Alias>;

  /**
   * Replace target collection the alias points to.
   *
   * To change the alias that points to the collection,
   * delete the alias and create a new one.
   *
   * @param {string} [opt.alias] Alias to update.
   * @param {string} [opt.collection] New collection the alias should point to.
   * @return {Promise<void>} Awaitable promise.
   */
  update: (opt: UpdateAliasInput) => Promise<void>;

  /**
   * Delete a collection alias.
   *
   * @param {string} alias Alias definition to delete.
   * @return {Promise<void>} Awaitable promise.
   */
  delete: (alias: string) => Promise<void>;
}

const alias = (connection: ConnectionREST): Aliases => {
  return {
    create: (opt: CreateAliasInput) =>
      connection.postReturn<WeaviateAlias, void>(`/aliases/`, { ...opt, class: opt.collection }),
    listAll: (collection?: string) =>
      connection
        .get<WeaviateAliasResponse>(`/aliases${collection !== undefined ? '/?class=' + collection : ''}`)
        .then((aliases) =>
          aliases.aliases !== undefined
            ? aliases.aliases.map((alias) => ({ alias: alias.alias, collection: alias.class }))
            : []
        ),
    get: (alias: string) =>
      connection
        .get<WeaviateAlias>(`/aliases/${alias}`)
        .then((alias) => ({ alias: alias.alias!, collection: alias.class! })),
    update: (opt: UpdateAliasInput) =>
      connection.put(`/aliases/${opt.alias}`, { class: opt.newTargetCollection }),
    delete: (alias: string) => connection.delete(`/aliases/${alias}`, null),
  };
};

export default alias;
