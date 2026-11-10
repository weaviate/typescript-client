import { Media } from '@weaviate/core';
import fs from 'fs';

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

const isUrl = (file: string): file is string => {
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
    const response = await fetch(url, {
      headers: { 'Content-Type': 'image/*' },
    });

    if (!Buffer.isBuffer(response)) {
      throw new Error('Response is not a buffer');
    }

    return response.toString('base64');
  } catch (error) {
    throw new Error(`Failed to download image from URL: ${url}`);
  }
};

const isBuffer = (file: string | Buffer): file is Buffer => file instanceof Buffer;

const base64DataUriPrefix = /^data:[^,]*;base64,/;

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
 * Converts media into a base64 string so that it can be sent to Weaviate.
 *
 * @param {Media} media The media as a base64 string, a base64 data URI, a file path, a URL, a `Uint8Array` (including `Buffer`), or a `Blob`. A base64 string is returned as is and a data URI has its `data:<mime>;base64,` prefix removed.
 * @returns {Promise<string>} The base64 string.
 */
export const toBase64FromMedia = async (media: Media): Promise<string> => {
  if (typeof media === 'string' && base64DataUriPrefix.test(media))
    return media.replace(base64DataUriPrefix, '');
  if (media instanceof Blob) return Buffer.from(await media.arrayBuffer()).toString('base64');
  if (media instanceof Uint8Array)
    return Buffer.from(media.buffer, media.byteOffset, media.byteLength).toString('base64');
  return fileToBase64(media);
};
