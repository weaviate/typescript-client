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
const errors_js_1 = require('../../errors.js');
const index_js_1 = require('../../index.js');
const index_js_2 = require('../deserialize/index.js');
const check_js_1 = require('../query/check.js');
const index_js_3 = require('../serialize/index.js');
class GenerateManager {
  constructor(check) {
    this.check = check;
  }
  static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
    return new GenerateManager(
      new check_js_1.Check(connection, name, dbVersionSupport, consistencyLevel, tenant)
    );
  }
  parseReply(reply) {
    return __awaiter(this, void 0, void 0, function* () {
      const deserialize = yield index_js_2.Deserialize.use(this.check.dbVersionSupport);
      return deserialize.generate(reply);
    });
  }
  parseGroupByReply(opts, reply) {
    return __awaiter(this, void 0, void 0, function* () {
      const deserialize = yield index_js_2.Deserialize.use(this.check.dbVersionSupport);
      return index_js_3.Serialize.isGroupBy(opts)
        ? deserialize.generateGroupBy(reply)
        : deserialize.generate(reply);
    });
  }
  fetchObjects(generate, opts) {
    return this.check
      .fetchObjects(opts)
      .then(({ search }) =>
        search.withFetch(
          Object.assign(Object.assign({}, index_js_3.Serialize.fetchObjects(opts)), {
            generative: index_js_3.Serialize.generative(generate),
          })
        )
      )
      .then((reply) => this.parseReply(reply));
  }
  bm25(query, generate, opts) {
    return this.check
      .bm25(opts)
      .then(({ search }) =>
        search.withBm25(
          Object.assign(Object.assign({}, index_js_3.Serialize.bm25(Object.assign({ query }, opts))), {
            generative: index_js_3.Serialize.generative(generate),
            groupBy: index_js_3.Serialize.isGroupBy(opts)
              ? index_js_3.Serialize.groupBy(opts.groupBy)
              : undefined,
          })
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  hybrid(query, generate, opts) {
    return this.check
      .hybridSearch(opts)
      .then(({ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets }) =>
        search.withHybrid(
          Object.assign(
            Object.assign(
              {},
              index_js_3.Serialize.hybrid(
                Object.assign(
                  { query, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
                  opts
                )
              )
            ),
            {
              generative: index_js_3.Serialize.generative(generate),
              groupBy: index_js_3.Serialize.isGroupBy(opts)
                ? index_js_3.Serialize.groupBy(opts.groupBy)
                : undefined,
            }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearImage(image, generate, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        (0, index_js_1.toBase64FromMedia)(image).then((image) =>
          search.withNearImage(
            Object.assign(
              Object.assign(
                {},
                index_js_3.Serialize.nearImage(
                  Object.assign({ image, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
                )
              ),
              {
                generative: index_js_3.Serialize.generative(generate),
                groupBy: index_js_3.Serialize.isGroupBy(opts)
                  ? index_js_3.Serialize.groupBy(opts.groupBy)
                  : undefined,
              }
            )
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearObject(id, generate, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearObject(
          Object.assign(
            Object.assign(
              {},
              index_js_3.Serialize.nearObject(
                Object.assign({ id, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
              )
            ),
            {
              generative: index_js_3.Serialize.generative(generate),
              groupBy: index_js_3.Serialize.isGroupBy(opts)
                ? index_js_3.Serialize.groupBy(opts.groupBy)
                : undefined,
            }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearText(query, generate, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearText(
          Object.assign(
            Object.assign(
              {},
              index_js_3.Serialize.nearText(
                Object.assign({ query, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
              )
            ),
            {
              generative: index_js_3.Serialize.generative(generate),
              groupBy: index_js_3.Serialize.isGroupBy(opts)
                ? index_js_3.Serialize.groupBy(opts.groupBy)
                : undefined,
            }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearVector(vector, generate, opts) {
    return this.check
      .nearVector(vector, opts)
      .then(({ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets }) =>
        search.withNearVector(
          Object.assign(
            Object.assign(
              {},
              index_js_3.Serialize.nearVector(
                Object.assign(
                  { vector, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
                  opts ? opts : {}
                )
              )
            ),
            {
              generative: index_js_3.Serialize.generative(generate),
              groupBy: index_js_3.Serialize.isGroupBy(opts)
                ? index_js_3.Serialize.groupBy(opts.groupBy)
                : undefined,
            }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearMedia(media, type, generate, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        let reply;
        const args = Object.assign({ supportsTargets, supportsWeightsForTargets }, opts ? opts : {});
        const generative = index_js_3.Serialize.generative(generate);
        const groupBy = index_js_3.Serialize.isGroupBy(opts)
          ? index_js_3.Serialize.groupBy(opts.groupBy)
          : undefined;
        switch (type) {
          case 'audio':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearAudio(
                Object.assign(
                  Object.assign({}, index_js_3.Serialize.nearAudio(Object.assign({ audio: media }, args))),
                  { generative, groupBy }
                )
              )
            );
            break;
          case 'depth':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearDepth(
                Object.assign(
                  Object.assign({}, index_js_3.Serialize.nearDepth(Object.assign({ depth: media }, args))),
                  { generative, groupBy }
                )
              )
            );
            break;
          case 'image':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearImage(
                Object.assign(
                  Object.assign({}, index_js_3.Serialize.nearImage(Object.assign({ image: media }, args))),
                  { generative, groupBy }
                )
              )
            );
            break;
          case 'imu':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearIMU(
                Object.assign(
                  Object.assign({}, index_js_3.Serialize.nearIMU(Object.assign({ imu: media }, args))),
                  { generative, groupBy }
                )
              )
            );
            break;
          case 'thermal':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearThermal(
                Object.assign(
                  Object.assign(
                    {},
                    index_js_3.Serialize.nearThermal(Object.assign({ thermal: media }, args))
                  ),
                  { generative, groupBy }
                )
              )
            );
            break;
          case 'video':
            reply = (0, index_js_1.toBase64FromMedia)(media).then((media) =>
              search.withNearVideo(
                Object.assign(
                  Object.assign({}, index_js_3.Serialize.nearVideo(Object.assign({ video: media }, args))),
                  { generative, groupBy }
                )
              )
            );
            break;
          default:
            throw new errors_js_1.WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return reply;
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}
exports.default = GenerateManager.use;
