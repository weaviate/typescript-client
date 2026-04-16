import Connection from '../../connection/index.js';
import { WeaviatePropertyTokenizeRequest, WeaviateTokenizeResponse } from '../../openapi/types.js';
import { TokenizeResult } from '../../tokenize/types.js';
import { parseResult } from '../../tokenize/util.js';
import { DbVersionSupport } from '../../utils/dbVersion.js';

const tokenize = <T>(
  connection: Connection,
  name: string,
  dbVersionSupport: DbVersionSupport
): Tokenize<T> => {
  return {
    property: (propertyName, text) =>
      dbVersionSupport
        .supportsTokenize()
        .then(({ supports, message }) => (supports ? Promise.resolve() : Promise.reject(new Error(message))))
        .then(() =>
          connection.postReturn<WeaviatePropertyTokenizeRequest, WeaviateTokenizeResponse>(
            `/schema/${name}/properties/${propertyName}/tokenize`,
            { text }
          )
        )
        .then(parseResult),
  };
};

export interface Tokenize<T> {
  /**
   * Tokenize a string using the tokenization configuration already set for a property of this collection.
   *
   * This is a utility method that can be used to understand how a string will be tokenized with the current configuration of the property, without needing to perform an actual query.
   *
   * @param {string} name The name of the property to use for tokenization.
   * @param {string} text The text to tokenize.
   * @returns {Promise<TokenizeResult>} A promise that resolves with the tokenization result.
   */
  property(name: T extends undefined ? string : keyof T & string, text: string): Promise<TokenizeResult>;
}

export default tokenize;
