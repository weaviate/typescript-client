import ConnectionGRPC from '../connection/grpc.js';
export declare class DbVersionSupport {
  private dbVersionProvider;
  constructor(dbVersionProvider: VersionProvider);
  getVersion: () => Promise<DbVersion>;
  supportsClassNameNamespacedEndpointsPromise(): Promise<{
    version: string;
    supports: boolean;
    warns: {
      deprecatedNonClassNameNamespacedEndpointsForObjects: () => void;
      deprecatedNonClassNameNamespacedEndpointsForReferences: () => void;
      deprecatedNonClassNameNamespacedEndpointsForBeacons: () => void;
      deprecatedWeaviateTooOld: () => void;
      notSupportedClassNamespacedEndpointsForObjects: () => void;
      notSupportedClassNamespacedEndpointsForReferences: () => void;
      notSupportedClassNamespacedEndpointsForBeacons: () => void;
      notSupportedClassParameterInEndpointsForObjects: () => void;
    };
  }>;
  supportsClassNameNamespacedEndpoints(version?: string): boolean;
  private errorMessage;
  supportsCompatibleGrpcService: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsHNSWAndBQ: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsBm25AndHybridGroupByQueries: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: (query: 'Bm25' | 'Hybrid') => string;
  }>;
  supportsHybridNearTextAndNearVectorSubsearchQueries: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supports125ListValue: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: undefined;
  }>;
  supportsNamedVectors: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsTenantsGetGRPCMethod: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsDynamicVectorIndex: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsMultiTargetVectorSearch: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsMultiVectorSearch: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsMultiVectorPerTargetSearch: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
  supportsMultiWeightsPerTargetSearch: () => Promise<{
    version: DbVersion;
    supports: boolean;
    message: string;
  }>;
}
export interface VersionProvider {
  getVersionString(): Promise<string>;
  getVersion(): Promise<DbVersion>;
}
export declare class DbVersionProvider implements VersionProvider {
  private versionPromise?;
  private versionStringGetter;
  constructor(versionStringGetter: () => Promise<string>);
  getVersionString(): Promise<string>;
  getVersion(): Promise<DbVersion>;
  refresh(force?: boolean): Promise<boolean>;
  cache(version: string): Promise<DbVersion>;
}
export declare function initDbVersionProvider(conn: ConnectionGRPC): DbVersionProvider;
export declare class DbVersion {
  private major;
  private minor;
  private patch?;
  constructor(major: number, minor: number, patch?: number);
  static fromString: (version: string) => DbVersion;
  private checkNumber;
  show: () => string;
  isAtLeast: (major: number, minor: number, patch?: number) => boolean;
  isLowerThan: (major: number, minor: number, patch: number) => boolean;
}
