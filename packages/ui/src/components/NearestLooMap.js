import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import uniqBy from 'lodash/uniqBy';

import LooMap from './LooMap';

import { useQuery, gql, useMutation } from '@apollo/client';
import { loader } from 'graphql.macro';

import getGeolocation from '../getGeolocation';
import Notification from './Notification';
import config from '../config';

import styles from './css/loo-map.module.css';

const FIND_LOOS_NEARBY = loader('./findLoosNearby.graphql');

const GET_MAP_CONTROLS = gql`
  {
    mapZoom @client
    mapCenter @client {
      lat
      lng
    }
    mapRadius @client
    viewMap @client
  }
`;

const SET_MAP_CENTER = gql`
  mutation SetMapCenter($lat: Number!, $lng: Number!, $radius: Number!) {
    updateCenter(lat: $lat, lng: $lng) @client
    updateRadius(radius: $radius) @client
  }
`;

const SET_MAP_ZOOM = gql`
  mutation SetMapZoom($zoom: Number!) {
    updateZoom(zoom: $zoom) @client
  }
`;

const NearestLooMap = function NearestLooMap(props) {
  const [geolocation, setGeolocation] = useState();
  // Local zoom is used to make sure that zooming doesn't ping back to where it came
  // from, which used to happen because it wasn't being updated from the local apollo
  // cache quick enough (probably).
  const [localZoom, setLocalZoom] = useState();
  let looMap;

  const { loading: loadingMapControls, data: mapControlsData } = useQuery(
    GET_MAP_CONTROLS
  );

  let mapControls = {};
  if (!loadingMapControls) {
    mapControls = {
      zoom: mapControlsData.mapZoom,
      center: mapControlsData.mapCenter,
      radius: mapControlsData.mapRadius,
      viewMap: mapControlsData.viewMap,
    };

    if (!localZoom) {
      setLocalZoom(mapControls.zoom);
    }
  }

  const loo = props.activeLoo;

  const looCentre = loo
    ? {
        ...loo.location,
      }
    : undefined;

  // A helper function to fire events for the map leaflet
  const updateLoadingStatus = function updateLoadingStatus(isLoading) {
    if (!looMap) return;

    if (isLoading) {
      looMap.leafletElement.fire('dataloading');
    } else {
      looMap.leafletElement.fire('dataload');
    }
  };

  // Fetch the current geolocation on rerender
  useEffect(() => {
    getGeolocation(
      (response) => {
        const { longitude, latitude } = response.coords;
        setGeolocation({ lng: longitude, lat: latitude });
      },
      (error) => {
        setGeolocation({
          error: true,
        });
      }
    );
  }, []);

  // Fetch the nearby loos
  // This uses a very hacky method of setting the location to be (0, 0) when
  // overrideLoos is set, which means that very little data will be passed
  // when the query is sent. Hopefully when the functionality of skip is fixed so that
  // when it's true a query is _never_ sent, this hack can be removed.
  const { error: loosError, loading, data, refetch } = useQuery(
    FIND_LOOS_NEARBY,
    {
      variables: {
        ...(props.overrideLoos
          ? {
              lat: 0,
              lng: 0,
              skipped: true,
            }
          : mapControls.center),
        radius: Math.ceil(
          mapControls.viewMap ? mapControls.radius : config.nearestRadius
        ),
        time: Date.now(),
      },
      skip: !!props.overrideLoos || loadingMapControls, // this doesn't actually have any effect, Apollo bug?
    }
  );

  // TODO check if still skip bug with latest beta (still is with beta 31)

  useEffect(() => {
    updateLoadingStatus(loading);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const [updateStoreCenter] = useMutation(SET_MAP_CENTER);
  function onUpdateCenter(coords, radius) {
    updateStoreCenter({
      variables: {
        ...coords,
        radius,
      },
    });

    if (props.onUpdateCenter) {
      props.onUpdateCenter(coords, radius);
    }

    if (!loading) {
      updateLoadingStatus(true);
      refetch();
    }
  }

  const [updateStoreZoom] = useMutation(SET_MAP_ZOOM);
  function onUpdateZoom(zoom) {
    setLocalZoom(zoom);
    updateStoreZoom({
      variables: {
        zoom,
      },
    });
  }

  const getInitialPosition = () => {
    // Work out what the best possible initial position is
    if (looCentre) {
      return looCentre;
    }

    if (mapControls.center.lat !== 0 && mapControls.center.lng !== 0) {
      return mapControls.center;
    }

    if (geolocation) {
      if (geolocation.error) {
        return config.fallbackLocation;
      }
      return geolocation;
    }

    return null;
  };

  // Display activeLoo on the map unless overrideLoos exist
  const getLoosToDisplay = () => {
    if (props.overrideLoos) {
      return props.overrideLoos;
    }

    const loosByProximity = data ? data.loosByProximity : [];

    if (loo) {
      return uniqBy([loo, ...loosByProximity], 'id');
    }

    return loosByProximity;
  };

  return (
    <div className={styles.map}>
      {loading && (
        <div className={styles.loading}>Fetching toilets&hellip;</div>
      )}

      {loosError && (
        <Notification>
          Oops, there was an problem finding toilets. Check your internet
          connection.
        </Notification>
      )}

      {!loadingMapControls && getInitialPosition() ? (
        <LooMap
          wrappedComponentRef={(it) => (looMap = it)}
          loos={getLoosToDisplay()}
          countLimit={props.numberNearest ? 5 : 0}
          showcontributor={true}
          showLocation={true}
          showSearchControl={true}
          showLocateControl={true}
          showCenter={true}
          onZoom={onUpdateZoom}
          onUpdateCenter={onUpdateCenter}
          initialZoom={localZoom}
          initialPosition={getInitialPosition()}
          highlight={props.highlight}
          {...props.mapProps}
        />
      ) : (
        <Notification>Finding your location&hellip;</Notification>
      )}
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
  // An optional callback
  onUpdateCenter: PropTypes.func,
  // An optional list of loos to use instead of querying the server
  overrideLoos: PropTypes.array,
  // The id of the loo to highlight
  highlight: PropTypes.string,
};

export default NearestLooMap;
