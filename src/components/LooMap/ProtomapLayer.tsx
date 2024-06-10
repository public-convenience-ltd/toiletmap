import { Layer } from 'leaflet';
import { leafletLayer } from 'protomaps-leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const ProtomapLayer = () => {
  const map = useMap();

  useEffect(() => {
    // @ts-expect-error -- this works in practice
    const layer: Layer = leafletLayer({
      // Free for non-commercial use https://protomaps.com/
      url: 'https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=73e8a482f059f3f5',
      theme: 'light',
    });
    // https://github.com/protomaps/protomaps-leaflet?tab=readme-ov-file#how-to-use
    layer.addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
};
