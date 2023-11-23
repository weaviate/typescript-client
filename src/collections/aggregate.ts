import Connection from '../connection';

import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { FilterValueType, Filters } from './filters';
import { Properties } from './types';

import { Aggregator } from '../graphql';
import Serialize from './serialize';

interface AggregateArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined> {
  filters?: Filters<FilterValueType>;
  limit?: number;
  returnMetrics?: M;
}

interface NearArgs {
  certainty?: number;
  distance?: number;
  objectLimit?: number;
}

export interface AggregateNearImageArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateArgs<T, M>,
    NearArgs {
  nearImage: string;
}
export interface AggregateNearObjectArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateArgs<T, M>,
    NearArgs {
  nearObject: string;
}
export interface AggregateNearTextArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateArgs<T, M>,
    NearArgs {
  query: string | string[];
}
export interface AggregateNearVectorArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateArgs<T, M>,
    NearArgs {
  vector: number[];
}
export interface AggregateOverAllArgs<T extends Properties, M extends PropertiesMetrics<T> | undefined>
  extends AggregateArgs<T, M> {}

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
  | MetricsDate<T>
  | MetricsReference<T>;

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
type MetricsReference<T> = {
  kind: 'reference';
  propertyName: keyof T & string;
  pointingTo?: boolean;
  type?: boolean;
};
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

  public reference(metrics: 'pointingTo'[]): MetricsReference<T> {
    return {
      ...this.map(metrics),
      kind: 'reference',
      propertyName: this.propertyName,
    };
  }

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

export class AggregateManager<T extends Properties> implements Aggregate<T> {
  connection: Connection;
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
  }

  private query() {
    return new Aggregator(this.connection);
  }

  private base(
    totalCount: boolean,
    metrics?: PropertiesMetrics<T>,
    filters?: Filters<FilterValueType>,
    limit?: number
  ) {
    let fields = '';
    let builder = this.query().withClassName(this.name);
    if (totalCount) {
      fields += 'meta { count }';
    }
    if (metrics) {
      if (Array.isArray(metrics)) {
        fields += metrics.map((m) => this.metrics(m)).join(' ');
      } else {
        fields += this.metrics(metrics);
      }
    }
    if (fields !== '') {
      builder = builder.withFields(fields);
    }
    if (filters) {
      builder = builder.withWhere(Serialize.filtersREST(filters));
    }
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
    args: AggregateNearImageArgs<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(true, args.returnMetrics, args.filters, args.limit).withNearImage({
      image: args.nearImage,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args?.objectLimit) {
      builder.withObjectLimit(args?.objectLimit);
    }
    return this.do(builder);
  }

  public nearObject<M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearObjectArgs<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(true, args.returnMetrics, args.filters, args.limit).withNearObject({
      id: args.nearObject,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public nearText<M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearTextArgs<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(true, args.returnMetrics, args.filters, args.limit).withNearText({
      concepts: Array.isArray(args.query) ? args.query : [args.query],
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public nearVector<M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearVectorArgs<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(true, args.returnMetrics, args.filters, args.limit).withNearVector({
      vector: args.vector,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public overAll<M extends PropertiesMetrics<T> | undefined>(
    args?: AggregateOverAllArgs<T, M>
  ): Promise<AggregateResult<T, M>> {
    const builder = this.base(true, args?.returnMetrics, args?.filters, args?.limit);
    return this.do(builder);
  }

  private do = (query: Aggregator) => {
    return query.do().then(({ data }: any) => {
      const { meta, ...rest } = data.Aggregate[this.name][0];
      return {
        properties: rest,
        totalCount: meta?.count,
      };
    });
  };
}

export interface Aggregate<T extends Properties> {
  nearImage: <M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearImageArgs<T, M>
  ) => Promise<AggregateResult<T, M>>;
  nearObject: <M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearObjectArgs<T, M>
  ) => Promise<AggregateResult<T, M>>;
  nearText: <M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearTextArgs<T, M>
  ) => Promise<AggregateResult<T, M>>;
  nearVector: <M extends PropertiesMetrics<T> | undefined>(
    args: AggregateNearVectorArgs<T, M>
  ) => Promise<AggregateResult<T, M>>;
  overAll: <M extends PropertiesMetrics<T> | undefined>(
    args?: AggregateOverAllArgs<T, M>
  ) => Promise<AggregateResult<T, M>>;
}

export default AggregateManager.use;
