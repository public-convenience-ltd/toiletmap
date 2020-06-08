import React from 'react';
import Chloropleth from './Chloropleth';

const USE_STAT = 'activeLoos';

function Map(props) {
  return <Chloropleth width={500} height={750} stat={USE_STAT} />;
}

export default Map;
