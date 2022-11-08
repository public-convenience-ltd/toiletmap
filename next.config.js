// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withSentryConfig } = require('@sentry/nextjs');
/**
 * @type {import('next').NextConfig}
 **/
const moduleExports = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  compiler: {
    ...(process.env.VERCEL_ENV === 'production'
      ? {
          removeConsole: {
            exclude: ['error'],
          },
        }
      : {}),
  },
  pageExtensions: ['page.tsx', 'page.ts'],
  async rewrites() {
    return [
      // Map lng-lat routes to a single page
      {
        source: '/map/:lng/:lat',
        destination: '/map',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/explorer',
        destination: 'https://explorer.toiletmap.org.uk/',
        permanent: false,
      },
    ];
  },
  webpack: (config, {}) => {
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...config.module.rules,
          {
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
          },
        ],
      },
    };
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.

  // Want to stop sentry reports from preview environments?
  dryRun: process.env.VERCEL_ENV !== 'production',
};

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')([
  '@react-leaflet/core',
  'react-leaflet',
  'leaflet',
  'leaflet.markercluster',
  '@chakra-ui/react',
  '@chakra-ui/transition',
  '@chakra-ui/form-control',
  '@chakra-ui/color-mode',
  '@chakra-ui/icon',
  '@chakra-ui/layout',
  '@chakra-ui/tooltip',
  '@chakra-ui/popper',
  '@chakra-ui/portal',
  '@chakra-ui/styled-system',
  '@chakra-ui/system',
  '@chakra-ui/media-query',
  '@popperjs/core',
  '@chakra-ui/css-reset',
  '@chakra-ui/anatomy',
  '@chakra-ui/theme',
  '@design-systems/utils',
  '@chakra-ui/alert',
  '@chakra-ui/toast',
  '@chakra-ui/dom-utils',
  '@chakra-ui/utils',
  '@chakra-ui/popover',
  'downshift',
  'polished',
]);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNextAnalyser = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
// eslint-disable-next-line functional/immutable-data
module.exports = withSentryConfig(
  withTM(withNextAnalyser(moduleExports)),
  sentryWebpackPluginOptions
);
