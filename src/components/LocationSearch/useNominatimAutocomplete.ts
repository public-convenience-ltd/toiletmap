import React from 'react';
import debounce from 'lodash/debounce';

type NominatimResult = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
};

export type Place = {
  id: string;
  label: string;
  location: {
    lat: string;
    lng: string;
  };
};

type Coordinates = {
  lat: number;
  lng: number;
};

const useNominatimAutocomplete = (input: string) => {
  const [places, setPlaces] = React.useState<Place[]>([]);

  const fetchHandler = async (input: string) => {
    try {
      const fetchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        input,
      )}&countrycodes=gb&limit=5&format=json`;

      const response = await fetch(fetchUrl);
      const results: NominatimResult[] = await response.json();

      if (!results) {
        return;
      }

      const locationResults: Place[] = results.map((item) => ({
        id: item.place_id,
        label: item.display_name,
        location: {
          lat: item.lat,
          lng: item.lon,
        },
      }));

      setPlaces(locationResults);
    } catch (e: unknown) {
      console.error('Problem fetching location info: ', e);
    }
  };

  const debouncedFetchHandler = React.useMemo(
    () => debounce(fetchHandler, 300),
    [],
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
  }, [input]);

  const getPlaceLatLng = (place: Place): Coordinates => {
    return {
      lat: parseFloat(place.location.lat),
      lng: parseFloat(place.location.lng),
    };
  };

  return { places, getPlaceLatLng };
};

export default useNominatimAutocomplete;
