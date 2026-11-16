import { toBase64FromMedia } from '@weaviate/node';
import { describe, expect, it } from 'vitest';

describe('Unit testing of toBase64FromMedia in the node client', () => {
  const short = Buffer.from('image bytes').toString('base64');
  const long = Buffer.alloc(6000, 7).toString('base64');

  it.each([
    ['a short png data URI', `data:image/png;base64,${short}`, short],
    ['a long jpeg data URI', `data:image/jpeg;base64,${long}`, long],
    ['a data URI with media type parameters', `data:image/png;name=img.png;base64,${short}`, short],
  ])('should strip the prefix from %s', async (_, media, expected) => {
    expect(await toBase64FromMedia(media)).toEqual(expected);
  });

  it('should return a base64 string as is', async () => {
    expect(await toBase64FromMedia(long)).toEqual(long);
  });
});
