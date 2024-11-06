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
Object.defineProperty(exports, '__esModule', { value: true });
exports.Deserialize = void 0;
const errors_js_1 = require('../../errors.js');
const tenants_js_1 = require('../../proto/v1/tenants.js');
const utils_js_1 = require('../references/utils.js');
class Deserialize {
  constructor(supports125ListValue) {
    this.supports125ListValue = supports125ListValue;
  }
  static use(support) {
    return __awaiter(this, void 0, void 0, function* () {
      const supports125ListValue = yield support.supports125ListValue().then((res) => res.supports);
      return new Deserialize(supports125ListValue);
    });
  }
  query(reply) {
    return {
      objects: reply.results.map((result) => {
        return {
          metadata: Deserialize.metadata(result.metadata),
          properties: this.properties(result.properties),
          references: this.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        };
      }),
    };
  }
  generate(reply) {
    return {
      objects: reply.results.map((result) => {
        var _a, _b;
        return {
          generated: ((_a = result.metadata) === null || _a === void 0 ? void 0 : _a.generativePresent)
            ? (_b = result.metadata) === null || _b === void 0
              ? void 0
              : _b.generative
            : undefined,
          metadata: Deserialize.metadata(result.metadata),
          properties: this.properties(result.properties),
          references: this.references(result.properties),
          uuid: Deserialize.uuid(result.metadata),
          vectors: Deserialize.vectors(result.metadata),
        };
      }),
      generated: reply.generativeGroupedResult,
    };
  }
  groupBy(reply) {
    const objects = [];
    const groups = {};
    reply.groupByResults.forEach((result) => {
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: this.properties(object.properties),
          references: this.references(object.properties),
          uuid: Deserialize.uuid(object.metadata),
          vectors: Deserialize.vectors(object.metadata),
        };
      });
      groups[result.name] = {
        maxDistance: result.maxDistance,
        minDistance: result.minDistance,
        name: result.name,
        numberOfObjects: result.numberOfObjects,
        objects: objs,
      };
      objects.push(...objs);
    });
    return {
      objects: objects,
      groups: groups,
    };
  }
  generateGroupBy(reply) {
    const objects = [];
    const groups = {};
    reply.groupByResults.forEach((result) => {
      var _a;
      const objs = result.objects.map((object) => {
        return {
          belongsToGroup: result.name,
          metadata: Deserialize.metadata(object.metadata),
          properties: this.properties(object.properties),
          references: this.references(object.properties),
          uuid: Deserialize.uuid(object.metadata),
          vectors: Deserialize.vectors(object.metadata),
        };
      });
      groups[result.name] = {
        maxDistance: result.maxDistance,
        minDistance: result.minDistance,
        name: result.name,
        numberOfObjects: result.numberOfObjects,
        objects: objs,
        generated: (_a = result.generative) === null || _a === void 0 ? void 0 : _a.result,
      };
      objects.push(...objs);
    });
    return {
      objects: objects,
      groups: groups,
      generated: reply.generativeGroupedResult,
    };
  }
  properties(properties) {
    if (!properties) return {};
    return this.objectProperties(properties.nonRefProps);
  }
  references(properties) {
    if (!properties) return undefined;
    if (properties.refProps.length === 0) return properties.refPropsRequested ? {} : undefined;
    const out = {};
    properties.refProps.forEach((property) => {
      const uuids = [];
      out[property.propName] = (0, utils_js_1.referenceFromObjects)(
        property.properties.map((property) => {
          const uuid = Deserialize.uuid(property.metadata);
          uuids.push(uuid);
          return {
            metadata: Deserialize.metadata(property.metadata),
            properties: this.properties(property),
            references: this.references(property),
            uuid: uuid,
            vectors: Deserialize.vectors(property.metadata),
          };
        }),
        property.properties.length > 0 ? property.properties[0].targetCollection : '',
        uuids
      );
    });
    return out;
  }
  parsePropertyValue(value) {
    if (value.boolValue !== undefined) return value.boolValue;
    if (value.dateValue !== undefined) return new Date(value.dateValue);
    if (value.intValue !== undefined) return value.intValue;
    if (value.listValue !== undefined)
      return this.supports125ListValue
        ? this.parseListValue(value.listValue)
        : value.listValue.values.map((v) => this.parsePropertyValue(v));
    if (value.numberValue !== undefined) return value.numberValue;
    if (value.objectValue !== undefined) return this.objectProperties(value.objectValue);
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.textValue !== undefined) return value.textValue;
    if (value.uuidValue !== undefined) return value.uuidValue;
    if (value.blobValue !== undefined) return value.blobValue;
    if (value.geoValue !== undefined) return value.geoValue;
    if (value.phoneValue !== undefined) return value.phoneValue;
    if (value.nullValue !== undefined) return undefined;
    throw new errors_js_1.WeaviateDeserializationError(
      `Unknown value type: ${JSON.stringify(value, null, 2)}`
    );
  }
  parseListValue(value) {
    if (value.boolValues !== undefined) return value.boolValues.values;
    if (value.dateValues !== undefined) return value.dateValues.values.map((date) => new Date(date));
    if (value.intValues !== undefined) return Deserialize.intsFromBytes(value.intValues.values);
    if (value.numberValues !== undefined) return Deserialize.numbersFromBytes(value.numberValues.values);
    if (value.objectValues !== undefined)
      return value.objectValues.values.map((v) => this.objectProperties(v));
    if (value.textValues !== undefined) return value.textValues.values;
    if (value.uuidValues !== undefined) return value.uuidValues.values;
    throw new Error(`Unknown list value type: ${JSON.stringify(value, null, 2)}`);
  }
  objectProperties(properties) {
    const out = {};
    if (properties) {
      Object.entries(properties.fields).forEach(([key, value]) => {
        out[key] = this.parsePropertyValue(value);
      });
    }
    return out;
  }
  static metadata(metadata) {
    const out = {};
    if (!metadata) return undefined;
    if (metadata.creationTimeUnixPresent) out.creationTime = new Date(metadata.creationTimeUnix);
    if (metadata.lastUpdateTimeUnixPresent) out.updateTime = new Date(metadata.lastUpdateTimeUnix);
    if (metadata.distancePresent) out.distance = metadata.distance;
    if (metadata.certaintyPresent) out.certainty = metadata.certainty;
    if (metadata.scorePresent) out.score = metadata.score;
    if (metadata.explainScorePresent) out.explainScore = metadata.explainScore;
    if (metadata.rerankScorePresent) out.rerankScore = metadata.rerankScore;
    if (metadata.isConsistent) out.isConsistent = metadata.isConsistent;
    return out;
  }
  static uuid(metadata) {
    if (!metadata || !(metadata.id.length > 0))
      throw new errors_js_1.WeaviateDeserializationError('No uuid returned from server');
    return metadata.id;
  }
  static vectorFromBytes(bytes) {
    const buffer = Buffer.from(bytes);
    const view = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4); // vector is float32 in weaviate
    return Array.from(view);
  }
  static intsFromBytes(bytes) {
    const buffer = Buffer.from(bytes);
    const view = new BigInt64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8); // ints are float64 in weaviate
    return Array.from(view).map(Number);
  }
  static numbersFromBytes(bytes) {
    const buffer = Buffer.from(bytes);
    const view = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8); // numbers are float64 in weaviate
    return Array.from(view);
  }
  static vectors(metadata) {
    if (!metadata) return {};
    if (metadata.vectorBytes.length === 0 && metadata.vector.length === 0 && metadata.vectors.length === 0)
      return {};
    if (metadata.vectorBytes.length > 0)
      return { default: Deserialize.vectorFromBytes(metadata.vectorBytes) };
    return Object.fromEntries(
      metadata.vectors.map((vector) => [vector.name, Deserialize.vectorFromBytes(vector.vectorBytes)])
    );
  }
  static batchObjects(reply, originalObjs, mappedObjs, elapsed) {
    const allResponses = [];
    const errors = {};
    const successes = {};
    const batchErrors = {};
    reply.errors.forEach((error) => {
      batchErrors[error.index] = error.error;
    });
    for (const [index, object] of originalObjs.entries()) {
      if (index in batchErrors) {
        const error = {
          message: batchErrors[index],
          object: object,
          originalUuid: object.id,
        };
        errors[index] = error;
        allResponses[index] = error;
      } else {
        const mappedObj = mappedObjs[index];
        successes[index] = mappedObj.uuid;
        allResponses[index] = mappedObj.uuid;
      }
    }
    return {
      uuids: successes,
      errors: errors,
      hasErrors: reply.errors.length > 0,
      allResponses: allResponses,
      elapsedSeconds: elapsed,
    };
  }
  static deleteMany(reply, verbose) {
    return Object.assign(Object.assign({}, reply), {
      objects: verbose
        ? reply.objects.map((obj) => {
            return {
              id: obj.uuid.toString(),
              successful: obj.successful,
              error: obj.error,
            };
          })
        : undefined,
    });
  }
  static activityStatusGRPC(status) {
    switch (status) {
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_COLD:
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_INACTIVE:
        return 'INACTIVE';
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_HOT:
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_ACTIVE:
        return 'ACTIVE';
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_FROZEN:
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_OFFLOADED:
        return 'OFFLOADED';
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_FREEZING:
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_OFFLOADING:
        return 'OFFLOADING';
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_UNFREEZING:
      case tenants_js_1.TenantActivityStatus.TENANT_ACTIVITY_STATUS_ONLOADING:
        return 'ONLOADING';
      default:
        throw new Error(`Unsupported tenant activity status: ${status}`);
    }
  }
  static activityStatusREST(status) {
    switch (status) {
      case 'COLD':
        return 'INACTIVE';
      case 'HOT':
        return 'ACTIVE';
      case 'FROZEN':
        return 'OFFLOADED';
      case 'FREEZING':
        return 'OFFLOADING';
      case 'UNFREEZING':
        return 'ONLOADING';
      case undefined:
        return 'ACTIVE';
      default:
        return status;
    }
  }
  static tenantsGet(reply) {
    const tenants = {};
    reply.tenants.forEach((t) => {
      tenants[t.name] = {
        name: t.name,
        activityStatus: Deserialize.activityStatusGRPC(t.activityStatus),
      };
    });
    return tenants;
  }
}
exports.Deserialize = Deserialize;
