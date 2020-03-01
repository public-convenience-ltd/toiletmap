const React = require('react');

const filterDeps = dependencies =>
  Object.keys(dependencies)
    .filter(depName => depName.startsWith('cordova-plugin'))
    .map(dep => [dep, dependencies[dep]]);

module.exports = ({ dependencies = {}, config = {} }) =>
  filterDeps(dependencies).map(([dep, version]) => {
    const variables = config.plugins[dep] || {};

    return (
      <plugin name={dep} spec={version}>
        {Object.keys(variables).map(variable => (
          <variable
            name={variable}
            value={variables[variable]}
            key={variable}
          />
        ))}
      </plugin>
    );
  });
