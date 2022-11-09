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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules')([
  '@react-leaflet/core',
  'react-leaflet',
  'leaflet',
  'leaflet.markercluster',
  '@popperjs/core',
  '@design-systems/utils',
  'downshift',
  'polished',
]);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withNextAnalyser = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// eslint-disable-next-line functional/immutable-data
module.exports = withTM(withNextAnalyser(moduleExports));
