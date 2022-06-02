// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
// eslint-disable-next-line functional/immutable-data
module.exports = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  pageExtensions: ['page.tsx', 'page.ts'],
  async rewrites() {
    return [
      // Map lng-lat routes to a single page
      {
        source: '/map/:lng/:lat',
        destination: '/map',
      },
      {
        source: '/explorer',
        destination: 'https://explorer.toiletmap.org.uk/',
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
