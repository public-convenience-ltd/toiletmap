import React from 'react';
import L, { Map, LocationEvent, LayerGroup, LatLngExpression } from 'leaflet';
import { fitMapBoundsToUserLocationNeighbouringTiles } from '../../lib/loo';

interface LocationMarkerOptions extends L.MarkerOptions {
  color?: string;
  fillColor?: string;
  fillOpacity?: number;
  opacity?: number;
  weight?: number;
  radius?: number;
}

class LocationMarker extends L.Marker {
  options: LocationMarkerOptions;

  constructor(latlng: LatLngExpression, options: LocationMarkerOptions) {
    super(latlng, options);
    L.Util.setOptions(this, options);
    this.createIcon();
  }

  private _getIcon(options: LocationMarkerOptions, style: string): L.DivIcon {
    const radius = options.radius ?? 0;
    const weight = options.weight ?? 0;
    const realRadius = radius + weight;
    const diameter = realRadius * 2;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}" version="1.1" viewBox="-${realRadius} -${realRadius} ${diameter} ${diameter}"><circle r="${radius}" style="${style}" /></svg>`;

    return L.divIcon({
      className: 'leaflet-control-locate-location',
      html: svg,
      iconSize: [diameter, diameter],
    });
  }

  private createIcon() {
    let style = '';

    const styleOptions: { [key: string]: string } = {
      color: 'stroke',
      weight: 'stroke-width',
      fillColor: 'fill',
      fillOpacity: 'fill-opacity',
      opacity: 'opacity',
    };

    Object.entries(styleOptions).forEach(([option, property]) => {
      const value = this.options[option as keyof LocationMarkerOptions];
      if (value !== undefined) {
        style += `${property}: ${value};`;
      }
    });

    const icon = this._getIcon(this.options, style);
    this.setIcon(icon);
  }
}

interface UseLocateMapControlProps {
  onLocationFound: (event: { latitude: number; longitude: number }) => void;
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
  const layerRef = React.useRef<LayerGroup | null>(null);
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (map) {
      layerRef.current = new L.LayerGroup();
      layerRef.current.addTo(map);
    }
  }, [map]);

  const handleLocationFound = React.useCallback(
    (event: LocationEvent) => {
      const radius = event.accuracy || 0;
      const latlng = event.latlng;

      L.circle(latlng, {
        radius,
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

      // Find neighbouring tiles of the user's location and set the map bounds to fit them
      fitMapBoundsToUserLocationNeighbouringTiles(latlng, map);

      setIsActive(true);
      onLocationFound({ latitude: latlng.lat, longitude: latlng.lng });
    },
    [onLocationFound, map],
  );

  React.useEffect(() => {
    if (map) {
      map.on('locationfound', handleLocationFound);
      return () => {
        map.off('locationfound', handleLocationFound);
      };
    }
  }, [map, handleLocationFound]);

  const startLocate = React.useCallback(() => {
    if (isActive) {
      map.stopLocate();
      layerRef.current?.clearLayers();
    }
    map.locate({ setView: true });
  }, [isActive, map]);

  const stopLocate = React.useCallback(() => {
    map.stopLocate();
    layerRef.current?.clearLayers();
    setIsActive(false);
    onStopLocation();
  }, [map, onStopLocation]);

  return { startLocate, stopLocate, isActive };
};

export default useLocateMapControl;
