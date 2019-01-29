import React from 'react';
import PropTypes from 'prop-types';
import { Parser, ProcessNodeDefinitions } from 'html-to-react';
import { StaticRouter } from 'react-router';

import ComponentPreview from '../ComponentPreview';

const isValidNode = () => true;
const isCodeExample = ({ name = '' } = {}) => name === 'pre';

const parser = new Parser();
const processNodeDefinitions = new ProcessNodeDefinitions(React);
const getHtmlCode = children => children[0].children[0].data;

const ExampleNodeProcessor = ({ children }) =>
  React.createElement(ComponentPreview, { code: getHtmlCode(children) });

const processingInstructions = [
  {
    shouldProcessNode: isCodeExample,
    processNode: ExampleNodeProcessor,
  },
  {
    shouldProcessNode: isValidNode,
    processNode: processNodeDefinitions.processDefaultNode,
  },
];

class Example extends React.Component {
  render() {
    const html = parser.parseWithInstructions(
      this.props.html,
      isValidNode,
      processingInstructions
    );

    return (
      <StaticRouter context={{}}>
        <div>{React.Children.toArray(html)}</div>
      </StaticRouter>
    );
  }
}

Example.propTypes = {
  html: PropTypes.string.isRequired,
};

export default Example;
