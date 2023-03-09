export const Backend = {
  FILESYSTEM: "filesystem",
  S3: "s3",
  GCS: "gcs",
  AZURE: "azure",
};

export const CreateStatus = {
  STARTED: "STARTED",
  TRANSFERRING: "TRANSFERRING",
  TRANSFERRED: "TRANSFERRED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

export const RestoreStatus = {
  STARTED: "STARTED",
  TRANSFERRING: "TRANSFERRING",
  TRANSFERRED: "TRANSFERRED",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
};

const backupConsts = {
  Backend,
  CreateStatus,
  RestoreStatus,
};

export default backupConsts;
