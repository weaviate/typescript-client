import Connection from '../connection';

import { DbVersionSupport } from '../utils/dbVersion';
import { ConsistencyLevel } from '../data';

import { FilterValueType, Filters } from './filters';
import { Properties } from './types';

import { Aggregator } from '../graphql';
import Serialize from './serialize';

interface AggregateArgs<T extends Properties> {
  filters?: Filters<FilterValueType>;
  limit?: number;
  totalCount?: boolean;
  returnMetrics?: PropertiesMetrics<T>;
}

interface NearArgs {
  certainty?: number;
  distance?: number;
  objectLimit?: number;
}

interface AggregateNearImageArgs<T extends Properties> extends AggregateArgs<T>, NearArgs {
  nearImage: string;
}
interface AggregateNearObjectArgs<T extends Properties> extends AggregateArgs<T>, NearArgs {
  nearObject: string;
}
interface AggregateNearTextArgs<T extends Properties> extends AggregateArgs<T>, NearArgs {
  query: string | string[];
}
interface AggregateNearVectorArgs<T extends Properties> extends AggregateArgs<T>, NearArgs {
  vector: number[];
}
interface AggregateOverAllArgs<T extends Properties> extends AggregateArgs<T> {}

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
    count?: number;
    value?: number;
  }[];
};

type Metrics<T extends Properties> =
  | MetricsBoolean<T>
  | MetricsInteger<T>
  | MetricsNumber<T>
  | MetricsText<T>
  | MetricsDate<T>
  | MetricsReference<T>;

type PropertiesMetrics<T extends Properties> = Metrics<T> | Metrics<T>[];

type MetricsBase<T extends Properties, K extends 'boolean' | 'date' | 'integer' | 'number' | 'text'> = {
  _kind: K;
  propertyName: keyof T & string;
};

type MetricsBoolean<T extends Properties> = MetricsBase<T, 'boolean'> & Partial<AggregateBoolean>;
type MetricsDate<T extends Properties> = MetricsBase<T, 'date'> & Partial<AggregateDate>;
type MetricsInteger<T extends Properties> = MetricsBase<T, 'integer'> & Partial<AggregateNumber>;
type MetricsNumber<T extends Properties> = MetricsBase<T, 'number'> & Partial<AggregateNumber>;
type MetricsReference<T> = {
  _kind: 'reference';
  propertyName: keyof T & string;
  pointingTo?: boolean;
  type?: boolean;
};
type MetricsText<T extends Properties> = MetricsBase<T, 'text'> & {
  count?: boolean;
  topOccurrences?: {
    count?: boolean;
    value?: boolean;
  };
};

type AggregateResult<T extends Properties> = {
  properties?: Record<
    keyof T,
    AggregateBoolean | AggregateDate | AggregateNumber | AggregateReference | AggregateText
  >;
  totalCount?: number;
};

class AggregateManager<T extends Properties> implements Aggregate<T> {
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
    let builder = this.query();
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

  private metrics(metrics: Metrics<T>) {
    let body = '';
    switch (metrics._kind) {
      case 'text':
        body = Object.entries(metrics)
          .map(([key, value]) => {
            if (value) {
              return value instanceof Object
                ? `topOccurrences { ${value.count ? value.count : ''} ${value.value ? value.value : ''} }`
                : key;
            }
          })
          .join(' ');
        break;
      default:
        body = Object.entries(metrics)
          .map(([key, value]) => (value ? key : ''))
          .join(' ');
    }
    return `${metrics.propertyName} { ${body} }`;
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

  public nearImage(args: AggregateNearImageArgs<T>): Promise<AggregateResult<T>> {
    const builder = this.base(
      args.totalCount === true,
      args.returnMetrics,
      args.filters,
      args.limit
    ).withNearImage({
      image: args.nearImage,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public nearObject(args: AggregateNearObjectArgs<T>): Promise<AggregateResult<T>> {
    const builder = this.base(
      args.totalCount === true,
      args.returnMetrics,
      args.filters,
      args.limit
    ).withNearObject({
      id: args.nearObject,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public nearText(args: AggregateNearTextArgs<T>): Promise<AggregateResult<T>> {
    const builder = this.base(
      args.totalCount === true,
      args.returnMetrics,
      args.filters,
      args.limit
    ).withNearText({
      concepts: Array.isArray(args.query) ? args.query : [args.query],
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public nearVector(args: AggregateNearVectorArgs<T>): Promise<AggregateResult<T>> {
    const builder = this.base(
      args.totalCount === true,
      args.returnMetrics,
      args.filters,
      args.limit
    ).withNearVector({
      vector: args.vector,
      certainty: args.certainty,
      distance: args.distance,
    });
    if (args.objectLimit) {
      builder.withObjectLimit(args.objectLimit);
    }
    return this.do(builder);
  }

  public overAll(args: AggregateOverAllArgs<T>): Promise<AggregateResult<T>> {
    const builder = this.base(args.totalCount === true, args.returnMetrics, args.filters, args.limit);
    return this.do(builder);
  }

  private do = (query: Aggregator) => {
    return query.do().then((data: any) => {
      const res = data.Aggregate[this.name][0];
      const meta: { count: number } | undefined = res.pop('meta', undefined);
      return {
        properties: res,
        totalCount: meta?.count,
      };
    });
  };
}

export interface Aggregate<T extends Properties> {
  nearImage: (args: AggregateNearImageArgs<T>) => Promise<AggregateResult<T>>;
  nearObject: (args: AggregateNearObjectArgs<T>) => Promise<AggregateResult<T>>;
  nearText: (args: AggregateNearTextArgs<T>) => Promise<AggregateResult<T>>;
  nearVector: (args: AggregateNearVectorArgs<T>) => Promise<AggregateResult<T>>;
  overAll: (args: AggregateOverAllArgs<T>) => Promise<AggregateResult<T>>;
}

export default AggregateManager.use;
