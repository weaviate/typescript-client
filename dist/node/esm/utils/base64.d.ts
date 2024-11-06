/// <reference types="node" resolution-mode="require"/>
/**
 * This function converts a file buffer into a base64 string so that it can be
 * sent to Weaviate and stored as a media field.
 *
 * @param {string | Buffer} file The media to convert either as a base64 string, a file path string, or as a buffer. If you passed a base64 string, the function does nothing and returns the string as is.
 * @returns {string} The base64 string
 */
export declare const toBase64FromMedia: (media: string | Buffer) => Promise<string>;
