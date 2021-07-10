import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const Portal = (props: { selector: any; children: any; }) => {
  // https://github.com/facebook/react/issues/13097#issuecomment-405658104
  const [isMounted, setIsMounted] = React.useState(false);

  const element = (typeof document !== 'undefined') && document.querySelector(props.selector);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (element && isMounted) {
    return ReactDOM.createPortal(props.children, element);
  }

  return null;
};

Portal.propTypes = {
  /** query selector to determine where to mount the Portal */
  selector: PropTypes.string,
  children: PropTypes.node,
};

Portal.defaultProps = {
  selector: 'body',
};

export default Portal;
