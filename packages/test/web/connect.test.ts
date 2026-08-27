import { describe, it, expect } from 'vitest';
import weaviate from '@weaviate/web';
import { requireAtLeast } from '../version';

requireAtLeast(1, 39, 0).describe('connectToLocal', () => {
  it('should connect to a local Weaviate instance using grpc-web', async () => {
    const client = await weaviate.connectToLocal();
    const response = await client.getMeta();
    expect(response).toHaveProperty('version');
  });
});
