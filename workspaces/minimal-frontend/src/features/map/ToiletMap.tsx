import { useEffect, useRef, useState, useCallback } from 'react';
import L, { Map as LeafletMap, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import { graphQLClient } from '@/lib/graphqlClient';
import styles from './ToiletMap.module.css';
import {
  FIND_NEARBY_LOOS,
  FindNearbyLoosResponse,
  Loo,
} from './queries';

const DEFAULT_LOCATION = {
  lat: 51.505,
  lng: -0.09,
};
export const DEFAULT_RADIUS_METERS = 25000;

const configureLeafletIcons = () => {
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
};

const createMarker = (loo: Loo) => {
  const marker = L.marker([loo.location.lat, loo.location.lng], {
    title: loo.name ?? 'Public toilet',
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
    `<strong>${loo.name ?? 'Public toilet'}</strong>` +
      (features ? `<br/><small>${features}</small>` : ''),
  );

  return marker;
};

export interface ToiletMapProps {
  onData?: (loos: Loo[]) => void;
  onError?: (message: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  reloadKey?: number | string;
}

const ToiletMap = ({ onData, onError, onLoadingChange, reloadKey }: ToiletMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLoos = useCallback(async () => {
    if (!clusterGroupRef.current) {
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);
    setError(null);

    try {
      const data = await graphQLClient.request<FindNearbyLoosResponse>({
        query: FIND_NEARBY_LOOS,
        variables: {
          lat: DEFAULT_LOCATION.lat,
          lng: DEFAULT_LOCATION.lng,
          radius: DEFAULT_RADIUS_METERS,
        },
      });

      onData?.(data.loosByProximity);

      clusterGroupRef.current.clearLayers();

      const markers = data.loosByProximity.map(createMarker);

      markers.forEach((marker: Marker) => {
        clusterGroupRef.current?.addLayer(marker);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      onError?.(message);
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [onData, onError, onLoadingChange]);

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

    void loadLoos();

    return () => {
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
    void loadLoos();
  }, [loadLoos, reloadKey]);

  return (
    <div className={styles.mapContainer} ref={containerRef}>
      {loading ? <div className={styles.loader}>Fetching toilets…</div> : null}
      {error ? <div className={styles.error}>Could not load toilets: {error}</div> : null}
    </div>
  );
};

export default ToiletMap;
export type { Loo };
