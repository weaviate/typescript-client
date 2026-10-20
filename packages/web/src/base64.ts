import { Media } from '@weaviate/core';

const isUrl = (input: string): boolean => {
  try {
    new URL(input); // eslint-disable-line no-new
    return true;
  } catch {
    return false;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1]; // remove data:mime/type;base64,
        resolve(base64);
      } else {
        reject(new Error('Could not convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const base64DataUriPrefix = /^data:[^,]*;base64,/;

export const downloadImageFromURLAsBase64 = async (url: string): Promise<string> => {
  if (!isUrl(url)) {
    throw new Error('Invalid URL');
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const blob = await response.blob();
  return blobToBase64(blob);
};

/**
 * Converts media input into a base64 string.
 * Accepts:
 * - A base64 string (returns it unchanged)
 * - A base64 data URI (returns it without the `data:<mime>;base64,` prefix)
 * - A URL (fetches the image and converts to base64)
 * - A `Blob` or `File` (uses FileReader)
 * - A `Uint8Array` (copied into a `Blob`, which rejects `SharedArrayBuffer`-backed views)
 */
export const toBase64FromMedia = (media: Media): Promise<string> => {
  if (typeof media === 'string') {
    if (base64DataUriPrefix.test(media)) {
      // Base64 data URI, strip the data:mime/type;base64, prefix
      return Promise.resolve(media.replace(base64DataUriPrefix, ''));
    } else if (media.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(media)) {
      // Already base64 string
      return Promise.resolve(media);
    } else if (isUrl(media)) {
      return downloadImageFromURLAsBase64(media);
    } else {
      throw new Error('Unsupported string format. Must be base64 or a valid URL.');
    }
  } else if (media instanceof Blob) {
    return blobToBase64(media);
  } else if (media instanceof Uint8Array) {
    return blobToBase64(new Blob([new Uint8Array(media)]));
  } else {
    throw new Error('Unsupported media type');
  }
};
