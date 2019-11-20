import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import LooMap from './LooMap';
import WithApolloClient from './WithApolloClient';

import { useQuery, gql } from '@apollo/client';
import { loader } from 'graphql.macro';

import styles from './css/loo-map.module.css';

const FIND_LOOS_NEARBY = loader('./findLoosNearby.graphql');

const NearestLooMap = function NearestLooMap(props) {
  let [geolocation, setGeolocation] = useState();
  let [loos, setLoos] = useState([]);
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

  // Return map to last stored position or default to user locationon
  var position = looCentre || mapControls.center || geolocation.position;

  console.log('controls:', mapControls);

  function onUpdateCenter({ lat, lng }) {
    console.log('update centre');
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
    console.log('update zoom');
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

  // A helper function to fire events for the map leaflet
  const updateLoadingStatus = function updateLoadingStatus(isLoading) {
    if (!looMap) {
      return;
    }

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
        // onUpdateCenter(newPos); // maybe keep in?
      },
      error => console.error(error)
    );
  }, []);

  // Fetch the nearby loos
  updateLoadingStatus(true);
  useQuery(FIND_LOOS_NEARBY, {
    variables: {
      ...position,
      radius: 1500, // TODO change
    },
    onCompleted: data => {
      updateLoadingStatus(false);
      setLoos(data.loosByProximity);
    },
  });

  return (
    <div className={styles.map}>
      {!loos && <div className={styles.loading}>Fetching toilets&hellip;</div>}

      <LooMap
        wrappedComponentRef={it => (looMap = it)}
        loos={[] /*loos*/}
        countLimit={props.numberNearest ? 5 : 0}
        showcontributor={true}
        showLocation={true}
        showSearchControl={true}
        showLocateControl={true}
        showCenter={true}
        onZoom={onUpdateZoom}
        onUpdateCenter={onUpdateCenter}
        initialZoom={mapControls.zoom}
        initialPosition={position}
        highlight={mapControls.highlight}
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
