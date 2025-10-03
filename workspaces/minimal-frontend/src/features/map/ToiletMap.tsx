import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import type { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import ngeohash from 'ngeohash';
import { looTileCache } from '@/lib/graphqlClient';
import { dedupeLoosById } from '@/lib/looCompression';
import type { TileLoo } from '@/lib/looCompression';
import styles from './ToiletMap.module.css';

const getGeohashPrecisionForZoom = (zoom: number) => {
  switch (true) {
    case zoom < 8:
      return 2;
    case zoom < 11:
      return 3;
    case zoom < 13:
      return 4;
    default:
      return 5;
  }
};

const computeGeohashesForBounds = (
  bounds: L.LatLngBounds,
  precision: number,
) => {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  const geohashes = ngeohash.bboxes(
    southWest.lat,
    southWest.lng,
    northEast.lat,
    northEast.lng,
    precision,
  );

  return Array.from(new Set(geohashes));
};

const expandBounds = (bounds: L.LatLngBounds, paddingRatio: number) => {
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  const latDiff = northEast.lat - southWest.lat;
  const lngDiff = northEast.lng - southWest.lng;

  const latPadding = (latDiff * paddingRatio) / 2;
  const lngPadding = (lngDiff * paddingRatio) / 2;

  return L.latLngBounds(
    L.latLng(southWest.lat - latPadding, southWest.lng - lngPadding),
    L.latLng(northEast.lat + latPadding, northEast.lng + lngPadding),
  );
};

const DEFAULT_LOCATION = {
  lat: 51.505,
  lng: -0.09,
};

const configureLeafletIcons = () => {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

const createMarker = (loo: TileLoo): Marker => {
  const marker = L.marker([loo.location.lat, loo.location.lng], {
    title: 'Public toilet',
  });
  const features = [
    loo.accessible ? 'Accessible' : null,
    loo.babyChange ? 'Baby change' : null,
    loo.radar ? 'RADAR key' : null,
    loo.noPayment ? 'Free entry' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  marker.bindPopup(
    '<strong>Public toilet</strong>' +
      (features ? `<br/><small>${features}</small>` : ''),
  );

  return marker;
};

export interface ToiletMapProps {
  onData?: (loos: TileLoo[]) => void;
  onError?: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  reloadKey?: number | string;
  reloadForceNetwork?: boolean;
}

const ToiletMap = ({
  onData,
  onError,
  onLoadingChange,
  reloadKey,
  reloadForceNetwork,
}: ToiletMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLoos = useCallback(
    async ({ forceRefresh = false }: { forceRefresh?: boolean } = {}) => {
      if (!clusterGroupRef.current || !mapRef.current) {
        return;
      }

      const map = mapRef.current;
      const precision = getGeohashPrecisionForZoom(map.getZoom());
      const bounds = map.getBounds();
      const geohashes = computeGeohashesForBounds(bounds, precision);

      if (geohashes.length === 0) {
        return;
      }

      setLoading(true);
      onLoadingChange?.(true);
      setError(null);

      try {
        const tileResults = await Promise.all(
          geohashes.map((geohash) =>
            looTileCache.getLoosForGeohash(geohash, {
              requireFresh: forceRefresh,
            }),
          ),
        );

        const loos = dedupeLoosById(tileResults.flat());

        onData?.(loos);

        clusterGroupRef.current.clearLayers();

        const markers = loos.map(createMarker);

        markers.forEach((marker) => {
          clusterGroupRef.current?.addLayer(marker);
        });

        const expandedBounds = expandBounds(bounds, 0.5);
        const finerPrecision = Math.min(5, precision + 1);
        const backgroundGeohashes = computeGeohashesForBounds(
          expandedBounds,
          finerPrecision,
        );
        looTileCache.queueBackgroundFetch(backgroundGeohashes);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        onError?.(message);
      } finally {
        setLoading(false);
        onLoadingChange?.(false);
      }
    },
    [onData, onError, onLoadingChange],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    configureLeafletIcons();

    const map = L.map(containerRef.current, {
      center: [DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng],
      zoom: 12,
      zoomControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      disableClusteringAtZoom: 17,
      spiderfyOnMaxZoom: true,
      chunkedLoading: true,
    });

    clusterGroup.addTo(map);
    clusterGroupRef.current = clusterGroup;

    const handleViewportChange = () => {
      void loadLoos();
    };

    map.on('moveend', handleViewportChange);
    map.on('zoomend', handleViewportChange);

    void loadLoos();

    return () => {
      map.off('moveend', handleViewportChange);
      map.off('zoomend', handleViewportChange);
      clusterGroup.clearLayers();
      map.remove();
      mapRef.current = null;
      clusterGroupRef.current = null;
    };
  }, [loadLoos]);

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }
    void loadLoos({ forceRefresh: reloadForceNetwork ?? false });
  }, [loadLoos, reloadKey, reloadForceNetwork]);

  return (
    <div className={styles.mapContainer} ref={containerRef}>
      {loading ? <div className={styles.loader}>Fetching toilets…</div> : null}
      {error ? <div className={styles.error}>Could not load toilets: {error}</div> : null}
    </div>
  );
};

export default ToiletMap;
export type { TileLoo as Loo };
