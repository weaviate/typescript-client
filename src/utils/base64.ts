import fs from 'fs';

const isFilePromise = (file: string | Buffer): Promise<boolean> =>
  new Promise((resolve, reject) => {
    if (file instanceof Buffer) {
      resolve(false);
    }
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
      }
      resolve(stats.isFile());
    });
  });

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
      : Promise.resolve(file)
  );

/**
 * This function converts a file buffer into a base64 string so that it can be
 * sent to Weaviate and stored as a media field.
 *
 * @param {string | Buffer} file The media to convert either as a base64 string, a file path string, or as a buffer. If you passed a base64 string, the function does nothing and returns the string as is.
 * @returns {string} The base64 string
 */
export const toBase64FromMedia = (media: string | Buffer): Promise<string> => fileToBase64(media);
