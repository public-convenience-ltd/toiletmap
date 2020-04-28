import React from 'react';

import { withRouter } from 'react-router-dom';

import HomePage from './HomePage';

const MapPage = (props) => {
  const pos = {
    lat: props.match.params.lat,
    lng: props.match.params.lng,
  };

  return <HomePage initialPosition={pos} />;
};

export default withRouter(MapPage);
