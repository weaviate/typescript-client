import { definitions } from './schema';

export type WeaviateObject = definitions['Object'];
export type WeaviateObjectList = definitions['ObjectsListResponse'];
export type Reference = definitions['SingleRef'];
export type WeaviateError = definitions['ErrorResponse'];
export type Properties = definitions['PropertySchema'];
export type DataObject = definitions['Object'];
// Backup
export type BackupCreateRequest = definitions['BackupCreateRequest'];
export type BackupCreateResponse = definitions['BackupCreateResponse'];
export type BackupCreateStatusResponse = definitions['BackupCreateStatusResponse'];
export type BackupRestoreRequest = definitions['BackupRestoreRequest'];
export type BackupRestoreResponse = definitions['BackupRestoreResponse'];
export type BackupRestoreStatusResponse = definitions['BackupRestoreStatusResponse'];
