import { DbVersion } from '@weaviate/core/utils/dbVersion';
import { describe, it, SuiteAPI, TestAPI } from 'vitest';

const version = DbVersion.fromString(`v${process.env.WEAVIATE_VERSION!}`);

/** Run the suite / test only for Weaviate version above this. */
export const requireAtLeast = (...semver: [...Parameters<DbVersion['isAtLeast']>]): any =>
  version.isAtLeast(...semver)
    ? {
        describe,
        it,
      }
    : {
        describe: describe.skip,
        it: it.skip,
      };
