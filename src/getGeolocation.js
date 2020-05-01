const getGeolocation = (onComplete, onError) => {
  if (!('geolocation' in navigator)) {
    let msg = 'Geolocation not available';
    console.error(msg);
    if (onError) onError(Error(msg));
    return;
  }

  const getPos = () => {
    navigator.geolocation.getCurrentPosition(onComplete, (error) => {
      console.error('Could not find geolocation:', error);
      if (onError) onError(error);
    });
  };

  getPos();
};

export default getGeolocation;
