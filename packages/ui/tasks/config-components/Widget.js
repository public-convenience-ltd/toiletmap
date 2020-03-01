const React = require('react');

const namespaceProps = require('./namespaceProps');

module.exports = props => <widget {...namespaceProps('xmlns', props)} />;
