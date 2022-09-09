# toiletmap.org.uk

[Public Convenience Ltd](https://www.publicconvenience.org/)'s _[Great British Public Toilet Map](https://www.toiletmap.org.uk)_

[<img src="./public/powered-by-vercel.svg" width="150" alt="Powered by Vercel">](https://vercel.com/?utm_source=public-convenience-ltd&utm_campaign=oss)

## What is the Toilet Map?

Everyone will, at some point in the day, need to use the toilet. Some people will need facilities more than others, and some will need to find toilets sooner rather than later.

The Great British Public Toilet Map aims to be a complete, up-to-date, sustainable source of toilet locations. It's the UK's largest database of publicly-accessible toilets, with over 14,000 facilities.

The project is completely open source and is supported by a fantastic set of [Sponsors](#sponsors) who help us make the service as good as it can possibly be.

This documentation is oriented towards developers, if you'd like to learn more about our data and how to access it please refer to [Toilet Map Explorer](https://www.toiletmap.org.uk/explorer).

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

## Sponsors

Our brilliant sponsors help us to bring a stable and high quality service to our users.

### Vercel

[<img src="./public/powered-by-vercel.svg" width="212" alt="Powered by Vercel">](https://vercel.com/?utm_source=public-convenience-ltd&utm_campaign=oss)

Vercel sponsor the hosting and deployment of the Next.js based Toilet Map, allowing us to scale confidently and iterate quickly using their versatile platform.

### Sentry

[<img src="https://user-images.githubusercontent.com/1771189/178340599-94f9d130-dd82-4389-a4ac-69b9fb014d8a.svg" width="212" alt="Logging is kindly sponsored by Sentry">](https://sentry.io)

Our client and server side logging in production is kindly sponsored by Sentry.

### Cypress

[<img src="https://user-images.githubusercontent.com/1771189/189427407-8d7fb6b2-1756-4e10-8dd7-9a4ae01986d8.png" width="212" alt="Cypress dashboard enhances our development workflow when working with our Cypress test suite">](https://www.cypress.io/dashboard)


Cypress Dashboard speeds up and enhances our testing workflow, helping us to deliver changes faster and with fewer bugs.

---

Could your company help?
[Let us know](https://www.toiletmap.org.uk/contact)
