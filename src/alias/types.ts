export type Alias = {
  collection: string;
  alias: string;
};

export type CreateAliasArgs = {
  collection: string;
  alias: string;
};

export type UpdateAliasArgs = {
  newTargetCollection: string;
  alias: string;
};

export type AliasListAllOpts = {
  collection?: string | undefined;
};
