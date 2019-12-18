const lowerFirst = str => str[0].toLowerCase() + str.slice(1);
const namespaceProps = (prefix, props) => {
  const newProps = {};
  Object.keys(props).forEach(propName => {
    const propValue = props[propName];

    // If the prop looks like a namespace-able prop
    if (propName !== prefix && propName.startsWith(prefix)) {
      const withoutPrefix = propName.slice(prefix.length);

      propName = `${prefix}:${lowerFirst(withoutPrefix)}`;
    }

    newProps[propName] = propValue;
  });

  return newProps;
};

module.exports = namespaceProps;
