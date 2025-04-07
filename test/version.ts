import { DbVersion } from '../src/utils/dbVersion';

const version = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`);

/** Run the suite / test only for Weaviate version above this. */
export const requireAtLeast = (...semver: [...Parameters<DbVersion['isAtLeast']>]) =>
  version.isAtLeast(...semver) ? describe : describe.skip;
