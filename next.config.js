module.exports = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    nftTracing: true,
  },
  exportPathMap: function () {
    return {
      '/': { page: '/loos/none' },
    };
  },
  // swcMinify: true, .. emotion transform is not working with swc yet
};
