const getGeolocation = (onComplete, onError) => {
  const getPos = () => {
    navigator.geolocation.getCurrentPosition(onComplete, error => {
      console.error('Could not find geolocation:', error);
      onError(error);
    });
  };

  // Cordova environment expects us to wait for `deviceready`. If the geolocation
  // request is fired too early we get an ugly message.
  // http://stackoverflow.com/questions/28891339/fix-cordova-geolocation-ask-for-location-message
  if (window.cordova) {
    document.addEventListener('deviceready', getPos, false);
  } else {
    getPos();
  }
};

export default getGeolocation;
