// import React from 'react';
const React = require('react');
const ReactDOM = require('react-dom/server');
const prettier = require('prettier');
const fs = require('fs');
const path = require('path');

const AllowAPI = require('./config-components/AllowAPI');
const Config = require('./config-components/Config');
const CordovaPlugins = require('./config-components/CordovaPlugins');

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
const appid = 'uk.org.toiletmap';
const { REACT_APP_BAKED_BACKEND } = process.env;
const configXMLDestination = path.resolve(__dirname, '..', 'config.xml');
const pkg = require('../package.json');

const config = ReactDOM.renderToStaticMarkup(
  <Config id={appid} version={pkg.version} dev={DEV}>
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
    <AllowAPI api={REACT_APP_BAKED_BACKEND} />
    {/* Set SingleTask mode to make sure that the auth0 integration works well */}
    <preference name="AndroidLaunchMode" value="singleTask" />
    <preference name="phonegap-version" value="cli-9.0.0" />
    <CordovaPlugins dependencies={pkg.dependencies} />
  </Config>
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
