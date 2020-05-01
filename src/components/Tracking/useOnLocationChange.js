import React from 'react';
import { useLocation } from 'react-router-dom';

const useOnLocationChange = (callback) => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    callback(pathname);
  }, [pathname, callback]);
};

export default useOnLocationChange;
