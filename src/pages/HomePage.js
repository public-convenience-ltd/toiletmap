import React from 'react';
import PropTypes from 'prop-types';
import { useParams, useRouteMatch } from 'react-router-dom';
import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

import config from '../config';
import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';
import Box from '../components/Box';
import ToiletDetailsPanel from '../components/ToiletDetailsPanel';

const FIND_BY_ID = loader('./findLooById.graphql');

const HomePage = ({ initialPosition, ...props }) => {
  const [mapPosition, setMapPosition] = useMapPosition(config.fallbackLocation);

  const { data: loos } = useNearbyLoos({
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

  return (
    <PageLayout onSelectedItemChange={(center) => setMapPosition({ center })}>
      <Box height="100%" display="flex" position="relative">
        <LooMap
          loos={loos.map((loo) => {
            if (loo.id === selectedLooId) {
              return {
                ...loo,
                isHighlighted: true,
              };
            }
            return loo;
          })}
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
