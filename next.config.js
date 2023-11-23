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
  transpilePackages: [
    '@react-leaflet/core',
    'react-leaflet',
    'leaflet',
    'leaflet.markercluster',
    'downshift',
  ],
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
const withNextAnalyser = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// https://plausible.io/docs/proxy/guides/nextjs
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withPlausibleProxy } = require('next-plausible');

// eslint-disable-next-line functional/immutable-data
module.exports = withNextAnalyser(withPlausibleProxy()(moduleExports));
