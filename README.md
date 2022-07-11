# Toiletmap.org.uk

[Public Convenience Ltd](https://www.publicconvenience.org/)'s _[Great British Public Toilet Map](https://www.toiletmap.org.uk)_

This documentation is oriented towards developers, if you'd like to learn more about our data and how to access it please refer to [Toilet Map Explorer](https://www.toiletmap.org.uk/explorer).

[![Powered by Vercel](./public/powered-by-vercel.svg)](https://vercel.com/?utm_source=public-convenience-ltd&utm_campaign=oss)

Logging is kindly sponsored by Sentry:

[<img src="https://user-images.githubusercontent.com/1771189/178340599-94f9d130-dd82-4389-a4ac-69b9fb014d8a.svg" width="212" alt="Logging is kindly sponsored by Sentry">](https://sentry.io)

## Getting Started

### Prerequisites

- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) (or a node version matching the one specified in [.nvmrc](./nvmrc))
- [yarn](https://yarnpkg.com/getting-started/install)
- Vercel CLI (optional)
- mongodb (optional)

### Installation

_Clone or download and unpack the project and change into its directory and then:_

```
nvm install && nvm use
npm install -g yarn
yarn
```

### Run, Toiletmap, Run

To run the toiletmap locally for the first time:

```
yarn dev
```

Before long you should be looking at a browser window showing the UI!
If you'd like to make contributions to the project this is a good time to read our [contributing guidelines](https://github.com/neontribe/gbptm/blob/master/.github/CONTRIBUTING.md) and our [code of conduct](https://github.com/neontribe/gbptm/blob/master/.github/CODE_OF_CONDUCT.md).

### Development

The toiletmap UI is built with Next.js. The API is written in GraphQL with [Apollo Server](https://www.npmjs.com/package/apollo-server) and data is stored in a MongoDB instance via [mongoose](https://mongoosejs.com/). Authentication is handled by [Auth0](https://auth0.com/) and the site is deployed to [vercel](https://vercel.com)
