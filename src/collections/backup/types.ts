import { Backend, BackupCompressionLevel } from '../../index.js';
import { WeaviateBackupStatus } from '../../openapi/types.js';

/** The status of a backup operation */
export type BackupStatus = NonNullable<WeaviateBackupStatus>;

/** The status of a backup operation */
export type BackupStatusReturn = {
  /** The ID of the backup */
  id: string;
  /** The error message if the backup failed */
  error?: string;
  /** The path to the backup */
  path: string;
  /** The status of the backup */
  status: BackupStatus;
  /** Size of the backup in Gibs */
  size?: number;
  /**
   * The ID of the backup this incremental backup was built on.
   * Empty if the backup is not incremental.
   *
   * Only populated for callers that Weaviate has confirmed as root users.
   */
  baseBackupId?: string;
};

/** The return type of a backup creation or restoration operation */
export type BackupReturn = BackupStatusReturn & {
  /** The backend to which the backup was created or restored */
  backend: Backend;
  /** The collections that were included in the backup */
  collections: string[];
  /** Timestamp when the backup process started  */
  startedAt?: Date;
  /** Timestamp when the backup process completed (successfully or with failure) */
  completedAt?: Date;
};

/** Configuration options available when creating a backup */
export type BackupConfigCreate = {
  /** Deprecated: This parameter no longer has any effect. (The size of the chunks to use for the backup.) */
  chunkSize?: number;
  /** The standard of compression to use for the backup. */
  compressionLevel?: BackupCompressionLevel;
  /** The percentage of CPU to use for the backup creation job. */
  cpuPercentage?: number;
};

/** Configuration options available when restoring a backup */
export type BackupConfigRestore = {
  /** The percentage of CPU to use for the backuop restoration job. */
  cpuPercentage?: number;
  /** Allows overwriting the collection alias if there is a conflict. */
  overwriteAlias?: boolean;
};

/** The arguments required to create and restore backups. */
export type BackupArgs<C extends BackupConfigCreate | BackupConfigRestore> = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The collections to include in the backup. */
  includeCollections?: string[];
  /** The collections to exclude from the backup. */
  excludeCollections?: string[];
  /** Whether to wait for the backup to complete. */
  waitForCompletion?: boolean;
  /** The configuration options for the backup. */
  config?: C;
};

/** The arguments required to create a backup. */
export type BackupCreateArgs = BackupArgs<BackupConfigCreate> & {
  /**
   * The ID of an existing backup to use as the base for a file-based incremental backup.
   * If set, only files that have changed since the base backup are included in the new backup.
   *
   * Requires Weaviate `1.34.18`/`1.35.13`/`1.36.3` or higher.
   */
  baseBackupId?: string;
};

/** The arguments required to get the status of a backup. */
export type BackupStatusArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
};

/** The arguments required to cancel a backup. */
export type BackupCancelArgs = {
  /** The ID of the backup. */
  backupId: string;
  /** The backend to use for the backup. */
  backend: Backend;
  /** The type of operation to cancel (backup creation or restoration). Defaults to 'create'. */
  operation?: 'create' | 'restore';
};

/** The options available when listing backups. */
export type ListBackupOptions = {
  startedAtAsc?: boolean;
};
