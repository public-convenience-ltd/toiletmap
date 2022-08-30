import React from 'react';
import L, { LatLngLiteral, Map } from 'leaflet';
import { fitMapBoundsToUserLocationNeighbouringTiles } from '../../lib/loo';

const LocationMarker = L.Marker.extend({
  initialize: function (latlng, options) {
    L.Util.setOptions(this, options);
    // eslint-disable-next-line functional/immutable-data
    this._latlng = latlng;
    this.createIcon();
  },

  _getIcon: function (options: { radius: number; weight: number }, style) {
    const { radius, weight } = options;
    const realRadius = radius + weight;
    const diameter = realRadius * 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" version="1.1" viewBox="-${realRadius} -${realRadius} ${diameter} ${diameter}"><circle r="${radius}" style="${style}" /></svg>`;

    return L.divIcon({
      className: 'leaflet-control-locate-location',
      html: svg,
      iconSize: [diameter, diameter],
    });
  },

  createIcon: function () {
    let style = '';

    const styleOptions = {
      color: 'stroke',
      weight: 'stroke-width',
      fillColor: 'fill',
      fillOpacity: 'fill-opacity',
      opacity: 'opacity',
    };

    // convert style options to css string
    Object.entries(styleOptions).forEach(([option, property]) => {
      if (this.options[option]) {
        style = style + `${property}: ${this.options[option]};`;
      }
    });

    const icon = this._getIcon(this.options, style);
    this.setIcon(icon);
  },
});

interface UseLocateMapControlProps {
  onLocationFound: (
    event: { latitude: number; longitude: number } | LatLngLiteral
  ) => void;
  onStopLocation: () => void;
  map: Map;
}

export interface UseLocateMapControl {
  startLocate: () => void;
  stopLocate: () => void;
  isActive: boolean;
}

const useLocateMapControl = ({
  onLocationFound,
  onStopLocation,
  map,
}: UseLocateMapControlProps): UseLocateMapControl => {
  const layerRef = React.useRef(null);
  React.useEffect(() => {
    if (typeof map !== 'undefined') {
      // eslint-disable-next-line functional/immutable-data
      layerRef.current = new L.LayerGroup();
      layerRef.current.addTo(map);
    }
  }, [map]);

  const handleLocationFound = React.useCallback(
    (event: { accuracy: number; latlng: LatLngLiteral }) => {
      const radius = event.accuracy || 0;
      const latlng = event.latlng;

      L.circle(latlng, radius, {
        color: '#136AEC',
        fillColor: '#136AEC',
        fillOpacity: 0.15,
        weight: 0,
      }).addTo(layerRef.current);

      new LocationMarker(latlng, {
        color: '#fff',
        fillColor: '#2A93EE',
        fillOpacity: 1,
        weight: 3,
        opacity: 1,
        radius: 9,
      }).addTo(layerRef.current);

      //find neighbouring tiles of the user's location and set the map bounds to fit them
      fitMapBoundsToUserLocationNeighbouringTiles(latlng, map);

      setIsActive(true);
      onLocationFound(event);
    },
    [onLocationFound, map]
  );

  React.useEffect(() => {
    if (typeof map !== 'undefined') {
      map.on('locationfound', handleLocationFound);
      return () => map.off('locationfound', handleLocationFound);
    }
  }, [map, handleLocationFound]);

  const [isActive, setIsActive] = React.useState(false);

  const startLocate = React.useCallback(() => {
    if (isActive) {
      map.stopLocate();
      layerRef.current.clearLayers();
    }
    map.locate({ setView: true });
  }, [isActive, map]);

  const stopLocate = React.useCallback(() => {
    map.stopLocate();
    layerRef.current.clearLayers();
    setIsActive(false);
    onStopLocation();
  }, [map, onStopLocation]);

  return { startLocate, stopLocate, isActive };
};

export default useLocateMapControl;
