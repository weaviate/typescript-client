import Connection from '../../connection/grpc.js';
import { ConsistencyLevel } from '../../data/index.js';
import { WeaviateInvalidInputError } from '../../errors.js';
import ClassExists from '../../schema/classExists.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import aggregate, { Aggregate, Metrics, metrics } from '../aggregate/index.js';
import { BackupCollection, backupCollection } from '../backup/collection.js';
import config, { Config } from '../config/index.js';
import data, { Data } from '../data/index.js';
import filter, { Filter } from '../filters/index.js';
import generate, { Generate } from '../generate/index.js';
import { Iterator } from '../iterator/index.js';
import query, { Query } from '../query/index.js';
import sort, { Sort } from '../sort/index.js';
import tenants, { TenantBase, Tenants } from '../tenants/index.js';
import { QueryMetadata, QueryProperty, QueryReference, ReturnVectors } from '../types/index.js';
import { IncludeVector } from '../types/internal.js';
import multiTargetVector, { MultiTargetVector } from '../vectors/multiTargetVector.js';

export interface Collection<T = undefined, N = string, V = undefined> {
  /** This namespace includes all the querying methods available to you when using Weaviate's standard aggregation capabilities. */
  aggregate: Aggregate<T, V>;
  /** This namespace includes all the backup methods available to you when backing up a collection in Weaviate. */
  backup: BackupCollection;
  /** This namespace includes all the CRUD methods available to you when modifying the configuration of the collection in Weaviate. */
  config: Config<T>;
  /** This namespace includes all the CUD methods available to you when modifying the data of the collection in Weaviate. */
  data: Data<T>;
  /** This namespace includes the methods by which you can create the `FilterValue<V>` values for use when filtering queries over your collection. */
  filter: Filter<T extends undefined ? any : T>;
  /** This namespace includes all the querying methods available to you when using Weaviate's generative capabilities. */
  generate: Generate<T, V>;
  /** This namespace includes the methods by which you can create the `MetricsX` values for use when aggregating over your collection. */
  metrics: Metrics<T>;
  /** The name of the collection. */
  name: N;
  /** This namespace includes all the querying methods available to you when using Weaviate's standard query capabilities. */
  query: Query<T, V>;
  /** This namespaces includes the methods by which you can create the `Sorting<T>` values for use when sorting queries over your collection. */
  sort: Sort<T>;
  /** This namespace includes all the CRUD methods available to you when modifying the tenants of a multi-tenancy-enabled collection in Weaviate. */
  tenants: Tenants;
  /** This namespaces includes the methods by which you cna create the `MultiTargetVectorJoin` values for use when performing multi-target vector searches over your collection. */
  multiTargetVector: MultiTargetVector<V>;
  /**
   * Use this method to check if the collection exists in Weaviate.
   *
   * @returns {Promise<boolean>} A promise that resolves to `true` if the collection exists, and `false` otherwise.
   */
  exists: () => Promise<boolean>;
  /**
   * Use this method to return an iterator over the objects in the collection.
   *
   * This iterator keeps a record of the last object that it returned to be used in each subsequent call to Weaviate.
   * Once the collection is exhausted, the iterator exits.
   *
   * @typeParam I - The vector(s) to include in the response. If using named vectors, pass an array of strings to include only specific vectors.
   * @typeParam RV - The vectors(s) to be returned in the response depending on the input in opts.includeVector.
   * @param {IteratorOptions<T>} opts The options to use when fetching objects from Weaviate.
   * @returns {Iterator<T>} An iterator over the objects in the collection as an async generator.
   *
   * @description If `return_properties` is not provided, all the properties of each object will be
   * requested from Weaviate except for its vector as this is an expensive operation. Specify `include_vector`
   * to request the vectors back as well. In addition, if `return_references=None` then none of the references
   * are returned. Use `wvc.QueryReference` to specify which references to return.
   */
  iterator: <I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(
    opts?: IteratorOptions<T, I>
  ) => Iterator<T, RV>;
  /**
   * Use this method to return the total number of objects in the collection.
   *
   * This is a short-hand for calling `collection.aggregate.overAll().then(({ totalCount }) => totalCount)`.
   */
  length: () => Promise<number>;
  /**
   * Use this method to return a collection object specific to a single consistency level.
   *
   * If replication is not configured for this collection then Weaviate will throw an error.
   *
   * This method does not send a request to Weaviate. It only returns a new collection object that is specific to the consistency level you specify.
   *
   * @param {ConsistencyLevel} consistencyLevel The consistency level to use.
   * @returns {Collection<T, N, V>} A new collection object specific to the consistency level you specified.
   */
  withConsistency: (consistencyLevel: ConsistencyLevel) => Collection<T, N, V>;
  /**
   * Use this method to return a collection object specific to a single tenant.
   *
   * If multi-tenancy is not configured for this collection then Weaviate will throw an error.
   *
   * This method does not send a request to Weaviate. It only returns a new collection object that is specific to the tenant you specify.
   *
   * @typedef {TenantBase} TT A type that extends TenantBase.
   * @param {string | TT} tenant The tenant name or tenant object to use.
   * @returns {Collection<T, N, V>} A new collection object specific to the tenant you specified.
   */
  withTenant: <TT extends TenantBase>(tenant: string | TT) => Collection<T, N, V>;
}

export type IteratorOptions<T, I> = {
  includeVector?: I;
  returnMetadata?: QueryMetadata;
  returnProperties?: QueryProperty<T>[];
  returnReferences?: QueryReference<T>[];
};

const isString = (value: any): value is string => typeof value === 'string';

const capitalizeCollectionName = <N extends string>(name: N): N =>
  (name.charAt(0).toUpperCase() + name.slice(1)) as N;

const collection = <T, N, V>(
  connection: Connection,
  name: N,
  dbVersionSupport: DbVersionSupport,
  consistencyLevel?: ConsistencyLevel,
  tenant?: string
): Collection<T, N, V> => {
  if (!isString(name)) {
    throw new WeaviateInvalidInputError(`The collection name must be a string, got: ${typeof name}`);
  }
  const capitalizedName = capitalizeCollectionName(name);
  const aggregateCollection = aggregate<T, V>(
    connection,
    capitalizedName,
    dbVersionSupport,
    consistencyLevel,
    tenant
  );
  const queryCollection = query<T, V>(
    connection,
    capitalizedName,
    dbVersionSupport,
    consistencyLevel,
    tenant
  );
  return {
    aggregate: aggregateCollection,
    backup: backupCollection(connection, capitalizedName),
    config: config<T>(connection, capitalizedName, dbVersionSupport, tenant),
    data: data<T>(connection, capitalizedName, dbVersionSupport, consistencyLevel, tenant),
    filter: filter<T extends undefined ? any : T>(),
    generate: generate<T, V>(connection, capitalizedName, dbVersionSupport, consistencyLevel, tenant),
    metrics: metrics<T>(),
    multiTargetVector: multiTargetVector<V>(),
    name: name,
    query: queryCollection,
    sort: sort<T>(),
    tenants: tenants(connection, capitalizedName, dbVersionSupport),
    exists: () => new ClassExists(connection).withClassName(capitalizedName).do(),
    iterator: <I extends IncludeVector<V>, RV extends ReturnVectors<V, I>>(opts?: IteratorOptions<T, I>) =>
      new Iterator<T, RV>((limit: number, after?: string) =>
        queryCollection
          .fetchObjects<I, RV>({
            limit,
            after,
            includeVector: opts?.includeVector,
            returnMetadata: opts?.returnMetadata,
            returnProperties: opts?.returnProperties,
            returnReferences: opts?.returnReferences,
          })
          .then((res) => res.objects)
      ),
    length: () => aggregateCollection.overAll().then(({ totalCount }) => totalCount),
    withConsistency: (consistencyLevel: ConsistencyLevel) =>
      collection<T, N, V>(connection, capitalizedName, dbVersionSupport, consistencyLevel, tenant),
    withTenant: <TT extends TenantBase>(tenant: string | TT) =>
      collection<T, N, V>(
        connection,
        capitalizedName,
        dbVersionSupport,
        consistencyLevel,
        typeof tenant === 'string' ? tenant : tenant.name
      ),
  };
};

export default collection;
