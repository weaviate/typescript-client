import weaviate from 'weaviate-ts-client';

if (process.platform !== 'linux') {
  throw new Error('EmbeddedDB only supports Linux at the moment. Try me in a Docker container!');
}

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:9898',
  embedded: new weaviate.EmbeddedOptions({
    port: 9898,
  }),
});

console.log('Weaviate binary:', client.embedded?.options.binaryPath);
console.log('Data path:', client.embedded?.options.persistenceDataPath);

await client.embedded?.start();

console.info('\nEmbedded DB started\n');

// Create object with autoschema
const result = await client.data
  .creator()
  .withClassName('Wine')
  .withProperties({
    name: 'Pinot noir',
    description: 'Smooth taste',
  })
  .do();
console.log(result);

// Dump all objects
const objects = await client.data.getter().do();
console.log(objects);

// Dump metadata
const metadata = await client.misc.metaGetter().do();
console.log(metadata);

console.info('\nStopping...');
client.embedded?.stop();
console.info('Exiting...');
