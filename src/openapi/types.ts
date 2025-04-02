import { definitions } from './schema.js';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;
type DefaultProperties = { [key: string]: unknown };

export type WeaviateObject<T = DefaultProperties> = Override<definitions['Object'], { properties?: T }>;
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
export type BackupConfig = definitions['BackupConfig'];
export type RestoreConfig = definitions['RestoreConfig'];
// Batch
export type BatchDelete = definitions['BatchDelete'];
export type BatchDeleteResponse = definitions['BatchDeleteResponse'];
export type BatchRequest = {
  fields?: ('ALL' | 'class' | 'schema' | 'id' | 'creationTimeUnix')[];
  objects?: WeaviateObject<any>[];
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
export type WeaviateProperty = definitions['Property'];
export type WeaviateNestedProperty = definitions['NestedProperty'];
export type ShardStatus = definitions['ShardStatus'];
export type ShardStatusList = definitions['ShardStatusList'];
export type Tenant = definitions['Tenant'];
export type TenantActivityStatus = Tenant['activityStatus'];
export type SchemaClusterStatus = definitions['SchemaClusterStatus'];
export type WeaviateModuleConfig = WeaviateClass['moduleConfig'];
export type WeaviateInvertedIndexConfig = WeaviateClass['invertedIndexConfig'];
export type WeaviateBM25Config = definitions['BM25Config'];
export type WeaviateStopwordConfig = definitions['StopwordConfig'];
export type WeaviateMultiTenancyConfig = WeaviateClass['multiTenancyConfig'];
export type WeaviateReplicationConfig = WeaviateClass['replicationConfig'];
export type WeaviateShardingConfig = WeaviateClass['shardingConfig'];
export type WeaviateShardStatus = definitions['ShardStatusGetResponse'];
export type WeaviateUser = definitions['UserOwnInfo'];
export type WeaviateDBUser = definitions['DBUserInfo'];
export type WeaviateUserType = definitions['UserTypeOutput'];
export type WeaviateUserTypeInternal = definitions['UserTypeInput'];
export type WeaviateUserTypeDB = definitions['DBUserInfo']['dbUserType'];
export type WeaviateVectorIndexConfig = WeaviateClass['vectorIndexConfig'];
export type WeaviateVectorsConfig = WeaviateClass['vectorConfig'];
export type WeaviateVectorConfig = definitions['VectorConfig'];
// Nodes
export type NodesStatusResponse = definitions['NodesStatusResponse'];
export type NodeStats = definitions['NodeStats'];
export type BatchStats = definitions['BatchStats'];
export type NodeShardStatus = definitions['NodeShardStatus'];
// Meta
export type Meta = definitions['Meta'];
// RBAC
export type Role = definitions['Role'];
export type Permission = definitions['Permission'];
export type Action = definitions['Permission']['action'];
