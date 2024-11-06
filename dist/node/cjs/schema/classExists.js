'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const commandBase_js_1 = require('../validation/commandBase.js');
const string_js_1 = require('../validation/string.js');
class ClassExists extends commandBase_js_1.CommandBase {
  constructor(client) {
    super(client);
    this.withClassName = (className) => {
      this.className = className;
      return this;
    };
    this.validateClassName = () => {
      if (!(0, string_js_1.isValidStringProperty)(this.className)) {
        this.addError('className must be set - set with .withClassName(className)');
      }
    };
    this.validate = () => {
      this.validateClassName();
    };
    this.do = () => {
      this.validate();
      if (this.errors.length > 0) {
        return Promise.reject(new Error('invalid usage: ' + this.errors.join(', ')));
      }
      const path = `/schema`;
      return this.client.get(path).then((res) => {
        var _a;
        return (_a = res.classes) === null || _a === void 0
          ? void 0
          : _a.some((c) => c.class === this.className);
      });
    };
  }
}
exports.default = ClassExists;
