import weaviate, {
  AuthClientCredentials,
  AuthUserPasswordCredentials,
  ApiKey,
  AuthAccessTokenCredentials,
  generateUuid5,
} from 'weaviate-ts-client';

const client = weaviate.client({
  scheme: 'http',
  host: 'localhost:8080',
});

console.log(
  JSON.stringify(
    new AuthAccessTokenCredentials({
      accessToken: 'token123',
      expiresIn: 123,
    })
  )
);

console.log(
  JSON.stringify(
    new AuthUserPasswordCredentials({
      username: 'user123',
      password: 'password',
    })
  )
);

console.log(
  JSON.stringify(
    new AuthClientCredentials({
      clientSecret: 'secret123',
    })
  )
);

console.log(JSON.stringify(new ApiKey('abcd1234')));
console.log(generateUuid5({ prop1: 'hello', prop2: 'world' }, 'the-best-namespace'));

client.misc
  .metaGetter()
  .do()
  .then((res: any) => console.log(`res: ${JSON.stringify(res)}`));
