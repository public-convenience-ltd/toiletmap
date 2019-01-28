const path = require('path');
const appRootDir = require('app-root-dir').get();

module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: path.join(appRootDir, 'src/components'),
        name: 'components',
      },
    },
    {
      resolve: 'gatsby-transformer-react-docgen',
    },
    {
      resolve: 'gatsby-transformer-remark',
    },
  ],
};
