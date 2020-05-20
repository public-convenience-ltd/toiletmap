import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useParams, useRouteMatch } from 'react-router-dom';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';

import { Media } from '../components/Media';
import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';
import Box from '../components/Box';
import ToiletDetailsPanel from '../components/ToiletDetailsPanel';
import LocationSearch from '../components/LocationSearch';
import Button from '../components/Button';
import Drawer from '../components/Drawer';
import Filters from '../components/Filters';
import Text from '../components/Text';
import Sidebar from '../components/Sidebar';

import config, { FILTERS_KEY } from '../config';

const FIND_BY_ID = loader('./findLooById.graphql');

const HomePage = ({ initialPosition, ...props }) => {
  const [mapPosition, setMapPosition] = useMapPosition(config.fallbackLocation);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const filterToggleRef = useRef(null);

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

  return (
    <PageLayout>
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

        <section>
          <Box
            as={Media}
            lessThan="md"
            position="absolute"
            top={0}
            left={0}
            p={3}
            width="100%"
          >
            <LocationSearch
              onSelectedItemChange={(center) => setMapPosition({ center })}
            />

            <Box display="flex" justifyContent="center" mt={3}>
              <Button
                ref={filterToggleRef}
                variant="secondary"
                icon={<FontAwesomeIcon icon={faFilter} />}
                aria-expanded={isFiltersExpanded}
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                Filter Map
              </Button>
            </Box>

            <Drawer visible={isFiltersExpanded} animateFrom="left">
              <Box display="flex" justifyContent="space-between" mb={4}>
                <Box display="flex" alignItems="flex-end">
                  <FontAwesomeIcon icon={faFilter} fixedWidth size="lg" />
                  <Box as="h2" mx={2}>
                    <Text lineHeight={1}>
                      <b>Filter</b>
                    </Text>
                  </Box>
                </Box>

                <Text fontSize={12}>
                  <Box
                    as="button"
                    type="button"
                    onClick={() => setFilters({})}
                    border={0}
                    borderBottom={2}
                    borderStyle="solid"
                  >
                    Reset Filter
                  </Box>
                </Text>
              </Box>

              <Filters filters={filters} onFilterChange={setFilters} />

              <Box display="flex" justifyContent="center" mt={4}>
                <Button
                  onClick={() => {
                    setIsFiltersExpanded(false);

                    // return focus to the control that invoked the filter overlay
                    filterToggleRef.current.focus();
                  }}
                  css={{
                    width: '100%',
                  }}
                >
                  Done
                </Button>
              </Box>
            </Drawer>
          </Box>

          <Media greaterThan="sm">
            <Sidebar
              filters={filters}
              onFilterChange={setFilters}
              onSelectedItemChange={(center) => setMapPosition({ center })}
            />
          </Media>
        </section>

        {Boolean(selectedLooId) && (
          <Box
            position="absolute"
            left={0}
            bottom={0}
            width="100%"
            zIndex={100}
          >
            <ToiletDetailsPanel
              data={data && data.loo}
              isLoading={loading}
              onDimensionsChange={setToiletPanelDimensions}
            />
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
