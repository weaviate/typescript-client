import weaviate from 'weaviate-ts-client';

// EmbeddedDB only supports Linux. Try me in a docker container!
if (process.platform == 'linux') {
  const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:9898',
    embedded: new weaviate.EmbeddedOptions({
      port: 9898,
    }),
  });

  await client.embedded?.start();

  client.misc
    .metaGetter()
    .do()
    .then((res: any) => console.log(`res: ${JSON.stringify(res)}`));

  client.embedded?.stop();
}
