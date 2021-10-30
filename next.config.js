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
  // swcMinify: true, .. emotion transform is not working with swc yet
};
