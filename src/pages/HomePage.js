import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useParams, useRouteMatch } from 'react-router-dom';
import queryString from 'query-string';
import { Helmet } from 'react-helmet';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';
import Box from '../components/Box';
import ToiletDetailsPanel from '../components/ToiletDetailsPanel';
import Sidebar from '../components/Sidebar';
import Notification from '../components/Notification';
import VisuallyHidden from '../components/VisuallyHidden';

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

  const { message } = queryString.parse(props.location.search);

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  // restrict the results to only those toilets which pass all of our filter requirements
  const toilets = toiletData.filter((toilet) =>
    applied.every((filter) => {
      const value = toilet[filter.id];

      if (value === null) {
        return false;
      }

      return !!value;
    })
  );

  const isLooPage = useRouteMatch('/loos/:id');

  const [shouldCenter, setShouldCenter] = React.useState(isLooPage);

  // set initial map center to toilet if on /loos/:id
  React.useEffect(() => {
    if (shouldCenter && data) {
      setMapPosition({
        center: data.loo.location,
      });

      // don't recenter the map each time the id changes
      setShouldCenter(false);
    }
  }, [data, shouldCenter, setMapPosition]);

  // set the map position if initialPosition prop exists
  React.useEffect(() => {
    if (initialPosition) {
      setMapPosition({
        center: initialPosition,
      });
    }
  }, [initialPosition, setMapPosition]);

  const [toiletPanelDimensions, setToiletPanelDimensions] = React.useState({});

  const pageTitle = config.getTitle(
    isLooPage && data ? data.loo.name || 'Unnamed Toilet' : 'Find Toilet'
  );

  return (
    <PageLayout mapCenter={mapPosition.center}>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <VisuallyHidden>
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <Box height="100%" display="flex" position="relative">
        <LooMap
          loos={toilets.map((toilet) => {
            if (toilet.id === selectedLooId) {
              return {
                ...toilet,
                isHighlighted: true,
              };
            }
            return toilet;
          })}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          onViewportChanged={setMapPosition}
          controlsOffset={toiletPanelDimensions.height}
        />

        <Sidebar
          filters={filters}
          onFilterChange={setFilters}
          onSelectedItemChange={(center) => setMapPosition({ center })}
          onUpdateMapPosition={setMapPosition}
          mapCenter={mapPosition.center}
        />

        {Boolean(selectedLooId) && data && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel
              data={data.loo}
              isLoading={loading}
              startExpanded={!!message}
              onDimensionsChange={setToiletPanelDimensions}
            >
              {config.messages[message] && (
                <Box
                  position="absolute"
                  left={0}
                  right={0}
                  bottom={0}
                  display="flex"
                  justifyContent="center"
                  p={4}
                  pt={1}
                  pb={[4, 3, 4]}
                  bg={['white', 'white', 'transparent']}
                >
                  <Notification
                    allowClose
                    children={config.messages[message]}
                  />
                </Box>
              )}
            </ToiletDetailsPanel>
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
