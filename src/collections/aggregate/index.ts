import Connection from '../../connection/index.js';

import { ConsistencyLevel } from '../../data/index.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

import { FilterValue } from '../filters/index.js';

import { WeaviateQueryError } from '../../errors.js';
import { Aggregator } from '../../graphql/index.js';
import { PrimitiveKeys, toBase64FromMedia } from '../../index.js';
import { Bm25QueryProperty } from '../query/types.js';
import { Serialize } from '../serialize/index.js';

export type AggregateBaseOptions<T, M> = {
  filters?: FilterValue;
  returnMetrics?: M;
};

export type AggregateGroupByOptions<T, M> = AggregateOptions<T, M> & {
  groupBy: (keyof T & string) | GroupByAggregate<T>;
};

export type GroupByAggregate<T> = {
  property: keyof T & string;
  limit?: number;
};

export type AggregateOptions<T, M> = AggregateBaseOptions<T, M>;

export type AggregateBaseOverAllOptions<T, M> = AggregateBaseOptions<T, M>;

export type AggregateNearOptions<T, M> = AggregateBaseOptions<T, M> & {
  certainty?: number;
  distance?: number;
  objectLimit?: number;
  targetVector?: string;
};

export type AggregateHybridOptions<T, M> = AggregateBaseOptions<T, M> & {
  alpha?: number;
  maxVectorDistance?: number;
  objectLimit?: number;
  queryProperties?: (PrimitiveKeys<T> | Bm25QueryProperty<T>)[];
  targetVector?: string;
  vector?: number[];
};

export type AggregateGroupByHybridOptions<T, M> = AggregateHybridOptions<T, M> & {
  groupBy: (keyof T & string) | GroupByAggregate<T>;
};

export type AggregateGroupByNearOptions<T, M> = AggregateNearOptions<T, M> & {
  groupBy: (keyof T & string) | GroupByAggregate<T>;
};

export type AggregateBoolean = {
  count?: number;
  percentageFalse?: number;
  percentageTrue?: number;
  totalFalse?: number;
  totalTrue?: number;
};

export type AggregateDate = {
  count?: number;
  maximum?: number;
  median?: number;
  minimum?: number;
  mode?: number;
};

export type AggregateNumber = {
  count?: number;
  maximum?: number;
  mean?: number;
  median?: number;
  minimum?: number;
  mode?: number;
  sum?: number;
};

export type AggregateReference = {
  pointingTo?: string;
};

export type AggregateText = {
  count?: number;
  topOccurrences?: {
    occurs?: number;
    value?: number;
  }[];
};

export type MetricsInput<N extends string> =
  | MetricsBoolean<N>
  | MetricsInteger<N>
  | MetricsNumber<N>
  | MetricsText<N>
  | MetricsDate<N>;
// | MetricsReference<T>;

export type PropertiesMetrics<T> = T extends undefined
  ? MetricsInput<string> | MetricsInput<string>[]
  : MetricsInput<keyof T & string> | MetricsInput<keyof T & string>[];

export type MetricsBase<N extends string, K extends 'boolean' | 'date' | 'integer' | 'number' | 'text'> = {
  kind: K;
  propertyName: N;
};

export type Option<A> = { [key in keyof A]: boolean };

export type BooleanKeys = 'count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue';
export type DateKeys = 'count' | 'maximum' | 'median' | 'minimum' | 'mode';
export type NumberKeys = 'count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum';

export type MetricsBoolean<N extends string> = MetricsBase<N, 'boolean'> &
  Partial<{ [key in BooleanKeys]: boolean }>;
export type MetricsDate<N extends string> = MetricsBase<N, 'date'> & Partial<{ [key in DateKeys]: boolean }>;
export type MetricsInteger<N extends string> = MetricsBase<N, 'integer'> &
  Partial<{ [key in NumberKeys]: boolean }>;
export type MetricsNumber<N extends string> = MetricsBase<N, 'number'> &
  Partial<{ [key in NumberKeys]: boolean }>;
// type MetricsReference<T> = {
//   kind: 'reference';
//   propertyName: RefKeys<T>;
//   pointingTo?: boolean;
//   type?: boolean;
// };
export type MetricsText<N extends string> = MetricsBase<N, 'text'> & {
  count?: boolean;
  topOccurrences?: {
    occurs?: boolean;
    value?: boolean;
  };
  minOccurrences?: number;
};

export type AggregateMetrics<M> = {
  [K in keyof M]: M[K] extends true ? number : never;
};

export type MetricsProperty<T> = T extends undefined ? string : keyof T & string;

export const metrics = <T>() => {
  return {
    aggregate: <P extends MetricsProperty<T>>(property: P) => new MetricsManager<T, P>(property),
  };
};

export interface Metrics<T> {
  /**
   * Define the metrics to be returned based on a property when aggregating over a collection.

    Use this `aggregate` method to define the name to the property to be aggregated on.
    Then use the `text`, `integer`, `number`, `boolean`, `date_`, or `reference` methods to define the metrics to be returned.

    See [the docs](https://weaviate.io/developers/weaviate/search/aggregate) for more details!
   */
  aggregate: <P extends MetricsProperty<T>>(property: P) => MetricsManager<T, P>;
}

export class MetricsManager<T, P extends MetricsProperty<T>> {
  private propertyName: P;

  constructor(property: P) {
    this.propertyName = property;
  }

  private map<A>(metrics: (keyof A)[]): Option<A> {
    const out: any = {};
    metrics.forEach((metric) => {
      out[metric] = true;
    });
    return out as Option<A>;
  }

  /**
   * Define the metrics to be returned for a BOOL or BOOL_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue')[]} metrics The metrics to return.
   * @returns {MetricsBoolean<P>} The metrics for the property.
   */
  public boolean(
    metrics?: ('count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue')[]
  ): MetricsBoolean<P> {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'percentageFalse', 'percentageTrue', 'totalFalse', 'totalTrue'];
    }
    return {
      ...this.map(metrics),
      kind: 'boolean',
      propertyName: this.propertyName,
    };
  }

  /**
   * Define the metrics to be returned for a DATE or DATE_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'median' | 'minimum' | 'mode')[]} metrics The metrics to return.
   * @returns {MetricsDate<P>} The metrics for the property.
   */
  public date(metrics?: ('count' | 'maximum' | 'median' | 'minimum' | 'mode')[]): MetricsDate<P> {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'median', 'minimum', 'mode'];
    }
    return {
      ...this.map(metrics),
      kind: 'date',
      propertyName: this.propertyName,
    };
  }

  /**
   * Define the metrics to be returned for an INT or INT_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]} metrics The metrics to return.
   * @returns {MetricsInteger<P>} The metrics for the property.
   */
  public integer(
    metrics?: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsInteger<P> {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum'];
    }
    return {
      ...this.map(metrics),
      kind: 'integer',
      propertyName: this.propertyName,
    };
  }

  /**
   * Define the metrics to be returned for a NUMBER or NUMBER_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]} metrics The metrics to return.
   * @returns {MetricsNumber<P>} The metrics for the property.
   */
  public number(
    metrics?: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsNumber<P> {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum'];
    }
    return {
      ...this.map(metrics),
      kind: 'number',
      propertyName: this.propertyName,
    };
  }

  // public reference(metrics: 'pointingTo'[]): MetricsReference<T> {
  //   return {
  //     ...this.map(metrics),
  //     kind: 'reference',
  //     propertyName: this.propertyName,
  //   };
  // }

  /**
   * Define the metrics to be returned for a TEXT or TEXT_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'topOccurrencesOccurs' | 'topOccurrencesValue')[]} metrics The metrics to return.
   * @param {number} [minOccurrences] The how many top occurrences to return.
   * @returns {MetricsText<P>} The metrics for the property.
   */
  public text(
    metrics?: ('count' | 'topOccurrencesOccurs' | 'topOccurrencesValue')[],
    minOccurrences?: number
  ): MetricsText<P> {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'topOccurrencesOccurs', 'topOccurrencesValue'];
    }
    return {
      count: metrics.includes('count'),
      topOccurrences:
        metrics.includes('topOccurrencesOccurs') || metrics.includes('topOccurrencesValue')
          ? {
              occurs: metrics.includes('topOccurrencesOccurs'),
              value: metrics.includes('topOccurrencesValue'),
            }
          : undefined,
      minOccurrences,
      kind: 'text',
      propertyName: this.propertyName,
    };
  }
}

type KindToAggregateType<K> = K extends 'text'
  ? AggregateText
  : K extends 'date'
  ? AggregateDate
  : K extends 'integer'
  ? AggregateNumber
  : K extends 'number'
  ? AggregateNumber
  : K extends 'boolean'
  ? AggregateBoolean
  : K extends 'reference'
  ? AggregateReference
  : never;

export type AggregateType = AggregateBoolean | AggregateDate | AggregateNumber | AggregateText;

export type AggregateResult<T, M extends PropertiesMetrics<T> | undefined = undefined> = {
  properties: T extends undefined
    ? Record<string, AggregateType>
    : M extends MetricsInput<keyof T & string>[]
    ? {
        [K in M[number] as K['propertyName']]: KindToAggregateType<K['kind']>;
      }
    : M extends MetricsInput<keyof T & string>
    ? {
        [K in M as K['propertyName']]: KindToAggregateType<K['kind']>;
      }
    : undefined;
  totalCount: number;
};

export type AggregateGroupByResult<
  T,
  M extends PropertiesMetrics<T> | undefined = undefined
> = AggregateResult<T, M> & {
  groupedBy: {
    prop: string;
    value: string;
  };
};

class AggregateManager<T> implements Aggregate<T> {
  connection: Connection;
  groupBy: AggregateGroupBy<T>;
  name: string;
  dbVersionSupport: DbVersionSupport;
  consistencyLevel?: ConsistencyLevel;
  tenant?: string;

  private constructor(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ) {
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;

    this.groupBy = {
      hybrid: <M extends PropertiesMetrics<T> | undefined = undefined>(
        query: string,
        opts: AggregateGroupByHybridOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        let builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withHybrid({
          query: query,
          alpha: opts?.alpha,
          maxVectorDistance: opts?.maxVectorDistance,
          properties: opts?.queryProperties as string[],
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
          vector: opts?.vector,
        });
        if (opts?.objectLimit) {
          builder = builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearImage: async <M extends PropertiesMetrics<T> | undefined = undefined>(
        image: string | Buffer,
        opts: AggregateGroupByNearOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withNearImage({
          image: await toBase64FromMedia(image),
          certainty: opts?.certainty,
          distance: opts?.distance,
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts?.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearObject: <M extends PropertiesMetrics<T> | undefined = undefined>(
        id: string,
        opts: AggregateGroupByNearOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withNearObject({
          id: id,
          certainty: opts?.certainty,
          distance: opts?.distance,
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearText: <M extends PropertiesMetrics<T> | undefined = undefined>(
        query: string | string[],
        opts: AggregateGroupByNearOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withNearText({
          concepts: Array.isArray(query) ? query : [query],
          certainty: opts?.certainty,
          distance: opts?.distance,
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearVector: <M extends PropertiesMetrics<T> | undefined = undefined>(
        vector: number[],
        opts: AggregateGroupByNearOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withNearVector({
          vector: vector,
          certainty: opts?.certainty,
          distance: opts?.distance,
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      overAll: <M extends PropertiesMetrics<T> | undefined = undefined>(
        opts: AggregateGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy);
        return this.doGroupBy(builder);
      },
    };
  }

  query() {
    return new Aggregator(this.connection);
  }

  base(
    metrics?: PropertiesMetrics<T>,
    filters?: FilterValue,
    groupBy?: (keyof T & string) | GroupByAggregate<T>
  ) {
    let fields = 'meta { count }';
    let builder = this.query().withClassName(this.name);
    if (metrics) {
      if (Array.isArray(metrics)) {
        fields += metrics.map((m) => this.metrics(m)).join(' ');
      } else {
        fields += this.metrics(metrics);
      }
    }
    if (groupBy) {
      builder = builder.withGroupBy(typeof groupBy === 'string' ? [groupBy] : [groupBy.property]);
      fields += 'groupedBy { path value }';
      if (typeof groupBy !== 'string' && groupBy?.limit) {
        builder = builder.withLimit(groupBy.limit);
      }
    }
    if (fields !== '') {
      builder = builder.withFields(fields);
    }
    if (filters) {
      builder = builder.withWhere(Serialize.filtersREST(filters));
    }
    if (this.tenant) {
      builder = builder.withTenant(this.tenant);
    }
    return builder;
  }

  metrics(metrics: MetricsInput<(keyof T & string) | string>) {
    let body = '';
    const { kind, propertyName, ...rest } = metrics;
    switch (kind) {
      case 'text': {
        const { minOccurrences, ...restText } = rest as MetricsText<string>;
        body = Object.entries(restText)
          .map(([key, value]) => {
            if (value) {
              return value instanceof Object
                ? `topOccurrences${minOccurrences ? `(limit: ${minOccurrences})` : ''} { ${
                    value.occurs ? 'occurs' : ''
                  } ${value.value ? 'value' : ''} }`
                : key;
            }
          })
          .join(' ');
        break;
      }
      default:
        body = Object.entries(rest)
          .map(([key, value]) => (value ? key : ''))
          .join(' ');
    }
    return `${propertyName} { ${body} }`;
  }

  static use<T>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): AggregateManager<T> {
    return new AggregateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  hybrid<M extends PropertiesMetrics<T>>(
    query: string,
    opts?: AggregateHybridOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    let builder = this.base(opts?.returnMetrics, opts?.filters).withHybrid({
      query: query,
      alpha: opts?.alpha,
      maxVectorDistance: opts?.maxVectorDistance,
      properties: opts?.queryProperties as string[],
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
      vector: opts?.vector,
    });
    if (opts?.objectLimit) {
      builder = builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  async nearImage<M extends PropertiesMetrics<T>>(
    image: string | Buffer,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters).withNearImage({
      image: await toBase64FromMedia(image),
      certainty: opts?.certainty,
      distance: opts?.distance,
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts?.objectLimit);
    }
    return this.do(builder);
  }

  nearObject<M extends PropertiesMetrics<T>>(
    id: string,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters).withNearObject({
      id: id,
      certainty: opts?.certainty,
      distance: opts?.distance,
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  nearText<M extends PropertiesMetrics<T>>(
    query: string | string[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters).withNearText({
      concepts: Array.isArray(query) ? query : [query],
      certainty: opts?.certainty,
      distance: opts?.distance,
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  nearVector<M extends PropertiesMetrics<T>>(
    vector: number[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters).withNearVector({
      vector: vector,
      certainty: opts?.certainty,
      distance: opts?.distance,
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  overAll<M extends PropertiesMetrics<T>>(opts?: AggregateOptions<T, M>): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters);
    return this.do(builder);
  }

  do = <M extends PropertiesMetrics<T> | undefined = undefined>(
    query: Aggregator
  ): Promise<AggregateResult<T, M>> => {
    return query
      .do()
      .then(({ data }: any) => {
        const { meta, ...rest } = data.Aggregate[this.name][0];
        return {
          properties: rest,
          totalCount: meta?.count,
        };
      })
      .catch((err: Error) => {
        throw new WeaviateQueryError(err.message, 'GraphQL');
      });
  };

  doGroupBy = <M extends PropertiesMetrics<T> | undefined = undefined>(
    query: Aggregator
  ): Promise<AggregateGroupByResult<T, M>[]> => {
    return query
      .do()
      .then(({ data }: any) =>
        data.Aggregate[this.name].map((item: any) => {
          const { groupedBy, meta, ...rest } = item;
          return {
            groupedBy: {
              prop: groupedBy.path[0],
              value: groupedBy.value,
            },
            properties: rest.length > 0 ? rest : undefined,
            totalCount: meta?.count,
          };
        })
      )
      .catch((err: Error) => {
        throw new WeaviateQueryError(err.message, 'GraphQL');
      });
  };
}

export interface Aggregate<T> {
  /** This namespace contains methods perform a group by search while aggregating metrics. */
  groupBy: AggregateGroupBy<T>;
  /**
   * Aggregate metrics over the objects returned by a hybrid search on this collection.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {string} query The text query to search for.
   * @param {AggregateHybridOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  hybrid<M extends PropertiesMetrics<T>>(
    query: string,
    opts?: AggregateHybridOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  /**
   * Aggregate metrics over the objects returned by a near image vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires a vectorizer capable of handling base64-encoded images, e.g. `img2vec-neural`, `multi2vec-clip`, and `multi2vec-bind`.
   *
   * @param {string | Buffer} image The image to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {AggregateNearOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearImage<M extends PropertiesMetrics<T>>(
    image: string | Buffer,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  /**
   * Aggregate metrics over the objects returned by a near object search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {string} id The ID of the object to search for.
   * @param {AggregateNearOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearObject<M extends PropertiesMetrics<T>>(
    id: string,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  /**
   * Aggregate metrics over the objects returned by a near vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {number[]} query The text query to search for.
   * @param {AggregateNearOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearText<M extends PropertiesMetrics<T>>(
    query: string | string[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  /**
   * Aggregate metrics over the objects returned by a near vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {number[]} vector The vector to search for.
   * @param {AggregateNearOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearVector<M extends PropertiesMetrics<T>>(
    vector: number[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  /**
   * Aggregate metrics over all the objects in this collection without any vector search.
   *
   * @param {AggregateOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateResult<T, M>[]>} The aggregated metrics for the objects in the collection.
   */
  overAll<M extends PropertiesMetrics<T>>(opts?: AggregateOptions<T, M>): Promise<AggregateResult<T, M>>;
}

export interface AggregateGroupBy<T> {
  /**
   * Aggregate metrics over the objects grouped by a specified property and returned by a hybrid search on this collection.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {string} query The text query to search for.
   * @param {AggregateGroupByHybridOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  hybrid<M extends PropertiesMetrics<T>>(
    query: string,
    opts: AggregateGroupByHybridOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  /**
   * Aggregate metrics over the objects grouped by a specified property and returned by a near image vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires a vectorizer capable of handling base64-encoded images, e.g. `img2vec-neural`, `multi2vec-clip`, and `multi2vec-bind`.
   *
   * @param {string | Buffer} image The image to search on. This can be a base64 string, a file path string, or a buffer.
   * @param {AggregateGroupByNearOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearImage<M extends PropertiesMetrics<T>>(
    image: string | Buffer,
    opts: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  /**
   * Aggregate metrics over the objects grouped by a specified property and returned by a near object search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {string} id The ID of the object to search for.
   * @param {AggregateGroupByNearOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearObject<M extends PropertiesMetrics<T>>(
    id: string,
    opts: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  /**
   * Aggregate metrics over the objects grouped by a specified property and returned by a near text vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires a vectorizer capable of handling text, e.g. `text2vec-contextionary`, `text2vec-openai`, etc.
   *
   * @param {string | string[]} query The text to search for.
   * @param {AggregateGroupByNearOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearText<M extends PropertiesMetrics<T>>(
    query: string | string[],
    opts: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  /**
   * Aggregate metrics over the objects grouped by a specified property and returned by a near vector search on this collection.
   *
   * At least one of `certainty`, `distance`, or `object_limit` must be specified here for the vector search.
   *
   * This method requires that the objects in the collection have associated vectors.
   *
   * @param {number[]} vector The vector to search for.
   * @param {AggregateGroupByNearOptions<T, M>} opts The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects returned by the vector search.
   */
  nearVector<M extends PropertiesMetrics<T>>(
    vector: number[],
    opts: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  /**
   * Aggregate metrics over all the objects in this collection grouped by a specified property without any vector search.
   *
   * @param {AggregateGroupByOptions<T, M>} [opts] The options for the request.
   * @returns {Promise<AggregateGroupByResult<T, M>[]>} The aggregated metrics for the objects in the collection.
   */
  overAll<M extends PropertiesMetrics<T>>(
    opts?: AggregateGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
}

export default AggregateManager.use;
