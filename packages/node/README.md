# Weaviate Node.js client <img alt='Weaviate logo' src='https://weaviate.io/img/site/weaviate-logo-light.png' width='148' align='right' />

Official Weaviate client for Node.js, for easy interaction with a Weaviate instance over REST and gRPC.

For browsers, use [`@weaviate/web`](https://www.npmjs.com/package/@weaviate/web) instead.

## Installation

```bash
npm install @weaviate/node
```

Requires Node.js 22 or later.

## Usage

```ts
import weaviate from '@weaviate/node';

const client = await weaviate.connectToLocal();
const collection = client.collections.use('Article');
const result = await collection.query.nearText('vector databases', { limit: 3 });
await client.close();
```

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
