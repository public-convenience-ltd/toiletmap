import { useState, useEffect } from 'react';

const useGeolocation = () => {
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  const onSuccess = ({ coords }) => {
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  };

  const [error, setError] = useState(null);

  const onError = (error) => {
    setError(error.message);
  };

  useEffect(() => {
    const geo = navigator.geolocation;

    if (!geo) {
      setError('Geolocation is not supported');
      return;
    }

    geo.getCurrentPosition(onSuccess, onError);
  }, []);

  return {
    geolocation: {
      latitude,
      longitude,
    },
    error,
  };
};

export default useGeolocation;
