// import React from 'react';
const React = require('react');
const ReactDOM = require('react-dom/server');
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');

const configXMLDestination = path.resolve(__dirname, '..', 'config.xml');
const pkg = require('../package.json');
const DEV = process.argv.slice(2).indexOf('--dev') !== -1;
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

const config = ReactDOM.renderToStaticMarkup(
  <Widget
    id="uk.org.toiletmap"
    version={pkg.version}
    xmlns="http://www.w3.org/ns/widgets"
    xmlnsCdv="http://cordova.apache.org/ns/1.0"
    xmlnsAndroid="http://schemas.android.com/apk/res/android"
  >
    <name>Gbptm</name>
    <description>
      A sample Apache Cordova application that responds to the deviceready
      event.
    </description>
    <author email="dev@cordova.apache.org" href="http://cordova.io">
      Apache Cordova Team
    </author>
    {DEV ? (
      <content src="http://localhost:3000" />
    ) : (
      <content src="index.html" />
    )}
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <access origin="*" />
    <allow-navigation href="http://localhost:3000/*" />
    <allow-intent href="https://gbptm.eu.auth0.com/login/*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
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
