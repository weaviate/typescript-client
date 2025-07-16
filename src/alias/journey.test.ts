import weaviate, { WeaviateClient } from '..';
import { requireAtLeast } from '../../test/version';
import { Alias } from './types';

requireAtLeast(1, 32, 0).describe('manages collection aliases', () => {
  let client: WeaviateClient;
  const collectionsWithAliases = ['PaulHewson', 'GeorgeBarnes', 'ColsonBaker'];

  beforeAll(async () => {
    client = await weaviate.connectToLocal();
    await Promise.all(collectionsWithAliases.map(client.collections.delete));
    await Promise.all(collectionsWithAliases.map((name) => client.collections.create({ name })));
  });

  it('should create alias', () => {
    return Promise.all([
      client.alias.create({ collection: 'PaulHewson', alias: 'Bono' }),
      client.alias.create({ collection: 'GeorgeBarnes', alias: 'MachineGunKelly' }),
    ])
      .then(() => client.alias.listAll())
      .then((aliases) => {
        expect(aliases).not.toBeUndefined();
        expect(aliases).toHaveLength(2);
        expect(aliases).toEqual<Alias[]>([
          { collection: 'PaulHewson', alias: 'Bono' },
          { collection: 'GeorgeBarnes', alias: 'MachineGunKelly' },
        ]);
      });
  });

  it('should update alias', () => {
    return client.alias
      .update({ alias: 'MachineGunKelly', newTargetCollection: 'ColsonBaker' })
      .then(() => client.alias.get('MachineGunKelly'))
      .then((alias) => {
        expect(alias.collection).toEqual('ColsonBaker');
      });
  });

  it('should delete alias Bono', () => {
    return client.alias
      .delete('Bono')
      .then(() => client.alias.listAll({ collection: 'PaulHewson' }))
      .then((aliases) => expect(aliases).toEqual([]));
  });

  it('should delete alias MachineGunKelly', () => {
    return client.alias
      .delete('MachineGunKelly')
      .then(() => client.alias.listAll({ collection: 'ColsonBaker' }))
      .then((aliases) => expect(aliases).toEqual([]));
  });
});
