export type Alias = {
  collection: string;
  alias: string;
}

export type CreateAliasInput = {
  collection: string;
  alias: string;
};

export type UpdateAliasInput = {
  newTargetCollection: string;
  alias: string;
};
