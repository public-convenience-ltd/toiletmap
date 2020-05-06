const path = require('path');

module.exports = {
  require: [path.join(__dirname, 'src/css/global.js')],
  ignore: [
    'src/components/**/index.js',
    'src/components/useGeolocation.js',
    'src/components/useMapPosition.js',
    'src/components/useNearbyLoos.js',
    'src/components/Tracking/**/*.js',
  ],
};
