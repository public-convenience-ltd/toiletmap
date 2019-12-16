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
git clone https://github.com/neontribe/gbptm.git gbptm
cd gbptm
nvm install && nvm use
npm install -g yarn
yarn install
```

### UI Development

The toiletmap ui is built with [create-react-app](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md). There are two components, the main ui (`packages/ui`), and the explorer (`packages/explorer`)

When working locally, both of these apps provide a proxy to the api server at `https://gbptm-stage.herokuapp.com` this saves you having to set up an API server locally. Should you wish to proxy to a different backend copy the relevant application's `example.env` file to `.env` and adjust the values of the `PROXY` variable to taste.

You can run a local development server with `yarn dev` from each application's folder.

### Mobile app (WIP)

The UI has the ability to be packaged as a mobile app using cordova. Make sure to have you deps installed and add the platforms you wish to build for.

You can only build iOS apps on apple computers, for easy android app dev use the android studio. https://developer.android.com/studio.

The task `yarn dev-cordova` launches the phone app and react app at the same time, for this to work configure the port 3000 to be forwarded to the phone. Either use the [chrome dev tools chrome://inspect](chrome://inspect), or, you can use `adb reverse tcp:3000 tcp:3000`. For the latter you should have the emulator running before hand.

e.g.
```bash
$ yarn
$ cd packages/ui
$ npx cordova requirements
No platforms added to this project. Please use `cordova platform add <platform>`.

$ npx cordova prepare
$ yarn run dev-cordova
```

Useful platform guides (TODO: turn this into a docker image?):
- [cordova android platform docs](https://cordova.apache.org/docs/en/latest/guide/platforms/android/).
    Quickstart:
    1. https://gradle.org/install
    1. [android studio](https://developer.android.com/studio)
    1. Launch android studio once on an empty project, from there you can use the gui versions of the avd manager and sdk manager.
    1. configure some environment variables, usually best done in your `~/.bashrc` or `~/.bash_profile` on un*x, or on windows using the _Advanced system settings_ gui. Some example values:
        ```bash
        # Set to where you installed the android studio + `/jre`
        export JAVA_HOME=$HOME/apps/android-studio/jre
        export ANDROID_SDK_ROOT=$HOME/Android/Sdk
        export PATH=${PATH}:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/tools/bin:${ANDROID_SDK_ROOT}/emulator
        ```
    1. Accept licenses with those environment variables configured run the sdkmanager with the `--licenses` flag. e.g. `~/Android/Sdk/tools/bin/sdkmanager --licenses`
    1. [Set up an emulator](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#project-configuration).
- [ios](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/index.html)
    Quickstart:
    - xCode
    - **TODO**

#### Errors:
- `Unable to load PlatformApi from platform. Error: Cannot find module '.../foo.js`
    `Unhandled error. (The platform "<platform>" does not appear to be a valid cordova platform. It is missing foo.js. <platform> not supported.)`

    Your platform has corrupted. Use `npx cordova rm <platform> && npx cordova platform add <platform>`

### API Development

The toiletmap api stores its data in a mongodb instance, you'll need one locally to perform api-related development. The data is managed via `mongoose.js` through the schema definitions in `packages/api/db`. The package exposes a REST api and a GraphQL endpoint. The REST api is scheduled for deprecation in late 2019.
