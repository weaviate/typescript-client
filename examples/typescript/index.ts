import weaviate from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

console.log(
  JSON.stringify(
    new weaviate.AuthAccessTokenCredentials({
      accessToken: 'token123',
      expiresIn: 123,
    })
  )
);

console.log(
  JSON.stringify(
    new weaviate.AuthUserPasswordCredentials({
      username: 'user123',
      password: 'password',
    })
  )
);

console.log(
  JSON.stringify(
    new weaviate.AuthClientCredentials({
      clientSecret: 'secret123',
    })
  )
);

console.log(JSON.stringify(new weaviate.ApiKey('abcd1234')));

client.misc
  .metaGetter()
  .do()
  .then((res: any) => console.log(`res: ${JSON.stringify(res)}`));
