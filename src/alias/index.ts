import { ConnectionREST } from "../index.js";
import { WeaviateAlias, WeaviateAliasResponse } from "../openapi/types.js";
import { Alias, CreateAliasInput, UpdateAliasInput } from "./types.js";

export interface Aliases {
  create: (opt: CreateAliasInput) => Promise<void>;
  listAll: (collection?: string) => Promise<Alias[] | undefined>
  get: (alias: string) => Promise<Alias>;
  update: (opt: UpdateAliasInput) => Promise<void>;
  delete: (alias: string) => Promise<void>;
}

const alias = (connection: ConnectionREST): Aliases => {
  return {
    create: (opt: CreateAliasInput) => connection.postReturn<WeaviateAlias, void>(
      `/aliases/`, { ...opt, class: opt.collection }),
    listAll: (collection?: string) => connection.get<WeaviateAliasResponse>(
      `/aliases${collection !== undefined ? "/?class=" + collection : ""}`)
      .then(aliases => aliases.aliases !== undefined
        ? aliases.aliases.map(alias => ({ alias: alias.alias, collection: alias.class }))
        : []),
    get: (alias: string) => connection.get<WeaviateAlias>(`/aliases/${alias}`)
      .then(alias => ({ alias: alias.alias!, collection: alias.class! })),
    update: (opt: UpdateAliasInput) => connection.put(
      `/aliases/${opt.alias}`, { class: opt.newTargetCollection }),
    delete: (alias: string) => connection.delete(
      `/aliases/${alias}`, null),
  }
}

export default alias;
