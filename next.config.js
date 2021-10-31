module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // images: {
  //   loader: 'imgix',
  //   path: 'https://noop/',
  // },
  experimental: {
    nftTracing: true,
  },

  // swcMinify: true, .. emotion transform is not working with swc yet
};
