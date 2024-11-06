'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __rest =
  (this && this.__rest) ||
  function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === 'function')
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.MetricsManager = exports.metrics = void 0;
const errors_js_1 = require('../../errors.js');
const index_js_1 = require('../../graphql/index.js');
const index_js_2 = require('../../index.js');
const index_js_3 = require('../serialize/index.js');
const metrics = () => {
  return {
    aggregate: (property) => new MetricsManager(property),
  };
};
exports.metrics = metrics;
class MetricsManager {
  constructor(property) {
    this.propertyName = property;
  }
  map(metrics) {
    const out = {};
    metrics.forEach((metric) => {
      out[metric] = true;
    });
    return out;
  }
  /**
   * Define the metrics to be returned for a BOOL or BOOL_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'percentageFalse' | 'percentageTrue' | 'totalFalse' | 'totalTrue')[]} metrics The metrics to return.
   * @returns {MetricsBoolean<P>} The metrics for the property.
   */
  boolean(metrics) {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'percentageFalse', 'percentageTrue', 'totalFalse', 'totalTrue'];
    }
    return Object.assign(Object.assign({}, this.map(metrics)), {
      kind: 'boolean',
      propertyName: this.propertyName,
    });
  }
  /**
   * Define the metrics to be returned for a DATE or DATE_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'median' | 'minimum' | 'mode')[]} metrics The metrics to return.
   * @returns {MetricsDate<P>} The metrics for the property.
   */
  date(metrics) {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'median', 'minimum', 'mode'];
    }
    return Object.assign(Object.assign({}, this.map(metrics)), {
      kind: 'date',
      propertyName: this.propertyName,
    });
  }
  /**
   * Define the metrics to be returned for an INT or INT_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]} metrics The metrics to return.
   * @returns {MetricsInteger<P>} The metrics for the property.
   */
  integer(metrics) {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum'];
    }
    return Object.assign(Object.assign({}, this.map(metrics)), {
      kind: 'integer',
      propertyName: this.propertyName,
    });
  }
  /**
   * Define the metrics to be returned for a NUMBER or NUMBER_ARRAY property when aggregating over a collection.
   *
   * If none of the arguments are provided then all metrics will be returned.
   *
   * @param {('count' | 'maximum' | 'mean' | 'median' | 'minimum' | 'mode' | 'sum')[]} metrics The metrics to return.
   * @returns {MetricsNumber<P>} The metrics for the property.
   */
  number(metrics) {
    if (metrics === undefined || metrics.length === 0) {
      metrics = ['count', 'maximum', 'mean', 'median', 'minimum', 'mode', 'sum'];
    }
    return Object.assign(Object.assign({}, this.map(metrics)), {
      kind: 'number',
      propertyName: this.propertyName,
    });
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
  text(metrics, minOccurrences) {
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
exports.MetricsManager = MetricsManager;
class AggregateManager {
  constructor(connection, name, dbVersionSupport, consistencyLevel, tenant) {
    this.do = (query) => {
      return query
        .do()
        .then(({ data }) => {
          const _a = data.Aggregate[this.name][0],
            { meta } = _a,
            rest = __rest(_a, ['meta']);
          return {
            properties: rest,
            totalCount: meta === null || meta === void 0 ? void 0 : meta.count,
          };
        })
        .catch((err) => {
          throw new errors_js_1.WeaviateQueryError(err.message, 'GraphQL');
        });
    };
    this.doGroupBy = (query) => {
      return query
        .do()
        .then(({ data }) =>
          data.Aggregate[this.name].map((item) => {
            const { groupedBy, meta } = item,
              rest = __rest(item, ['groupedBy', 'meta']);
            return {
              groupedBy: {
                prop: groupedBy.path[0],
                value: groupedBy.value,
              },
              properties: rest.length > 0 ? rest : undefined,
              totalCount: meta === null || meta === void 0 ? void 0 : meta.count,
            };
          })
        )
        .catch((err) => {
          throw new errors_js_1.WeaviateQueryError(err.message, 'GraphQL');
        });
    };
    this.connection = connection;
    this.name = name;
    this.dbVersionSupport = dbVersionSupport;
    this.consistencyLevel = consistencyLevel;
    this.tenant = tenant;
    this.groupBy = {
      nearImage: (image, opts) =>
        __awaiter(this, void 0, void 0, function* () {
          const builder = this.base(
            opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
            opts === null || opts === void 0 ? void 0 : opts.filters,
            opts === null || opts === void 0 ? void 0 : opts.groupBy
          ).withNearImage({
            image: yield (0, index_js_2.toBase64FromMedia)(image),
            certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
            distance: opts === null || opts === void 0 ? void 0 : opts.distance,
            targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
              ? [opts.targetVector]
              : undefined,
          });
          if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
            builder.withObjectLimit(opts === null || opts === void 0 ? void 0 : opts.objectLimit);
          }
          return this.doGroupBy(builder);
        }),
      nearObject: (id, opts) => {
        const builder = this.base(
          opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
          opts === null || opts === void 0 ? void 0 : opts.filters,
          opts === null || opts === void 0 ? void 0 : opts.groupBy
        ).withNearObject({
          id: id,
          certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
          distance: opts === null || opts === void 0 ? void 0 : opts.distance,
          targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
            ? [opts.targetVector]
            : undefined,
        });
        if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearText: (query, opts) => {
        const builder = this.base(
          opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
          opts === null || opts === void 0 ? void 0 : opts.filters,
          opts === null || opts === void 0 ? void 0 : opts.groupBy
        ).withNearText({
          concepts: Array.isArray(query) ? query : [query],
          certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
          distance: opts === null || opts === void 0 ? void 0 : opts.distance,
          targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
            ? [opts.targetVector]
            : undefined,
        });
        if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      nearVector: (vector, opts) => {
        const builder = this.base(
          opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
          opts === null || opts === void 0 ? void 0 : opts.filters,
          opts === null || opts === void 0 ? void 0 : opts.groupBy
        ).withNearVector({
          vector: vector,
          certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
          distance: opts === null || opts === void 0 ? void 0 : opts.distance,
          targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
            ? [opts.targetVector]
            : undefined,
        });
        if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
          builder.withObjectLimit(opts.objectLimit);
        }
        return this.doGroupBy(builder);
      },
      overAll: (opts) => {
        const builder = this.base(
          opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
          opts === null || opts === void 0 ? void 0 : opts.filters,
          opts === null || opts === void 0 ? void 0 : opts.groupBy
        );
        return this.doGroupBy(builder);
      },
    };
  }
  query() {
    return new index_js_1.Aggregator(this.connection);
  }
  base(metrics, filters, groupBy) {
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
      if (typeof groupBy !== 'string' && (groupBy === null || groupBy === void 0 ? void 0 : groupBy.limit)) {
        builder = builder.withLimit(groupBy.limit);
      }
    }
    if (fields !== '') {
      builder = builder.withFields(fields);
    }
    if (filters) {
      builder = builder.withWhere(index_js_3.Serialize.filtersREST(filters));
    }
    if (this.tenant) {
      builder = builder.withTenant(this.tenant);
    }
    return builder;
  }
  metrics(metrics) {
    let body = '';
    const { kind, propertyName } = metrics,
      rest = __rest(metrics, ['kind', 'propertyName']);
    switch (kind) {
      case 'text': {
        const _a = rest,
          { minOccurrences } = _a,
          restText = __rest(_a, ['minOccurrences']);
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
  static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
    return new AggregateManager(connection, name, dbVersionSupport, consistencyLevel, tenant);
  }
  nearImage(image, opts) {
    return __awaiter(this, void 0, void 0, function* () {
      const builder = this.base(
        opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
        opts === null || opts === void 0 ? void 0 : opts.filters
      ).withNearImage({
        image: yield (0, index_js_2.toBase64FromMedia)(image),
        certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
        distance: opts === null || opts === void 0 ? void 0 : opts.distance,
        targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
          ? [opts.targetVector]
          : undefined,
      });
      if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
        builder.withObjectLimit(opts === null || opts === void 0 ? void 0 : opts.objectLimit);
      }
      return this.do(builder);
    });
  }
  nearObject(id, opts) {
    const builder = this.base(
      opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
      opts === null || opts === void 0 ? void 0 : opts.filters
    ).withNearObject({
      id: id,
      certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
      distance: opts === null || opts === void 0 ? void 0 : opts.distance,
      targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
        ? [opts.targetVector]
        : undefined,
    });
    if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }
  nearText(query, opts) {
    const builder = this.base(
      opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
      opts === null || opts === void 0 ? void 0 : opts.filters
    ).withNearText({
      concepts: Array.isArray(query) ? query : [query],
      certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
      distance: opts === null || opts === void 0 ? void 0 : opts.distance,
      targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
        ? [opts.targetVector]
        : undefined,
    });
    if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }
  nearVector(vector, opts) {
    const builder = this.base(
      opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
      opts === null || opts === void 0 ? void 0 : opts.filters
    ).withNearVector({
      vector: vector,
      certainty: opts === null || opts === void 0 ? void 0 : opts.certainty,
      distance: opts === null || opts === void 0 ? void 0 : opts.distance,
      targetVectors: (opts === null || opts === void 0 ? void 0 : opts.targetVector)
        ? [opts.targetVector]
        : undefined,
    });
    if (opts === null || opts === void 0 ? void 0 : opts.objectLimit) {
      builder.withObjectLimit(opts.objectLimit);
    }
    return this.do(builder);
  }
  overAll(opts) {
    const builder = this.base(
      opts === null || opts === void 0 ? void 0 : opts.returnMetrics,
      opts === null || opts === void 0 ? void 0 : opts.filters
    );
    return this.do(builder);
  }
}
exports.default = AggregateManager.use;
