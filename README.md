# GBPTM

A suite of modules for Public Convenience Ltd's *Great British Public Toilet Map*

## Getting Started

### Prerequisites

* nvm (or a node version matching the one specified in [.nvmrc](./nvmrc))
* yarn
* git
* mongodb

### Installation

```
git clone git@github.com:neontribe/gbptm.git gbptm
cd gbtpm
git checkout unity
nvm install && nvm use
npm install -g yarn
yarn install
```

### Data sources

For development purposes a reasonably up-to-date dataset is included in `data`. Use `yarn load:devData` to insert it in your local mongodb instance. **caution** this will dump your existing `gbptm` db first.

## Packages

* `@neontribe/gbptm-api`
* `@neontribe/gbptm-ui`
