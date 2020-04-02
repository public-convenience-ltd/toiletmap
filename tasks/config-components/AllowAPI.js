const React = require('react');

const singleJoiningSlash = (a, b) => {
  const aSlash = a.endsWith('/');
  const bSlash = b.startsWith('/');

  if (aSlash && bSlash) {
    return a + b.slice(1);
  }

  if (!aSlash && !bSlash) {
    return `${a}/${b}`;
  }

  return a + b;
};

module.exports = ({ api }) => {
  if (!api) {
    return null;
  }

  return <allow-intent href={singleJoiningSlash(api, '*')} />;
};
