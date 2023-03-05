# toiletmap.org.uk

[Public Convenience Ltd](https://www.publicconvenience.org/)'s _[Great British Public Toilet Map](https://www.toiletmap.org.uk)_

[<img src="./public/powered-by-vercel.svg" width="150" alt="Powered by Vercel">](https://vercel.com/?utm_source=public-convenience-ltd&utm_campaign=oss)

## What is the Toilet Map?

Everyone will, at some point in the day, need to use the toilet. Some people will need facilities more than others, and some will need to find toilets sooner rather than later.

The Great British Public Toilet Map aims to be a complete, up-to-date, sustainable source of toilet locations. It's the UK's largest database of publicly-accessible toilets, with over 14,000 facilities.

The project is completely open source and is supported by a fantastic set of [Sponsors](#sponsors) who help us make the service as good as it can possibly be.

This documentation is oriented towards developers, if you'd like to learn more about our data and how to access it please refer to [Toilet Map Explorer](https://www.toiletmap.org.uk/explorer).

## Getting Started

The following is a "quick start" guide aimed at getting you started with a development environment to start hacking on the map. If you'd like to configure Auth0 for local authentication or run our end to end tests locally please take a look at our more in-depth [setup](./docs/setup.md) documentation.

### Prerequisites

- [fnm](https://github.com/Schniz/fnm) (or a node version matching the one specified in [.nvmrc](./nvmrc))
- [pnpm](https://pnpm.io/installation)
- Vercel CLI (optional)
- mongodb (optional)

### Installation

_Clone or download and unpack the project and change into its directory and then use your favourite node version manager to switch to the version defined in our `.nvmrc`. We use [fnm](https://github.com/Schniz/fnm) as a demonstration, although alternative are available such as `asdf` and `nvm`:_

```
fnm use
```

_Now we install the dependencies using the `pnpm` package manager:_

```
pnpm install
```

### Run, Toiletmap, Run

First we need a set of local environment variables:

```
cp .env.local.example .env.local
```

Next you'll need to set up a local instance of mongodb based on our mocked loo data. This is so that you can load something on your local instance of the Toilet Map. It's also possible to connect directly to our staging database, although you'll need to ask for those credentials should you need them.

```
pnpm startMemoryMongo
```

```
** Expected output: **
> Populating the database from mock-reports.json
> progress [✨✨✨✨✨✨✨✨✨✨✨✨✨✨✨]
> Done.
> ====
> Server started
```

When you run this command, 5000 mocked loos will be loaded into an in-memory mongodb instance from [mock-reports.json](./scripts/mock-reports.json). These loos are pre-generated using faker.js in [generateMocks.ts](./scripts/generateMocks.ts).

Because the faker generation is set with a static seed, the values remain the same between generations. This is important, because we depend upon the values remaining the same in our [cypress tests](./cypress/e2e//desktop/index.cy.ts) so we have a deterministic set of data to rely upon across our test runs.

Once you have a local mongodb instance running you'll then be able to spin up a local development server using the following command:

```
pnpm dev
```

Once this is running, navigate to [http://localhost:3000](http://localhost:3000) and you should be presented with your very own instance of the Toilet Map that is connected to the in-memory mongodb server that we stood up in the following step.

If you'd like to make contributions to the project this is a good time to read our [contributing guidelines](https://github.com/neontribe/gbptm/blob/master/.github/CONTRIBUTING.md) and our [code of conduct](https://github.com/neontribe/gbptm/blob/master/.github/CODE_OF_CONDUCT.md).

### Architecture

The Toilet Map UI is built with [Next.js](https://nextjs.org/). The API is written in GraphQL with [GraphQL Yoga Server](https://github.com/dotansimha/graphql-yoga) and data is stored in a Postgres database hosted by [Supabase](https://supabase.com/). We connect to the database through the [Prisma](https://www.prisma.io/) ORM. Authentication is handled by [Auth0](https://auth0.com/) and the site is deployed to [vercel](https://vercel.com)

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

Looking to help?
[Let us know](https://www.toiletmap.org.uk/contact)
