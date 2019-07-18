# GBPTM

A suite of modules for [Public Convenience Ltd](https://www.publicconvenience.org/)'s *[Great British Public Toilet Map](https://www.toiletmap.org.uk)*

This documentation is oriented towards developers, if you'd like to learn more about our data and how to access it please refer to [Toilet Map Explorer](https://www.toiletmap.org.uk/explorer).

## Getting Started

### Prerequisites

* nvm (or a node version matching the one specified in [.nvmrc](./nvmrc))
* yarn
* git
* mongodb (for api development)

### Installation

```
git clone git@github.com:neontribe/gbptm.git gbptm
cd gbptm
nvm install && nvm use
npm install -g yarn
yarn install
```

### UI Development

The toiletmap ui is built with [create-react-app](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md). There are two components, the main ui (`packages/ui`), and the explorer (`packages/explorer`)

When working locally, both of these apps provide a proxy to the api server at `https://gbptm-stage.herokuapp.com` this saves you having to set up an API server locally. Should you wish to proxy to a different backend copy the relevant application's `example.env` file to `.env` and adjust the values of the `PROXY` variable to taste.

You can run a local development server with `yarn dev` from each application's folder.

### API Development

The toiletmap api stores its data in a mongodb instance, you'll need one locally to perform api-related development. The data is managed via `mongoose.js` through the schema definitions in `packages/api/db`. The package exposes a REST api and a GraphQL endpoint. The REST api is scheduled for deprecation in late 2019.
