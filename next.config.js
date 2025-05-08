/**
 * @type {import('next').NextConfig}
 **/
const moduleExports = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'avatars.githubusercontent.com' },
      { hostname: 'rca-media2.rca.ac.uk' },
      { hostname: 'toiletmap.org.uk' },
    ],
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

// https://plausible.io/docs/proxy/guides/nextjs
const { withPlausibleProxy } = require('next-plausible');

const { withContentCollections } = require('@content-collections/next');

module.exports = withContentCollections(withPlausibleProxy()(moduleExports));
