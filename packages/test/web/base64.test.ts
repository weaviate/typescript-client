import { describe, expect, it } from 'vitest';
import { toBase64FromMedia } from '../../web/src/base64.js';

describe('Unit testing of toBase64FromMedia in the web client', () => {
  const b64 = Buffer.from('image bytes').toString('base64');

  it.each([
    ['a png data URI', `data:image/png;base64,${b64}`],
    ['a data URI with media type parameters', `data:image/png;name=img.png;base64,${b64}`],
  ])('should strip the prefix from %s', async (_, media) => {
    expect(await toBase64FromMedia(media)).toEqual(b64);
  });

  it('should return a base64 string as is', async () => {
    expect(await toBase64FromMedia(b64)).toEqual(b64);
  });
});
