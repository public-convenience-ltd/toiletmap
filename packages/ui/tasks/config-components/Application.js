const React = require('react');
const namespaceProps = require('./namespaceProps');

const Application = props => (
  <application {...namespaceProps('android', props)} />
);

module.exports = Application;
