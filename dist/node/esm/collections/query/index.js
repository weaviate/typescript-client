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
import { WeaviateInvalidInputError } from '../../errors.js';
import { toBase64FromMedia } from '../../utils/base64.js';
import { Deserialize } from '../deserialize/index.js';
import { Serialize } from '../serialize/index.js';
import { Check } from './check.js';
class QueryManager {
  constructor(check) {
    this.check = check;
  }
  static use(connection, name, dbVersionSupport, consistencyLevel, tenant) {
    return new QueryManager(new Check(connection, name, dbVersionSupport, consistencyLevel, tenant));
  }
  parseReply(reply) {
    return __awaiter(this, void 0, void 0, function* () {
      const deserialize = yield Deserialize.use(this.check.dbVersionSupport);
      return deserialize.query(reply);
    });
  }
  parseGroupByReply(opts, reply) {
    return __awaiter(this, void 0, void 0, function* () {
      const deserialize = yield Deserialize.use(this.check.dbVersionSupport);
      return Serialize.isGroupBy(opts) ? deserialize.groupBy(reply) : deserialize.query(reply);
    });
  }
  fetchObjectById(id, opts) {
    return this.check
      .fetchObjectById(opts)
      .then(({ search }) => search.withFetch(Serialize.fetchObjectById(Object.assign({ id }, opts))))
      .then((reply) => this.parseReply(reply))
      .then((ret) => (ret.objects.length === 1 ? ret.objects[0] : null));
  }
  fetchObjects(opts) {
    return this.check
      .fetchObjects(opts)
      .then(({ search }) => search.withFetch(Serialize.fetchObjects(opts)))
      .then((reply) => this.parseReply(reply));
  }
  bm25(query, opts) {
    return this.check
      .bm25(opts)
      .then(({ search }) =>
        search.withBm25(
          Object.assign(Object.assign({}, Serialize.bm25(Object.assign({ query }, opts))), {
            groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined,
          })
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  hybrid(query, opts) {
    return this.check
      .hybridSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets, supportsVectorsForTargets }) =>
        search.withHybrid(
          Object.assign(
            Object.assign(
              {},
              Serialize.hybrid(
                Object.assign(
                  { query, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
                  opts
                )
              )
            ),
            { groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearImage(image, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        return toBase64FromMedia(image).then((image) =>
          search.withNearImage(
            Object.assign(
              Object.assign(
                {},
                Serialize.nearImage(
                  Object.assign({ image, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
                )
              ),
              { groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined }
            )
          )
        );
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearMedia(media, type, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) => {
        const args = Object.assign({ supportsTargets, supportsWeightsForTargets }, opts ? opts : {});
        let reply;
        switch (type) {
          case 'audio':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearAudio(Serialize.nearAudio(Object.assign({ audio: media }, args)))
            );
            break;
          case 'depth':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearDepth(Serialize.nearDepth(Object.assign({ depth: media }, args)))
            );
            break;
          case 'image':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearImage(Serialize.nearImage(Object.assign({ image: media }, args)))
            );
            break;
          case 'imu':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearIMU(Serialize.nearIMU(Object.assign({ imu: media }, args)))
            );
            break;
          case 'thermal':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearThermal(Serialize.nearThermal(Object.assign({ thermal: media }, args)))
            );
            break;
          case 'video':
            reply = toBase64FromMedia(media).then((media) =>
              search.withNearVideo(Serialize.nearVideo(Object.assign({ video: media }, args)))
            );
            break;
          default:
            throw new WeaviateInvalidInputError(`Invalid media type: ${type}`);
        }
        return reply;
      })
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearObject(id, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearObject(
          Object.assign(
            Object.assign(
              {},
              Serialize.nearObject(
                Object.assign({ id, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
              )
            ),
            { groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearText(query, opts) {
    return this.check
      .nearSearch(opts)
      .then(({ search, supportsTargets, supportsWeightsForTargets }) =>
        search.withNearText(
          Object.assign(
            Object.assign(
              {},
              Serialize.nearText(
                Object.assign({ query, supportsTargets, supportsWeightsForTargets }, opts ? opts : {})
              )
            ),
            { groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
  nearVector(vector, opts) {
    return this.check
      .nearVector(vector, opts)
      .then(({ search, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets }) =>
        search.withNearVector(
          Object.assign(
            Object.assign(
              {},
              Serialize.nearVector(
                Object.assign(
                  { vector, supportsTargets, supportsVectorsForTargets, supportsWeightsForTargets },
                  opts ? opts : {}
                )
              )
            ),
            { groupBy: Serialize.isGroupBy(opts) ? Serialize.groupBy(opts.groupBy) : undefined }
          )
        )
      )
      .then((reply) => this.parseGroupByReply(opts, reply));
  }
}
export default QueryManager.use;
