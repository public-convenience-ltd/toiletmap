export const typescript = {
  // !! WARN !!
  // Dangerously allow production builds to successfully complete even if
  // your project has type errors.
  // !! WARN !!
  ignoreBuildErrors: true,
};
export async function rewrites() {
  return [
    // Map lng-lat routes to a single page
    {
      source: '/map/:lng/:lat',
      destination: '/map',
    },
  ];
}
export function webpack(config, {}) {
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
}
