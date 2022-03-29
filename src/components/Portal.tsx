import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const Portal: React.FC<{ selector?: string; children: ReactNode }> = (
  props
) => {
  // https://github.com/facebook/react/issues/13097#issuecomment-405658104
  const [isMounted, setIsMounted] = React.useState(false);

  const element =
    typeof document !== 'undefined' && document.querySelector(props.selector);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (element && isMounted) {
    return ReactDOM.createPortal(props.children, element);
  }

  return null;
};

// eslint-disable-next-line functional/immutable-data
Portal.propTypes = {
  /** query selector to determine where to mount the Portal */
  selector: PropTypes.string,
  children: PropTypes.node,
};

// eslint-disable-next-line functional/immutable-data
Portal.defaultProps = {
  selector: 'body',
};

export default Portal;
