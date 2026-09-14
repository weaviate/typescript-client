import { v4 } from 'uuid';
import { describe, expect, it } from 'vitest';
import { BatchDeleteReply } from '../../proto/v1/batch_delete.js';
import { Deserialize } from './index.js';

describe('Unit testing of Deserialize.deleteMany', () => {
  const baseReply = (uuid: Uint8Array): BatchDeleteReply => ({
    took: 0,
    failed: 0,
    matches: 1,
    successful: 1,
    objects: [{ uuid, successful: true, error: '' }],
  });

  it('should stringify a well-formed 16-byte uuid', () => {
    const id = v4();
    const uuid = Uint8Array.from(Buffer.from(id.replace(/-/g, ''), 'hex'));

    const result = Deserialize.deleteMany(baseReply(uuid), true);

    expect(result.objects![0].id).toBe(id);
  });

  it('should return an undefined id instead of throwing when the server omits the uuid', () => {
    const result = Deserialize.deleteMany(baseReply(new Uint8Array(0)), true);

    expect(result.objects![0].id).toBeUndefined();
    expect(result.objects![0].successful).toBe(true);
  });
});
