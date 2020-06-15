module.exports = function (api) {
  api.cache(true);

  const plugins = ['emotion', 'graphql-tag', 'import-graphql'];
  const presets = ['next/babel'];

  return { plugins, presets };
};
