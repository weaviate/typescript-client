# Weaviate web client <img alt='Weaviate logo' src='https://weaviate.io/img/site/weaviate-logo-light.png' width='148' align='right' />

Official Weaviate client for browsers, for easy interaction with a Weaviate instance over REST and gRPC-Web.

For Node.js, use [`@weaviate/node`](https://www.npmjs.com/package/@weaviate/node) instead.

## Installation

```bash
npm install @weaviate/web
```

## Usage

```ts
import weaviate from '@weaviate/web';

const client = await weaviate.connectToLocal();
const collection = client.collections.use('Article');
const result = await collection.query.nearText('vector databases', { limit: 3 });
await client.close();
```

gRPC requests go to the HTTP host and port at the `/v1/grpc-web` path, so no separate gRPC port is configured.

Server-side batching is not available in the browser: `client.batch.stream()` and `collection.data.ingest()` throw.

## Documentation

- [General Documentation](https://weaviate.io/developers/weaviate/client-libraries/typescript).
- [Client-specific Documentation](https://weaviate.github.io/typescript-client/)

## Support

- [Stackoverflow for questions](https://stackoverflow.com/questions/tagged/weaviate).
- [Github for issues](https://github.com/weaviate/typescript-client/issues).

## Contributing

- [How to Contribute](https://github.com/weaviate/typescript-client/blob/main/CONTRIBUTE.md).

## Build Status

[![Build Status](https://github.com/weaviate/typescript-client/actions/workflows/.github/workflows/main.yaml/badge.svg?branch=main)](https://github.com/weaviate/typescript-client/actions/workflows/.github/workflows/main.yaml)
