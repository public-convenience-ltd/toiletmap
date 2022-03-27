import React from 'react';
import debounce from 'lodash/debounce';

const useNominatimAutocomplete = (input: string | any[]) => {
  const [places, setPlaces] = React.useState([]);

  const fetchHandler = async (input) => {
    const fetchUrl = `https://nominatim.openstreetmap.org/search?q=${input}&countrycodes=gb&limit=5&format=json`;

    const response = await fetch(fetchUrl);
    const results = await response.json();

    if (!results) {
      return;
    }

    const locationResults = results.map(
      (item: {
        place_id: unknown;
        display_name: unknown;
        lat: unknown;
        lon: unknown;
      }) => ({
        id: item.place_id,
        label: item.display_name,
        location: {
          lat: item.lat,
          lng: item.lon,
        },
      })
    );

    setPlaces(locationResults);
  };

  const debouncedFetchHandler = React.useMemo(
    () => debounce(fetchHandler, 300),
    []
  );

  // Fetch places when input changes
  React.useEffect(() => {
    if (input.length < 3) {
      return;
    }
    debouncedFetchHandler(input);
    return () => {
      debouncedFetchHandler.cancel();
    };
  }, [debouncedFetchHandler, input]);

  // Clear places when input is cleared
  React.useEffect(() => {
    if (input) {
      return;
    }
    setPlaces([]);
  }, [input, setPlaces]);

  const getPlaceLatLng = ({ location }) => {
    return {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
    };
  };

  return { places, getPlaceLatLng };
};

export default useNominatimAutocomplete;
