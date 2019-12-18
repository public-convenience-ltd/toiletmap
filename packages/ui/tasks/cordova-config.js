// import React from 'react';
const React = require('react');
const ReactDOM = require('react-dom/server');
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');

if (process.argv.slice(2).some(arg => arg.match(/^-?-h/))) {
  console.log(
    'Builds config.xml, use with --dev to build a dev version which is useful for running the app locally against localhost:3000'
  );
  console.log(
    'Set the env var REACT_APP_BAKED_BACKEND to configure which url should be allowed to be accessed from the phone.'
  );
  process.exit(0);
}

// Configuration
const DEV = process.argv.slice(2).includes('--dev');
const { REACT_APP_BAKED_BACKEND } = process.env;
const appid = 'uk.org.toiletmap';

const configXMLDestination = path.resolve(__dirname, '..', 'config.xml');
const pkg = require('../package.json');

const lowerFirst = str => str[0].toLowerCase() + str.slice(1);
const namespaceProps = (prefix, props) => {
  const newProps = {};
  Object.keys(props).forEach(propName => {
    const propValue = props[propName];

    // If the prop looks like a namespace-able prop
    if (propName !== prefix && propName.startsWith(prefix)) {
      const withoutPrefix = propName.slice(prefix.length);

      propName = `${prefix}:${lowerFirst(withoutPrefix)}`;
    }

    newProps[propName] = propValue;
  });

  return newProps;
};

const Widget = props => <widget {...namespaceProps('xmlns', props)} />;

const Application = props => (
  <application {...namespaceProps('android', props)} />
);

// I don't think we need these
// const AllowIntents = () => (
//   <React.Fragment>
//     <allow-intent href="https://gbptm.eu.auth0.com/login/*" />
//     <allow-intent href="http://*/*" />
//     <allow-intent href="https://*/*" />
//     <allow-intent href="tel:*" />
//     <allow-intent href="sms:*" />
//     <allow-intent href="mailto:*" />
//     <allow-intent href="geo:*" />
//   </React.Fragment>
// );
const singleJoiningSlash = (a, b) => {
  const aSlash = a.endsWith('/');
  const bSlash = b.startsWith('/');

  if (aSlash && bSlash) {
    return a + b.slice(1);
  }

  if (!aSlash && !bSlash) {
    return `${a}/${b}`;
  }

  return a + b;
};
const AllowAPI = () => {
  if (!REACT_APP_BAKED_BACKEND) {
    return null;
  }

  return (
    <allow-intent href={singleJoiningSlash(REACT_APP_BAKED_BACKEND, '*')} />
  );
};

const config = ReactDOM.renderToStaticMarkup(
  <Widget
    id={appid}
    version={pkg.version}
    xmlns="http://www.w3.org/ns/widgets"
    xmlnsCdv="http://cordova.apache.org/ns/1.0"
    xmlnsAndroid="http://schemas.android.com/apk/res/android"
  >
    <name>Toilet Map</name>
    <description>
      The Great British Public Toilet Map is the UK's largest database of
      publicly-accessible toilets, with over 11000 facilities.
    </description>
    <author
      email="toiletmap-admin@neontribe.co.uk"
      href="https://www.toiletmap.org.uk"
    >
      Neontribe
    </author>
    {DEV ? (
      <content src="http://localhost:3000" />
    ) : (
      <content src="index.html" />
    )}
    <access origin="*" />
    {DEV && <allow-navigation href="http://localhost:3000/*" />}
    <AllowAPI />
    <allow-intent href="https://maps.apple.com/*" />
    <allow-intent href="https://*.google.com/maps/*" />
    {/* Make sure that the auth0 integration works well */}
    <preference name="AndroidLaunchMode" value="singleTask" />
    <platform name="android">
      <allow-intent href="market:*" />
      {DEV && (
        <edit-config
          file="app/src/main/AndroidManifest.xml"
          mode="merge"
          target="/manifest/application"
        >
          <Application androidUsesCleartextTraffic="true" />
        </edit-config>
      )}
    </platform>
    <edit-config
      target="NSLocationWhenInUseUsageDescription"
      file="*-Info.plist"
      mode="merge"
    >
      <string>need location access to find toilets nearby</string>
    </edit-config>
    <platform name="ios">
      <allow-intent href="itms:*" />
      <allow-intent href="itms-apps:*" />
    </platform>
  </Widget>
);

const configXML = `
<?xml version='1.0' encoding='utf-8'?>
${prettier.format(config, {
  parser: 'html',
  htmlWhitespaceSensitivity: 'ignore',
})}
`.trim();

console.log(
  `Success! Writing ${
    DEV ? 'dev' : 'prod'
  } config out to ${configXMLDestination}`
);

fs.writeFileSync(configXMLDestination, configXML + '\n');
