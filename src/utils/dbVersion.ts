import { ConnectionGQL } from '../index.js';
import MetaGetter from '../misc/metaGetter.js';

export class DbVersionSupport {
  private dbVersionProvider: VersionProvider;

  constructor(dbVersionProvider: VersionProvider) {
    this.dbVersionProvider = dbVersionProvider;
  }

  getVersion = () => this.dbVersionProvider.getVersion();

  supportsClassNameNamespacedEndpointsPromise() {
    return this.dbVersionProvider
      .getVersion()
      .then((version) => version.show())
      .then((version) => ({
        version: version,
        supports: this.supportsClassNameNamespacedEndpoints(version),
        warns: {
          deprecatedNonClassNameNamespacedEndpointsForObjects: () =>
            console.warn(
              `Usage of objects paths without className is deprecated in Weaviate ${version}. Please provide className parameter`
            ),
          deprecatedNonClassNameNamespacedEndpointsForReferences: () =>
            console.warn(
              `Usage of references paths without className is deprecated in Weaviate ${version}. Please provide className parameter`
            ),
          deprecatedNonClassNameNamespacedEndpointsForBeacons: () =>
            console.warn(
              `Usage of beacons paths without className is deprecated in Weaviate ${version}. Please provide className parameter`
            ),
          deprecatedWeaviateTooOld: () =>
            console.warn(
              `Usage of weaviate ${version} is deprecated. Please consider upgrading to the latest version. See https://www.weaviate.io/developers/weaviate for details.`
            ),
          notSupportedClassNamespacedEndpointsForObjects: () =>
            console.warn(
              `Usage of objects paths with className is not supported in Weaviate ${version}. className parameter is ignored`
            ),
          notSupportedClassNamespacedEndpointsForReferences: () =>
            console.warn(
              `Usage of references paths with className is not supported in Weaviate ${version}. className parameter is ignored`
            ),
          notSupportedClassNamespacedEndpointsForBeacons: () =>
            console.warn(
              `Usage of beacons paths with className is not supported in Weaviate ${version}. className parameter is ignored`
            ),
          notSupportedClassParameterInEndpointsForObjects: () =>
            console.warn(
              `Usage of objects paths with class query parameter is not supported in Weaviate ${version}. class query parameter is ignored`
            ),
        },
      }));
  }

  // >= 1.14
  supportsClassNameNamespacedEndpoints(version?: string) {
    if (typeof version === 'string') {
      const versionNumbers = version.split('.');
      if (versionNumbers.length >= 2) {
        const major = parseInt(versionNumbers[0], 10);
        const minor = parseInt(versionNumbers[1], 10);
        return (major == 1 && minor >= 14) || major >= 2;
      }
    }
    return false;
  }

  private errorMessage = (feature: string, current: string, required: string) =>
    `${feature} is not supported with Weaviate version v${current}. Please use version v${required} or higher.`;

  supportsCompatibleGrpcService = () =>
    this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 23, 7),
        message: this.errorMessage('The gRPC API', version.show(), '1.23.7'),
      };
    });

  supportsHNSWAndBQ = () =>
    this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 24, 0),
        message: this.errorMessage('HNSW index and BQ quantizer', version.show(), '1.24.0'),
      };
    });

  supportsBm25AndHybridGroupByQueries = () =>
    this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 25, 0),
        message: (query: 'Bm25' | 'Hybrid') =>
          this.errorMessage(`GroupBy with ${query}`, version.show(), '1.25.0'),
      };
    });

  supportsHybridNearTextAndNearVectorSubsearchQueries = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 25, 0),
        message: this.errorMessage('Hybrid nearText/nearVector subsearching', version.show(), '1.25.0'),
      };
    });
  };

  supports125ListValue = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 25, 0),
        message: undefined,
      };
    });
  };

  supportsNamedVectors = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 24, 0),
        message: this.errorMessage('Named vectors', version.show(), '1.24.0'),
      };
    });
  };

  requiresNamedVectorsInsertFix = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports:
          (version.isAtLeast(1, 24, 0) && version.isLowerThan(1, 24, 26)) ||
          (version.isAtLeast(1, 25, 0) && version.isLowerThan(1, 25, 22)) ||
          (version.isAtLeast(1, 26, 0) && version.isLowerThan(1, 26, 8)) ||
          (version.isAtLeast(1, 27, 0) && version.isLowerThan(1, 27, 1)),
        message: this.errorMessage(
          'Named vectors insert fix',
          version.show(),
          '1.24.0 <= x < 1.24.26, 1.25.0 <= x < 1.25.22, 1.26.0 <= x < 1.26.8, 1.27.0 <= x < 1.27.1'
        ),
      };
    });
  };

  supportsTenantsGetGRPCMethod = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 25, 0),
        message: this.errorMessage('Tenants get method', version.show(), '1.25.0'),
      };
    });
  };

  supportsDynamicVectorIndex = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 25, 0),
        message: this.errorMessage('Dynamic vector index', version.show(), '1.25.0'),
      };
    });
  };

  supportsMultiTargetVectorSearch = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 26, 0),
        message: this.errorMessage('Multi-target vector search', version.show(), '1.26.0'),
      };
    });
  };

  supportsMultiVectorSearch = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 26, 0),
        message: this.errorMessage('Multi-vector search', version.show(), '1.26.0'),
      };
    });
  };

  supportsMultiVectorPerTargetSearch = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 27, 0),
        message: this.errorMessage('Multi-vector-per-target search', version.show(), '1.27.0'),
      };
    });
  };

  supportsMultiWeightsPerTargetSearch = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 27, 0),
        message: this.errorMessage(
          'Multi-target vector search with multiple weights',
          version.show(),
          '1.27.0'
        ),
      };
    });
  };

  supportsAggregateGRPC = () => {
    return this.dbVersionProvider.getVersion().then((version) => {
      return {
        version: version,
        supports: version.isAtLeast(1, 29, 0),
        message: this.errorMessage('Aggregate gRPC method', version.show(), '1.29.0'),
      };
    });
  };
}

const EMPTY_VERSION = '';

export interface VersionProvider {
  getVersionString(): Promise<string>;
  getVersion(): Promise<DbVersion>;
}

export class DbVersionProvider implements VersionProvider {
  private versionPromise?: Promise<DbVersion>;
  private versionStringGetter: () => Promise<string>;

  constructor(versionStringGetter: () => Promise<string>) {
    this.versionStringGetter = versionStringGetter;
    this.versionPromise = undefined;
  }

  getVersionString(): Promise<string> {
    return this.getVersion().then((version) => version.show());
  }

  getVersion(): Promise<DbVersion> {
    if (this.versionPromise) {
      return this.versionPromise;
    }
    return this.versionStringGetter().then((version) => this.cache(version));
  }

  refresh(force = false): Promise<boolean> {
    if (force || !this.versionPromise) {
      this.versionPromise = undefined;
      return this.versionStringGetter()
        .then((version) => this.cache(version))
        .then(() => Promise.resolve(true));
    }
    return Promise.resolve(false);
  }

  cache(version: string): Promise<DbVersion> {
    if (version === EMPTY_VERSION) {
      return Promise.resolve(new DbVersion(0, 0, 0));
    }
    this.versionPromise = Promise.resolve(DbVersion.fromString(version));
    return this.versionPromise;
  }
}

export function initDbVersionProvider(conn: ConnectionGQL) {
  const metaGetter = new MetaGetter(conn);
  const versionGetter = () => {
    return metaGetter.do().then((result) => (result.version ? result.version : ''));
  };
  return new DbVersionProvider(versionGetter);
}

export class DbVersion {
  private major: number;
  private minor: number;
  private patch?: number;

  constructor(major: number, minor: number, patch?: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static fromString = (version: string) => {
    let regex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
    let match = version.match(regex);
    if (match) {
      const [_, major, minor, patch] = match;
      return new DbVersion(parseInt(major, 10), parseInt(minor, 10), parseInt(patch, 10));
    }

    regex = /^v?(\d+)\.(\d+)$/;
    match = version.match(regex);
    if (match) {
      const [_, major, minor] = match;
      return new DbVersion(parseInt(major, 10), parseInt(minor, 10));
    }

    throw new Error(`Invalid version string: ${version}`);
  };

  private checkNumber = (num: number) => {
    if (!Number.isSafeInteger(num)) {
      throw new Error(`Invalid number: ${num}`);
    }
  };

  show = () =>
    this.major === 0 && this.major === this.minor && this.minor === this.patch
      ? ''
      : `${this.major}.${this.minor}${this.patch !== undefined ? `.${this.patch}` : ''}`;

  isAtLeast = (major: number, minor: number, patch?: number) => {
    this.checkNumber(major);
    this.checkNumber(minor);

    if (this.major > major) return true;
    if (this.major < major) return false;

    if (this.minor > minor) return true;
    if (this.minor < minor) return false;

    if (this.patch !== undefined && patch !== undefined && this.patch >= patch) {
      this.checkNumber(patch);
      return true;
    }
    return false;
  };

  isLowerThan = (major: number, minor: number, patch: number) => !this.isAtLeast(major, minor, patch);
}
