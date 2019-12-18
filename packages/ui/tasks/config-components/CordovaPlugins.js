const React = require('react');

const filterDeps = dependencies =>
  Object.keys(dependencies)
    .filter(depName => depName.startsWith('cordova-plugin'))
    .map(dep => [dep, dependencies[dep]]);

module.exports = ({ dependencies }) =>
  filterDeps(dependencies).map(([dep, version]) => (
    <plugin name={dep} spec={version} />
  ));
