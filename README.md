# GBPTM

A suite of modules for Public Convenience Ltd's *[Great British Public Toilet Map](https://wwww.toiletmap.org.uk)*

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
nvm install && nvm use
npm install -g yarn
yarn install
```

### UI Development

The gbptm ui is built with create-react-app. When working locally, if you don't want the hassle of setting up your own database and api server copy the contents of `packages/ui/example.env` to `packages/ui/.env` and adjust to taste. When you run `yarn dev` in the `ui` package your api requests will go to the endpoint specified.

### Data sources

For development purposes a reasonably up-to-date dataset is included in `data`. Use `yarn load:devData` to insert it in your local mongodb instance. **caution** this will dump your existing `gbptm` db first.
