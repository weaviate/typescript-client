import { Deserialize } from '@weaviate/core/deserialize';
import { Serialize } from '@weaviate/core/serialize';
import { describe, expect, it } from 'vitest';

// The byte decoders are private, but they are shared with the browser-safe `@weaviate/web` package,
// so they must work without Node's global `Buffer`.
const decode = Deserialize as any;
const encode = Serialize as any;

const bytesOf = (view: ArrayBufferView) =>
  new Uint8Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));

/** Run `fn` the way a browser would see it: with no global `Buffer`. */
const withoutBuffer = async <T>(fn: () => T | Promise<T>): Promise<T> => {
  const saved = globalThis.Buffer;
  try {
    // @ts-expect-error Buffer is not optional in the Node typings
    delete globalThis.Buffer;
    return await fn();
  } finally {
    globalThis.Buffer = saved;
  }
};

/** A view of `bytes` whose byteOffset is odd, i.e. not aligned for 4- or 8-byte typed arrays. */
const unaligned = (bytes: Uint8Array) => {
  const padded = new Uint8Array(bytes.byteLength + 1);
  padded.set(bytes, 1);
  return padded.subarray(1);
};

describe('Unit testing of Deserialize byte decoders', () => {
  const floats = [1, -2.5, 3.25, 0];
  const doubles = [1.5, -2.25, Math.PI];
  const ints = [0, 7, -8, 2 ** 40];

  it('should decode a float32 vector as little-endian', () => {
    // 1.0 as a little-endian float32 is 00 00 80 3f
    expect(decode.vectorFromBytes(new Uint8Array([0, 0, 0x80, 0x3f]))).toEqual([1]);
  });

  it('should decode what Serialize encodes (vector)', () => {
    expect(decode.vectorFromBytes(encode.vectorToBytes(floats))).toEqual(floats);
  });

  it('should decode what Serialize encodes (multi-vector)', async () => {
    const vectors = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(await decode.vectorsFromBytes(await encode.vectorsToBytes(vectors))).toEqual(vectors);
  });

  it('should decode float64 numbers', () => {
    expect(decode.numbersFromBytes(bytesOf(new Float64Array(doubles)))).toEqual(doubles);
  });

  it('should decode int64 ints', () => {
    expect(decode.intsFromBytes(bytesOf(new BigInt64Array(ints.map(BigInt))))).toEqual(ints);
  });

  it('should decode views that are not aligned to the element size', () => {
    expect(decode.vectorFromBytes(unaligned(bytesOf(new Float32Array(floats))))).toEqual(floats);
    expect(decode.numbersFromBytes(unaligned(bytesOf(new Float64Array(doubles))))).toEqual(doubles);
    expect(decode.intsFromBytes(unaligned(bytesOf(new BigInt64Array(ints.map(BigInt)))))).toEqual(ints);
  });

  it('should decode Node Buffers, which is what the gRPC layer hands back in Node', () => {
    expect(decode.vectorFromBytes(Buffer.from(bytesOf(new Float32Array(floats))))).toEqual(floats);
    expect(decode.vectorFromBytes(Buffer.from(bytesOf(new Float32Array(floats))).subarray(0))).toEqual(
      floats
    );
  });

  describe('without a global Buffer (as in a browser)', () => {
    it('should decode a vector', async () => {
      expect(await withoutBuffer(() => decode.vectorFromBytes(bytesOf(new Float32Array(floats))))).toEqual(
        floats
      );
    });

    it('should decode a multi-vector', async () => {
      const vectors = [
        [1, 2],
        [3, 4],
      ];
      const bytes = await encode.vectorsToBytes(vectors);
      expect(await withoutBuffer(() => decode.vectorsFromBytes(bytes))).toEqual(vectors);
    });

    it('should decode float64 numbers', async () => {
      expect(await withoutBuffer(() => decode.numbersFromBytes(bytesOf(new Float64Array(doubles))))).toEqual(
        doubles
      );
    });

    it('should decode int64 ints', async () => {
      expect(
        await withoutBuffer(() => decode.intsFromBytes(bytesOf(new BigInt64Array(ints.map(BigInt)))))
      ).toEqual(ints);
    });
  });
});
