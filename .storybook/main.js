// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

// eslint-disable-next-line functional/immutable-data
module.exports = {
  stories: ['../src'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-postcss',
    '@storybook/addon-mdx-gfm',
    'storybook-addon-apollo-client',
  ],
  framework: {
    name: '@storybook/nextjs',
  },
  babel: async (options) => {
    options.presets.push('@emotion/babel-preset-css-prop');
    return options;
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.graphql$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve.alias,
          src: path.resolve(__dirname, '../src'),
        },
        fallback: {
          ...(config.resolve || {}).fallback,
          https: false,
          zlib: false,
          fs: false,
          os: false,
          stream: false,
          http: false,
        },
      },
    };
  },
  docsPage: {
    docs: 'automatic',
  },
  staticDirs: ['../public'],
};
