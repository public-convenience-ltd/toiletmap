module.exports = {
    webpack: (config, { isServer }) => {
      // config.module.rules.push({
      //   test: /\.(graphql|gql)$/,
      //   exclude: /node_modules/,
      //   loader: 'graphql-tag/loader',
      // });
      return config;
    },
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:4000/:path*' // Proxy to Backend
        }
      ]
    }
  }
