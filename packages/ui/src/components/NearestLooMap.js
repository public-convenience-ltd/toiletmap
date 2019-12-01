import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import LooMap from './LooMap';
import WithApolloClient from './WithApolloClient';

import { useQuery, gql } from '@apollo/client';
import { loader } from 'graphql.macro';

import styles from './css/loo-map.module.css';

const FIND_LOOS_NEARBY = loader('./findLoosNearby.graphql');

const NearestLooMap = function NearestLooMap(props) {
  const [geolocation, setGeolocation] = useState();
  const { apolloClient } = props;
  let looMap;

  let { mapControls } = apolloClient.readQuery({
    query: gql`
      query getMapControls {
        mapControls {
          zoom
          center {
            lat
            lng
          }
          highlight
        }
      }
    `,
  });

  let loo = props.loo;
  let looCentre;
  if (loo) {
    looCentre = {
      ...loo.location,
    };
  }

  // Return map to last stored position or default to user location
  const [mapCenter, setMapCenter] = useState(mapControls.center);

  // A helper function to fire events for the map leaflet
  const updateLoadingStatus = function updateLoadingStatus(isLoading) {
    if (!looMap) return;

    if (isLoading) {
      looMap.refs.map.leafletElement.fire('dataloading');
    } else {
      looMap.refs.map.leafletElement.fire('dataload');
    }
  };

  // Fetch the current geolocation on rerender
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      response => {
        const { longitude, latitude } = response.coords;
        let newPos = { lng: longitude, lat: latitude };
        setGeolocation(newPos);
      },
      error => console.error(error)
    );
  }, []);

  // Fetch the nearby loos
  updateLoadingStatus(true);
  const { loading, data, refetch } = useQuery(FIND_LOOS_NEARBY, {
    variables: {
      ...mapCenter,
      radius: 20000,
    },
    onCompleted: data => {
      updateLoadingStatus(false);
    },
  });

  function onUpdateCenter({ lat, lng }) {
    if (!loading) {
      updateLoadingStatus(true);
      refetch();
    }
    setMapCenter({ lat, lng });
    apolloClient.writeQuery({
      query: gql`
        query updateCenter {
          mapControls {
            center {
              lat
              lng
            }
          }
        }
      `,
      data: {
        mapControls: {
          center: {
            lat,
            lng,
          },
        },
      },
    });
  }

  function onUpdateZoom(zoom) {
    apolloClient.writeQuery({
      query: gql`
        query updateZoom {
          mapControls {
            zoom
          }
        }
      `,
      data: {
        mapControls: {
          zoom,
        },
      },
    });
  }

  return (
    <div className={styles.map}>
      {loading && (
        <div className={styles.loading}>Fetching toilets&hellip;</div>
      )}

      <LooMap
        wrappedComponentRef={it => (looMap = it)}
        loos={data ? data.loosByProximity : []}
        countLimit={props.numberNearest ? 5 : 0}
        showcontributor={true}
        showLocation={true}
        showSearchControl={true}
        showLocateControl={true}
        showCenter={true}
        onZoom={onUpdateZoom}
        onUpdateCenter={onUpdateCenter}
        initialZoom={mapControls.zoom}
        initialPosition={
          looCentre || mapControls.center || geolocation.position
        }
        highlight={props.highlight || mapControls.highlight}
        {...props.mapProps}
      />
    </div>
  );
};

NearestLooMap.propTypes = {
  // A loo to focus
  loo: PropTypes.object,
  // props to spread (last) over the LooMap instance
  mapProps: PropTypes.object,
  // Whether to show an index on the nearest five loos
  numberNearest: PropTypes.bool,
};

const NearestLooMapWithApolloClient = props => (
  <WithApolloClient>
    <NearestLooMap {...props} />
  </WithApolloClient>
);

export default NearestLooMapWithApolloClient;
