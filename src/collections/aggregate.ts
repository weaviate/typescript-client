import Connection from '../connection';

import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { FilterValue } from './filters';

import { Aggregator } from '../graphql';

type Properties = Record<string, any>;

interface AggregateBaseOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined> {
  filters?: FilterValue;
  limit?: number;
  returnMetrics?: M;
}

interface AggregateGroupByOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateBaseOptions<T, M> {
  groupBy: (keyof T & string) | (keyof T & string)[];
}

interface AggregateOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateBaseOptions<T, M> {}

export interface NearOptions {
  certainty?: number;
  distance?: number;
  objectLimit?: number;
}

export interface AggregateNearImageOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateOptions<T, M>,
    NearOptions {}
export interface AggregateNearImageGroupByOptions<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> extends AggregateGroupByOptions<T, M>,
    NearOptions {}

export interface NearObjectOptions extends NearOptions {}
export interface AggregateNearObjectOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateOptions<T, M>,
    NearObjectOptions {}
export interface AggregateNearObjectGroupByOptions<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> extends AggregateGroupByOptions<T, M>,
    NearObjectOptions {}

export interface NearTextOptions extends NearOptions {}
export interface AggregateNearTextOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateOptions<T, M>,
    NearTextOptions {}
export interface AggregateNearTextGroupByOptions<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> extends AggregateGroupByOptions<T, M>,
    NearTextOptions {}

export interface NearVectorOptions extends NearOptions {}
export interface AggregateNearVectorOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateOptions<T, M>,
    NearVectorOptions {}
export interface AggregateNearVectorGroupByOptions<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> extends AggregateGroupByOptions<T, M>,
    NearVectorOptions {}

export interface AggregateOverAllOptions<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateOptions<T, M> {}
export interface AggregateOverAllGroupByOptions<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> extends AggregateGroupByOptions<T, M> {}

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

type MetricsInput<T extends Properties> =
  | MetricsBoolean<T>
  | MetricsInteger<T>
  | MetricsNumber<T>
  | MetricsText<T>
  | MetricsDate<T>;
// | MetricsReference<T>;

type PropertiesMetrics<T extends Properties> = MetricsInput<T> | MetricsInput<T>[];

type MetricsBase<T extends Properties, K extends 'boolean' | 'date' | 'integer' | 'number' | 'text'> = {
  kind: K;
  propertyName: keyof T & string;
};

type Option<A> = { [key in keyof A]: boolean };

type MetricsBoolean<T extends Properties> = MetricsBase<T, 'boolean'> & Partial<Option<AggregateBoolean>>;
type MetricsDate<T extends Properties> = MetricsBase<T, 'date'> & Partial<Option<AggregateDate>>;
type MetricsInteger<T extends Properties> = MetricsBase<T, 'integer'> & Partial<Option<AggregateNumber>>;
type MetricsNumber<T extends Properties> = MetricsBase<T, 'number'> & Partial<Option<AggregateNumber>>;
// type MetricsReference<T> = {
//   kind: 'reference';
//   propertyName: RefKeys<T>;
//   pointingTo?: boolean;
//   type?: boolean;
// };
type MetricsText<T extends Properties> = MetricsBase<T, 'text'> & {
  count?: boolean;
  topOccurrences?: {
    occurs?: boolean;
    value?: boolean;
  };
};

export class Metrics<T extends Properties> {
  private propertyName: keyof T & string;

  private constructor(property: keyof T & string) {
    this.propertyName = property;
  }

  static aggregate<T extends Properties>(property: keyof T & string): Metrics<T> {
    return new Metrics<T>(property);
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
  ): MetricsBoolean<T> {
    return {
      ...this.map(metrics),
      kind: 'boolean',
      propertyName: this.propertyName,
    };
  }

  public date(metrics: ('count' | 'maximum' | 'median' | 'minimum' | 'mode')[]): MetricsDate<T> {
    return {
      ...this.map(metrics),
      kind: 'date',
      propertyName: this.propertyName,
    };
  }

  public integer(
    metrics: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsInteger<T> {
    return {
      ...this.map(metrics),
      kind: 'integer',
      propertyName: this.propertyName,
    };
  }

  public number(
    metrics: ('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]
  ): MetricsNumber<T> {
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

  public text(metrics: ('count' | 'topOccurrencesOccurs' | 'topOccurrencesValue')[]): MetricsText<T> {
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
  : AggregateReference;

type AggregateResult<T extends Properties, M extends PropertiesMetrics<T> | undefined> = {
  properties?: M extends MetricsInput<T>[]
    ? {
        [K in M[number] as K['propertyName']]: KindToAggregateType<K['kind']>;
      }
    : M extends MetricsInput<T>
    ? {
        [K in M as K['propertyName']]: KindToAggregateType<K['kind']>;
      }
    : undefined;
  totalCount: number;
};

type AggregateGroupByResult<
  T extends Properties,
  M extends PropertiesMetrics<T> | undefined
> = AggregateResult<T, M> & {
  groupedBy: {
    prop: string;
    value: string;
  };
};

const isAggregateGroupBy = <T extends Properties, M extends PropertiesMetrics<T> | undefined>(
  opts: any
): opts is AggregateGroupByOptions<T, M> => {
  return opts?.groupBy !== undefined;
};

export class AggregateManager<T extends Properties> implements Aggregate<T> {
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
      nearImage: <M extends PropertiesMetrics<T> | undefined>(
        image: string,
        opts?: AggregateNearImageGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(
          opts?.returnMetrics,
          opts?.filters,
          opts?.limit,
          opts ? (Array.isArray(opts.groupBy) ? opts.groupBy : [opts.groupBy]) : undefined
        ).withNearImage({
          image: image,
          certainty: opts?.certainty,
          distance: opts?.distance,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts?.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearObject: <M extends PropertiesMetrics<T> | undefined>(
        id: string,
        opts?: AggregateNearObjectGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(
          opts?.returnMetrics,
          opts?.filters,
          opts?.limit,
          opts ? (Array.isArray(opts.groupBy) ? opts.groupBy : [opts.groupBy]) : undefined
        ).withNearObject({
          id: id,
          certainty: opts?.certainty,
          distance: opts?.distance,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearText: <M extends PropertiesMetrics<T> | undefined>(
        query: string | string[],
        opts?: AggregateNearTextGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(
          opts?.returnMetrics,
          opts?.filters,
          opts?.limit,
          opts ? (Array.isArray(opts.groupBy) ? opts.groupBy : [opts.groupBy]) : undefined
        ).withNearText({
          concepts: Array.isArray(query) ? query : [query],
          certainty: opts?.certainty,
          distance: opts?.distance,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearVector: <M extends PropertiesMetrics<T> | undefined>(
        vector: number[],
        opts?: AggregateNearVectorGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(
          opts?.returnMetrics,
          opts?.filters,
          opts?.limit,
          opts ? (Array.isArray(opts.groupBy) ? opts.groupBy : [opts.groupBy]) : undefined
        ).withNearVector({
          vector: vector,
          certainty: opts?.certainty,
          distance: opts?.distance,
        });
        if (opts?.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      overAll: <M extends PropertiesMetrics<T> | undefined = undefined>(
        opts: AggregateOverAllGroupByOptions<T, M>
      ): Promise<AggregateGroupByResult<T, M>[]> => {
        const builder = this.base(
          opts?.returnMetrics,
          opts?.filters,
          opts?.limit,
          Array.isArray(opts.groupBy) ? opts.groupBy : [opts.groupBy]
        );
        return this.doGroupBy(builder);
      },
    };
  }

  private query() {
    return new Aggregator(this.connection);
  }

  private base(
    metrics?: PropertiesMetrics<T>,
    filters?: FilterValue,
    limit?: number,
    groupBy?: (keyof T & string)[]
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
      builder = builder.withGroupBy(groupBy);
      fields += 'groupedBy { path value }';
    }
    if (fields !== '') {
      builder = builder.withFields(fields);
    }
    // if (filters) {
    //   builder = builder.withWhere(Serialize.filtersREST(filters));
    // }
    if (limit) {
      builder = builder.withLimit(limit);
    }
    return builder;
  }

  private metrics(metrics: MetricsInput<T>) {
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

  public static use<T extends Properties>(
    connection: Connection,
    name: string,
    dbVersionSupport: DbVersionSupport,
    consistencyLevel?: ConsistencyLevel,
    tenant?: string
  ): AggregateManager<T> {
    return new AggregateManager<T>(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }

  public nearImage<M extends PropertiesMetrics<T> | undefined>(
    image: string,
    opts?: AggregateNearImageOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.limit).withNearImage({
      image: image,
      certainty: opts?.certainty,
      distance: opts?.distance,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts?.objectLimit);
    }
    return this.do(builder);
  }

  public nearObject<M extends PropertiesMetrics<T> | undefined>(
    id: string,
    opts?: AggregateNearObjectOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.limit).withNearObject({
      id: id,
      certainty: opts?.certainty,
      distance: opts?.distance,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  public nearText<M extends PropertiesMetrics<T> | undefined>(
    query: string | string[],
    opts?: AggregateNearTextOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.limit).withNearText({
      concepts: Array.isArray(query) ? query : [query],
      certainty: opts?.certainty,
      distance: opts?.distance,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  public nearVector<M extends PropertiesMetrics<T> | undefined>(
    vector: number[],
    opts?: AggregateNearVectorOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.limit).withNearVector({
      vector: vector,
      certainty: opts?.certainty,
      distance: opts?.distance,
    });
    if (opts?.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }

  public overAll<M extends PropertiesMetrics<T> | undefined = undefined>(
    opts?: AggregateOverAllOptions<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(opts?.returnMetrics, opts?.filters, opts?.limit);
    return this.do(builder);
  }

  private do = <M extends PropertiesMetrics<T> | undefined>(
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

  private doGroupBy = <M extends PropertiesMetrics<T> | undefined>(
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
          properties: rest,
          totalCount: meta?.count,
        };
      })
    );
  };
}

export interface Aggregate<T extends Properties> {
  groupBy: AggregateGroupBy<T>;
  nearImage<M extends PropertiesMetrics<T> | undefined = undefined>(
    image: string,
    opts?: AggregateNearImageOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearObject<M extends PropertiesMetrics<T> | undefined = undefined>(
    id: string,
    opts?: AggregateNearObjectOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearText<M extends PropertiesMetrics<T> | undefined = undefined>(
    query: string | string[],
    opts?: AggregateNearTextOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  nearVector<M extends PropertiesMetrics<T> | undefined = undefined>(
    vector: number[],
    opts?: AggregateNearVectorOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
  overAll<M extends PropertiesMetrics<T> | undefined = undefined>(
    opts?: AggregateOverAllOptions<T, M>
  ): Promise<AggregateResult<T, M>>;
}

export interface AggregateGroupBy<T extends Properties> {
  nearImage<M extends PropertiesMetrics<T> | undefined = undefined>(
    image: string,
    opts?: AggregateNearImageGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearObject<M extends PropertiesMetrics<T> | undefined = undefined>(
    id: string,
    opts?: AggregateNearObjectGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearText<M extends PropertiesMetrics<T> | undefined = undefined>(
    query: string | string[],
    opts: AggregateNearTextGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  nearVector<M extends PropertiesMetrics<T> | undefined = undefined>(
    vector: number[],
    opts?: AggregateNearVectorGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
  overAll<M extends PropertiesMetrics<T> | undefined = undefined>(
    opts?: AggregateOverAllGroupByOptions<T, M>
  ): Promise<AggregateGroupByResult<T, M>[]>;
}

export default AggregateManager.use;
