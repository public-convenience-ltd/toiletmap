import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

interface PortalProps {
  selector?: string;
  children: ReactNode;
}

const Portal: React.FC<PortalProps> = ({ selector = 'body', children }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  const element =
    typeof document !== 'undefined' && document.querySelector(selector);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (element && isMounted) {
    return ReactDOM.createPortal(children, element);
  }

  return null;
};

Portal.propTypes = {
  /** Query selector to determine where to mount the Portal */
  selector: PropTypes.string,
  children: PropTypes.node,
};

export default Portal;
