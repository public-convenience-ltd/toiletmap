import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';
import Box from '../components/Box';
import ToiletDetailsPanel from '../components/ToiletDetailsPanel';

import config, { FILTERS_KEY } from '../config';

const FIND_BY_ID = loader('./findLooById.graphql');

const HomePage = ({ initialPosition, ...props }) => {
  const [mapPosition, setMapPosition] = useMapPosition(config.fallbackLocation);

  let initialState = config.getSettings(FILTERS_KEY);

  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialState[filter.id] = initialState[filter.id] || false;
  });

  const [filters, setFilters] = useState(initialState);

  // keep local storage and state in sync
  React.useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  React.useEffect(() => {
    // Set the map position if initialPosition prop exists
    if (initialPosition) {
      setMapPosition({
        center: initialPosition,
      });
    }
  }, [initialPosition, setMapPosition]);

  const { data: toiletData } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: Math.ceil(mapPosition.radius),
    },
  });

  const selectedLooId = useParams().id;

  const { data, loading } = useQuery(FIND_BY_ID, {
    variables: {
      id: selectedLooId,
      skip: !selectedLooId,
    },
  });

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  // restrict the results to only those toilets which pass all of our filter requirements
  const toilets = toiletData.filter((toilet) =>
    applied.every((filter) => {
      const field = filter.field || filter.id;
      const value = toilet[field];

      if (field === 'fee') {
        return !value;
      }

      if (value === null) {
        return false;
      }

      switch (field) {
        case 'type':
          return value === 'UNISEX';

        case 'accessibleType':
          return value !== 'NONE';

        default:
          return !!value;
      }
    })
  );

  return (
    <PageLayout
      filters={filters}
      onFilterChange={setFilters}
      onSelectedItemChange={(center) => setMapPosition({ center })}
    >
      <Box height="100%" display="flex" position="relative">
        <LooMap
          loos={toilets}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          onViewportChanged={setMapPosition}
          onSearchSelectedItemChange={setMapPosition}
          showContributor
          showSearchControl
          showLocateControl
        />
        {Boolean(selectedLooId) && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel data={data && data.loo} isLoading={loading} />
          </Box>
        )}
      </Box>
    </PageLayout>
  );
};

HomePage.propTypes = {
  initialPosition: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
};

export default HomePage;
