const webpack = require('webpack');
const {
  useBabelRc,
  override,
  useEslintRc,
  addBabelPreset,
} = require('customize-cra');

module.exports = {
  webpack: override(
    useBabelRc(),
    useEslintRc(),
    addBabelPreset('@emotion/babel-preset-css-prop'),
    function (config, env) {
      config.plugins.push(
        new webpack.ProvidePlugin({
          L: 'leaflet',
        })
      );

      return config;
    }
  ),
};
