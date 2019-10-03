const webpack = require('webpack');

module.exports = {
  webpack: function(config, env) {
    config.plugins.push(
      new webpack.ProvidePlugin({
        L: 'leaflet',
      })
    );

    return config;
  },
};
