import Connection from '../../connection';

import { DbVersionSupport } from '../../utils/dbVersion';
import { ConsistencyLevel } from '../../data';

import { FilterValue } from '../filters';

import { Aggregator } from '../../graphql';
import { Vectors } from '../types';

type Properties = Record<string, any>;

interface AggregateBaseOptions<T, M> {
  filters?: FilterValue;
  returnMetrics?: M;
}

interface AggregateGroupByOptions<T, M> extends AggregateOptions<T, M> {
  groupBy: (keyof T & string) | GroupByAggregate<T>;
}

interface GroupByAggregate<T> {
  property: keyof T & string;
  limit?: number;
}

interface AggregateOptions<T, M> extends AggregateBaseOptions<T, M> {}

export interface AggregateBaseOverAllOptions<T, M> extends AggregateBaseOptions<T, M> {}

export interface AggregateNearOptions<T, M> extends AggregateBaseOptions<T, M> {
  certainty?: number;
  distance?: number;
  objectLimit?: number;
  targetVector?: string;
}

export interface AggregateGroupByNearOptions<T, M> extends AggregateNearOptions<T, M> {
  groupBy: (keyof T & string) | GroupByAggregate<T>;
}

type AggregateBoolean = {
  count?: number;
  percentageFalse?: number;
  percentageTrue?: number;
  totalFalse?: number;
  totalTrue?: number;
};

type AggregateDate = {
  count?: number;
  maximum?: number;
  median?: number;
  minimum?: number;
  mode?: number;
};

type AggregateNumber = {
  count?: number;
  maximum?: number;
  mean?: number;
  median?: number;
  minimum?: number;
  mode?: number;
  sum?: number;
};

type AggregateReference = {
  pointingTo?: string;
};

type AggregateText = {
  count?: number;
  topOccurrences?: {
    occurs?: number;
    value?: number;
  }[];
};

type MetricsInput<N extends string> =
  | MetricsBoolean<N>
  | MetricsInteger<N>
  | MetricsNumber<N>
  | MetricsText<N>
  | MetricsDate<N>;
// | MetricsReference<T>;

type PropertiesMetrics<N extends string> = MetricsInput<N> | MetricsInput<N>[];

type MetricsBase<N extends string, K extends 'boolean' | 'date' | 'integer' | 'number' | 'text'> = {
  kind: K;
  propertyName: N;
};

type Option<A> = { [key in keyof A]: boolean };

type BooleanKeys = 'count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue';
type DateKeys = 'count' | 'maximum' | 'median' | 'minimum' | 'mode';
type NumberKeys = 'count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum';

type MetricsBoolean<N extends string> = MetricsBase<N, 'boolean'> &
  Partial<{ [key in BooleanKeys]: boolean }>;
type MetricsDate<N extends string> = MetricsBase<N, 'date'> & Partial<{ [key in DateKeys]: boolean }>;
type MetricsInteger<N extends string> = MetricsBase<N, 'integer'> & Partial<{ [key in NumberKeys]: boolean }>;
type MetricsNumber<N extends string> = MetricsBase<N, 'number'> & Partial<{ [key in NumberKeys]: boolean }>;
// type MetricsReference<T> = {
//   kind: 'reference';
//   propertyName: RefKeys<T>;
//   pointingTo?: boolean;
//   type?: boolean;
// };
type MetricsText<N extends string> = MetricsBase<N, 'text'> & {
  count?: boolean;
  topOccurrences?: {
    occurs?: boolean;
    value?: boolean;
  };
};

export type AggregateMetrics<M> = {
  [K in keyof M]: M[K] extends true ? number : never;
};

export const metrics = <T>() => {
  return {
    aggregate: <P extends keyof T & string>(property: P) => new MetricsManager<T, P>(property),
  };
};

export interface Metrics<T> {
  aggregate: <P extends keyof T & string>(property: P) => MetricsManager<T, P>;
}

export class MetricsManager<T, P extends keyof T & string> {
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

  public boolean(
    metrics: ('count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue')[]
  ): MetricsBoolean<P> {
    return {
      ...this.map(metrics),
      kind: 'boolean',
      propertyName: this.propertyName,
    };
  }

  public date(metrics: ('count' | 'maximum' | 'median' | 'minimum' | 'mode')[]): MetricsDate<P> {
    return {
      ...this.map(metrics),
      kind: 'date',
      propertyName: this.propertyName,
    };
  }

  public integer(
    metrics: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsInteger<P> {
    return {
      ...this.map(metrics),
      kind: 'integer',
      propertyName: this.propertyName,
    };
  }

  public number(
    metrics: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsNumber<P> {
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

  public text(metrics: ('count' | 'topOccurrencesOccurs' | 'topOccurrencesValue')[]): MetricsText<P> {
    return {
      count: metrics.includes('count'),
      topOccurrences:
        metrics.includes('topOccurrencesOccurs') || metrics.includes('topOccurrencesValue')
          ? {
              occurs: metrics.includes('topOccurrencesOccurs'),
              value: metrics.includes('topOccurrencesValue'),
            }
          : undefined,
      kind: 'text',
      propertyName: this.propertyName,
    };
  }
}

// https://chat.openai.com/share/e12e2e07-d2e4-4ba1-9eee-ddf874e3915c
// copyright for this outrageously good code
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

type AggregateResult<T, M extends PropertiesMetrics<keyof T & string> | undefined = undefined> = {
  properties: M extends MetricsInput<keyof T & string>[]
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

// const s: AggregateResult<{text: string, int: number}, MetricsText<{text: string}>>

// s.properties

type AggregateGroupByResult<
  T,
  M extends PropertiesMetrics<keyof T & string> | undefined = undefined
> = AggregateResult<T, M> & {
  groupedBy: {
    prop: string;
    value: string;
  };
};

const isAggregateGroupBy = <T extends Properties, M extends PropertiesMetrics<keyof T & string>>(
  opts: any
): opts is AggregateGroupByOptions<T, M> => {
  return opts?.groupBy !== undefined;
};

export class AggregateManager<T> implements Aggregate<T> {
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
      nearImage: <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
        image: string,
        opts?: AggregateGroupByNearOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy).withNearImage({
          image: image,
          certainty: opts?.certainty,
          distance: opts?.distance,
          targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts?.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearObject: <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
        id: string,
        opts?: AggregateGroupByNearOptions<T, M>
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
      nearText: <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
        query: string | string[],
        opts?: AggregateGroupByNearOptions<T, M>
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
      nearVector: <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
        vector: number[],
        opts?: AggregateGroupByNearOptions<T, M>
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
      overAll: <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
        opts: AggregateGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.groupBy);
        return this.doGroupBy(builder);
      },
    };
  }

  private query() {
    return new Aggregator(this.connection);
  }

  private base(
    metrics?: PropertiesMetrics<keyof T & string>,
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
    // if (filters) {
    //   builder = builder.withWhere(Serialize.filtersREST(filters));
    // }
    return builder;
  }

  private metrics(metrics: MetricsInput<keyof T & string>) {
    let body = '';
    const { kind, propertyName, ...rest } = metrics;
    switch (kind) {
      case 'text':
        body = Object.entries(rest)
          .map(([key, value]) => {
            if (value) {
              return value instanceof Object
                ? `topOccurrences { ${value.occurs ? 'occurs' : ''} ${value.value ? 'value' : ''} }`
                : key;
            }
          })
          .join(' ');
        break;
      default:
        body = Object.entries(rest)
          .map(([key, value]) => (value ? key : ''))
          .join(' ');
    }
    return `${propertyName} { ${body} }`;
  }

  public static use<T>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): AggregateManager<T> {
    return new AggregateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public nearImage<M extends PropertiesMetrics<keyof T & string>>(
    image: string,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters).withNearImage({
      image: image,
      certainty: opts?.certainty,
      distance: opts?.distance,
      targetVectors: opts?.targetVector ? [opts.targetVector] : undefined,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts?.objectLimit);
    }
    return this.do(builder);
  }

  public nearObject<M extends PropertiesMetrics<keyof T & string>>(
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

  public nearText<M extends PropertiesMetrics<keyof T & string>>(
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

  public nearVector<M extends PropertiesMetrics<keyof T & string>>(
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

  public overAll<M extends PropertiesMetrics<keyof T & string>>(
    opts?: AggregateOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters);
    return this.do(builder);
  }

  private do = <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    query: Aggregator
  ): Promise<AggregateResult<T, M>> => {
    return query.do().then(({ data }: any) => {
      const { meta, ...rest } = data.Aggregate[this.name][0];
      return {
        properties: rest,
        totalCount: meta?.count,
      };
    });
  };

  private doGroupBy = <M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    query: Aggregator
  ): Promise<AggregateGroupByResult<T, M>[]> => {
    return query.do().then(({ data }: any) =>
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
    );
  };
}

export interface Aggregate<T> {
  groupBy: AggregateGroupBy<T>;
  nearImage<M extends PropertiesMetrics<keyof T & string>>(
    image: string,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearObject<M extends PropertiesMetrics<keyof T & string>>(
    id: string,
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearText<M extends PropertiesMetrics<keyof T & string>>(
    query: string | string[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearVector<M extends PropertiesMetrics<keyof T & string>>(
    vector: number[],
    opts?: AggregateNearOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  overAll<M extends PropertiesMetrics<keyof T & string>>(
    opts?: AggregateOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
}

export interface AggregateGroupBy<T> {
  nearImage<M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    image: string,
    opts?: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearObject<M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    id: string,
    opts?: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearText<M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    query: string | string[],
    opts: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearVector<M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    vector: number[],
    opts?: AggregateGroupByNearOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  overAll<M extends PropertiesMetrics<keyof T & string> | undefined = undefined>(
    opts?: AggregateGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
}

export default AggregateManager.use;
