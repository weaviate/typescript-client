import fs from 'fs';
import { httpClient } from '../connection/http.js';

const isFilePromise = (file: string | Buffer): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (file instanceof Buffer) {
      resolve(false);
    }
    fs.stat(file, (err, stats) => {
      if (err) {
        if (err.code == 'ENAMETOOLONG') {
          resolve(false);
          return;
        }
        reject(err);
        return;
      }
      if (stats === undefined) {
        resolve(false);
        return;
      }
      resolve(stats.isFile());
    });
  });

const isUrl = (file: string | Buffer): boolean => {
  if (typeof file !== 'string') return false;
  try {
    const url = new URL(file);
    return !!url;
  } catch {
    return false;
  }
};

export const downloadImageFromURLAsBase64 = async (url: string): Promise<string> => {
  if (!isUrl(url)) {
    throw new Error('Invalid URL');
  }

  try {
    const client = httpClient({
      headers: { 'Content-Type': 'image/*' },
      host: '',
    });

    const response = await client.externalGet(url);

    if (!Buffer.isBuffer(response)) {
      throw new Error('Response is not a buffer');
    }

    return response.toString('base64');
  } catch (error) {
    throw new Error(`Failed to download image from URL: ${url}`);
  }
};

const isBuffer = (file: string | Buffer): file is Buffer => file instanceof Buffer;

const fileToBase64 = (file: string | Buffer): Promise<string> =>
  isFilePromise(file).then((isFile) =>
    isFile
      ? new Promise((resolve, reject) => {
          fs.readFile(file, (err, data) => {
            if (err) {
              reject(err);
            }
            resolve(data.toString('base64'));
          });
        })
      : isBuffer(file)
      ? Promise.resolve(file.toString('base64'))
      : isUrl(file)
      ? downloadImageFromURLAsBase64(file)
      : Promise.resolve(file)
  );

/**
 * This function converts a file buffer into a base64 string so that it can be
 * sent to Weaviate and stored as a media field.
 *
 * @param {string | Buffer} file The media to convert either as a base64 string, a file path string, an url, or as a buffer. If you passed a base64 string, the function does nothing and returns the string as is.
 * @returns {string} The base64 string
 */
export const toBase64FromMedia = (media: string | Buffer): Promise<string> => fileToBase64(media);
