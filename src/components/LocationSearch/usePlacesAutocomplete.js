import React from 'react';
import debounce from 'lodash/debounce';

const usePlacesAutocompleteService = () => {
  const autocompleteService = React.useRef();

  React.useEffect(() => {
    if (!window.google || !window.google.maps.places) {
      return;
    }

    if (autocompleteService.current) {
      return;
    }

    autocompleteService.current = new window.google.maps.places.AutocompleteService();
  });

  return autocompleteService;
};

// Session token batches autocomplete results together to reduce Google Maps API costs
// https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
const usePlacesSessionToken = () => {
  const [token, setToken] = React.useState(null);

  const reset = () => {
    setToken(new window.google.maps.places.AutocompleteSessionToken());
  };

  React.useEffect(() => {
    if (!window.google || !window.google.maps.places) {
      return;
    }

    if (token) {
      return;
    }

    reset();
  });

  return [token, reset];
};

const usePlacesAutocomplete = (input) => {
  const autocompleteService = usePlacesAutocompleteService();

  const [sessionToken, resetSessionToken] = usePlacesSessionToken();

  const [places, setPlaces] = React.useState([]);

  const fetchPlaces = React.useCallback(
    debounce((input) => {
      const onFetchCompleted = (places) => {
        if (!places) {
          return;
        }

        const locationResults = places.map((item) => ({
          id: item.id,
          placeId: item.place_id,
          label: item.structured_formatting.main_text,
          subLabel: item.structured_formatting.secondary_text,
        }));

        setPlaces(locationResults);
      };

      autocompleteService.current.getPlacePredictions(
        { input, types: ['geocode'], sessionToken },
        onFetchCompleted
      );
    }, 300),
    [sessionToken]
  );

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

  const getPlaceById = (placeId) => {
    const geocoder = new window.google.maps.Geocoder();
    const OK = window.google.maps.GeocoderStatus.OK;

    // Create a new session token when session has completed
    // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteSessionToken
    resetSessionToken();

    return new Promise((resolve, reject) => {
      geocoder.geocode({ placeId }, (results, status) => {
        if (status !== OK) {
          reject(status);
        }
        resolve(results);
      });
    });
  };

  return { places, getPlaceById };
};

export default usePlacesAutocomplete;
