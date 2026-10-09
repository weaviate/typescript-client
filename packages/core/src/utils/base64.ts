/**
 * Media accepted by the `nearImage` and `nearMedia` searches and by generative image inputs:
 * a base64 string, a file path, a URL, or raw bytes.
 */
export type Media = string | Uint8Array | Blob;

/**
 * Converts media into the base64 string sent to Weaviate. A base64 string input is returned as is.
 *
 * @param {Media} media The media to convert.
 * @returns {Promise<string>} The base64 string.
 */
export type ToBase64FromMedia = (media: Media) => Promise<string>;
