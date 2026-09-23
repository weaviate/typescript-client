import { DbVersion, VersionProvider } from '@weaviate/core/utils/dbVersion';

export class TestDbVersionProvider implements VersionProvider {
  private version: string;

  constructor(version: string) {
    this.version = version;
  }

  getVersionString(): Promise<string> {
    return Promise.resolve(this.version);
  }

  getVersion(): Promise<DbVersion> {
    return Promise.resolve(DbVersion.fromString(this.version));
  }
}
