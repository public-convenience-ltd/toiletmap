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

    const getGeolocation = (options = {}) => {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    };

    // Cordova environment expects us to wait for `deviceready`.
    // If the geolocation request is fired too early we get an ugly message.
    // http://stackoverflow.com/questions/28891339/fix-cordova-geolocation-ask-for-location-message
    if (window.cordova) {
      document.addEventListener(
        'deviceready',
        () =>
          getGeolocation({
            // We need a timeout here for android.
            // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/#android-quirks
            timeout: 5000,
          }),
        false
      );
      return;
    }

    getGeolocation();
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
