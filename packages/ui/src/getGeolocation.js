const getGeolocation = (onComplete, onError) => {
  if (!('geolocation' in navigator)) {
    let msg = 'Geolocation not available';
    console.error(msg);
    if (onError) onError(Error(msg));
    return;
  }

  const getPos = doTimeout => {
    navigator.geolocation.getCurrentPosition(
      onComplete,
      error => {
        console.error('Could not find geolocation:', error);
        if (onError) onError(error);
      },
      {
        // We need a timeout here for android https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-geolocation/#android-quirks
        timeout: doTimeout ? 5000 : 0,
      }
    );
  };

  // Cordova environment expects us to wait for `deviceready`. If the geolocation
  // request is fired too early we get an ugly message.
  // http://stackoverflow.com/questions/28891339/fix-cordova-geolocation-ask-for-location-message
  if (window.cordova) {
    document.addEventListener('deviceready', () => getPos(true), false);
  } else {
    getPos(false);
  }
};

export default getGeolocation;
