const React = require('react');

const Widget = require('./Widget');
const Application = require('./Application');

module.exports = ({ children, dev, ...props }) => (
  <Widget
    xmlns="http://www.w3.org/ns/widgets"
    xmlnsCdv="http://cordova.apache.org/ns/1.0"
    xmlnsAndroid="http://schemas.android.com/apk/res/android"
    {...props}
  >
    {children}
    {dev ? (
      <content src="http://localhost:3000" />
    ) : (
      <content src="index.html" />
    )}
    <access origin="*" />
    {dev && <allow-navigation href="http://localhost:3000/*" />}
    <allow-intent href="https://maps.apple.com/*" />
    <allow-intent href="https://*.google.com/maps/*" />
    <platform name="android">
      <allow-intent href="market:*" />
      {dev && (
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
      <edit-config
        target="NSLocationWhenInUseUsageDescription"
        file="*-Info.plist"
        mode="merge"
      >
        <string>need location access to find toilets nearby</string>
      </edit-config>
      <allow-intent href="itms:*" />
      <allow-intent href="itms-apps:*" />
    </platform>
  </Widget>
);
