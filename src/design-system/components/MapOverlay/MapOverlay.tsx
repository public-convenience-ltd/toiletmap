import React from 'react';

type MapOverlayProps = { children: React.ReactNode };

const MapOverlay: React.FC<MapOverlayProps> = ({ children }) => {
  return <div className="map-overlay">{children}</div>;
};

MapOverlay.displayName = 'MapOverlay';

export default MapOverlay;
