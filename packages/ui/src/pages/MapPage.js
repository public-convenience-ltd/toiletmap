import React from 'react';

import { withRouter } from 'react-router-dom';

import HomePage from './HomePage';

const MapPage = function(props) {
  const pos = {
    lat: props.match.params.lat,
    lng: props.match.params.lng,
  };

  return <HomePage auth={props.auth} initialPosition={pos} />;
};

export default withRouter(MapPage);
