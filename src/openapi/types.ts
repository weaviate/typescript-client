import { definitions } from './schema';

export type WeaviateObject = definitions['Object'];
export type WeaviateObjectsList = definitions['ObjectsListResponse'];
export type WeaviateObjectsGet = definitions['ObjectsGetResponse'];
export type Reference = definitions['SingleRef'];
export type WeaviateError = definitions['ErrorResponse'];
export type Properties = definitions['PropertySchema'];
export type Property = definitions['Property'];
export type DataObject = definitions['Object'];
// Backup
export type BackupCreateRequest = definitions['BackupCreateRequest'];
export type BackupCreateResponse = definitions['BackupCreateResponse'];
export type BackupCreateStatusResponse = definitions['BackupCreateStatusResponse'];
export type BackupRestoreRequest = definitions['BackupRestoreRequest'];
export type BackupRestoreResponse = definitions['BackupRestoreResponse'];
export type BackupRestoreStatusResponse = definitions['BackupRestoreStatusResponse'];
// Batch
export type BatchDelete = definitions['BatchDelete'];
export type BatchDeleteResponse = definitions['BatchDeleteResponse'];
export type BatchRequest = {
  fields?: ('ALL' | 'class' | 'schema' | 'id' | 'creationTimeUnix')[];
  objects?: WeaviateObject[];
};
export type BatchReference = definitions['BatchReference'];
export type BatchReferenceResponse = definitions['BatchReferenceResponse'];
// C11y
export type C11yWordsResponse = definitions['C11yWordsResponse'];
export type C11yExtension = definitions['C11yExtension'];
// Classifications
export type Classification = definitions['Classification'];
// GraphQL
export type WhereFilter = definitions['WhereFilter'];
// Schema
export type WeaviateSchema = definitions['Schema'];
export type WeaviateClass = definitions['Class'];
export type ShardStatus = definitions['ShardStatus'];
export type ShardStatusList = definitions['ShardStatusList'];
