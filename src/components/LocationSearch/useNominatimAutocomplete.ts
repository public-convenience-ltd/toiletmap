import React from 'react';
import debounce from 'lodash/debounce';

const useNominatimAutocomplete = (input: string | any[]) => {
  const [places, setPlaces] = React.useState([]);

  const fetchPlaces = debounce(async (input) => {
    const fetchUrl = `https://nominatim.openstreetmap.org/search?q=${input}&countrycodes=gb&limit=5&format=json`;

    const response = await fetch(fetchUrl);
    const results = await response.json();

    if (!results) {
      return;
    }

    const locationResults = results.map(
      (item: { place_id: any; display_name: any; lat: any; lon: any }) => ({
        id: item.place_id,
        label: item.display_name,
        location: {
          lat: item.lat,
          lng: item.lon,
        },
      })
    );

    setPlaces(locationResults);
  }, 300);

  // Fetch places when input changes
  React.useEffect(() => {
    if (input.length < 3) {
      return;
    }

    fetchPlaces(input);
  }, [input, fetchPlaces]);

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
