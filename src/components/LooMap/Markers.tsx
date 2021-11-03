import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useMap } from 'react-leaflet';
import { useUkLooMarkersQuery } from '../../api-client/graphql';
const KEY_ENTER = 13;

const mcg = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false,
  chunkInterval: 500,
});

function parseCompressedLoo(str) {
  const l = str.split('|');
  return {
    id: l[0],
    location: {
      lng: l[1],
      lat: l[2],
    },
    name: l[3],
  };
}

const Markers = () => {
  const router = useRouter();

  const { data } = useUkLooMarkersQuery();

  const filteredLooGroups = useMemo(() => {
    if (!data?.ukLooMarkers) {
      return [];
    }
    return data.ukLooMarkers.map((compressed) => {
      const toilet = parseCompressedLoo(compressed);
      return L.marker(new L.LatLng(toilet.location.lat, toilet.location.lng), {
        zIndexOffset: 0,
        icon: new ToiletMarkerIcon({
          toiletId: toilet.id,
          isUseOurLoosCampaign: toilet?.campaignUOL,
        }),
        alt: toilet.name || 'Unnamed toilet',
        keyboard: false,
      })
        .on('click', () => {
          router.push(`/loos/${toilet.id}`, undefined, {
            shallow: true,
          });
        })
        .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
          if (event.originalEvent.keyCode === KEY_ENTER) {
            router.push(`/loos/${toilet.id}`, undefined, { shallow: true });
          }
        });
    });
  }, [data, router]);

  const map = useMap();
  useEffect(() => {
    mcg.clearLayers();
    mcg.addLayers(filteredLooGroups);
    map.addLayer(mcg);
    return () => {
      mcg.clearLayers();
      map.removeLayer(mcg);
    };
  }, [map, filteredLooGroups]);

  return null;
};

export default Markers;
