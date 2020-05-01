import React from 'react';
import config from '../config';

const useGeolocation = ({ skip } = {}) => {
  const [latitude, setLatitude] = React.useState();
  const [longitude, setLongitude] = React.useState();

  const onSuccess = ({ coords }) => {
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  };

  const [error, setError] = React.useState(null);

  const onError = (error) => {
    setError(error.message);
  };

  React.useEffect(() => {
    if (skip) {
      return;
    }

    const geo = navigator.geolocation;

    if (!geo) {
      setError('Geolocation is not supported');
      return;
    }

    geo.getCurrentPosition(onSuccess, onError);
  }, [skip]);

  const geolocation = React.useMemo(() => {
    if (!latitude) {
      return config.fallbackLocation;
    }

    return { lat: latitude, lng: longitude };
  }, [latitude, longitude]);

  console.log(geolocation);

  return {
    geolocation,
    error,
  };
};

export default useGeolocation;
