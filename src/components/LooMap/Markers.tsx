import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Loo } from '../../api-client/graphql';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useMap } from 'react-leaflet';
const KEY_ENTER = 13;

const FILTERS = [
  'noPayment',

  'babyChange',

  'accessible',

  'allGender',

  'radar',

  'automatic',
] as const;

const mcg = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false,
});

const Markers = ({ focus, loos }: { loos: Array<Loo>; focus: Loo }) => {
  const router = useRouter();

  const toiletMarkerIcon = useCallback(
    (toilet, focusId) =>
      new ToiletMarkerIcon({
        isHighlighted: toilet.id === focusId,
        toiletId: toilet.id,
        isUseOurLoosCampaign: toilet.campaignUOL,
      }),
    []
  );

  const filteredLooGroups = useMemo(() => {
    return loos.map((toilet) =>
      L.marker(new L.LatLng(toilet.location.lat, toilet.location.lng), {
        zIndexOffset: toilet.id === focus?.id ? 1000 : 0,
        icon: toiletMarkerIcon(toilet, focus?.id),
        alt: toilet.name || 'Unnamed toilet',
        keyboard: false,
      })
        .on('click', () => {
          router.push(`/loos/${toilet.id}`);
        })
        .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
          if (event.originalEvent.keyCode === KEY_ENTER) {
            router.push(`/loos/${toilet.id}`);
          }
        })
    );
  }, [loos, focus?.id, toiletMarkerIcon, router]);

  const map = useMap();
  useEffect(() => {
    mcg.clearLayers();
    mcg.addLayers(filteredLooGroups);
    map.addLayer(mcg);
  }, [map, filteredLooGroups]);

  return null;
};

export default Markers;
