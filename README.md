# GBPTM

A suite of modules for Public Convenience Ltd's *[Great British Public Toilet Map](https://wwww.toiletmap.org.uk)*

## Getting Started

### Prerequisites

* nvm (or a node version matching the one specified in [.nvmrc](./nvmrc))
* yarn
* git
* mongodb (for api development)

### Installation

```
git clone git@github.com:neontribe/gbptm.git gbptm
cd gbtpm
nvm install && nvm use
npm install -g yarn
yarn install
```

### UI Development

The gbptm ui is built with [create-react-app](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md). When working locally, if you don't want the hassle of setting up your own database and api server copy the contents of `packages/ui/example.env` to `packages/ui/.env` and adjust to taste.

You can run the local development server with `yarn dev` from the `packages/ui` folder.

### Data sources

For development purposes a reasonably up-to-date dataset is included in `data`. Use `yarn load:devData` to insert it in your local mongodb instance. **caution** this will dump your existing `gbptm` db first.
