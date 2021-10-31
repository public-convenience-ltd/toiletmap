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

const mcg = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false,
  chunkInterval: 500,
});

const Markers = ({ focus, loos }: { loos: Array<Loo>; focus: Loo }) => {
  const router = useRouter();

  const focusedMarker = useMemo(() => {
    return L.marker(new L.LatLng(focus.location.lat, focus.location.lng), {
      zIndexOffset: 1000,
      icon: new ToiletMarkerIcon({
        isHighlighted: true,
        toiletId: focus.id,
        isUseOurLoosCampaign: focus.campaignUOL,
      }),
      alt: focus.name || 'Unnamed toilet',
      keyboard: false,
    })
      .on('click', () => {
        router.push(`/loos/${focus.id}`, undefined, {
          shallow: true,
        });
      })
      .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
        if (event.originalEvent.keyCode === KEY_ENTER) {
          router.push(`/loos/${focus.id}`, undefined, { shallow: true });
        }
      });
  }, [
    focus.campaignUOL,
    focus.id,
    focus.location.lat,
    focus.location.lng,
    focus.name,
    router,
  ]);

  const filteredLooGroups = useMemo(() => {
    return loos
      .filter((loo) => !!loo?.location || loo.id === focus?.id)
      .map((toilet) =>
        L.marker(new L.LatLng(toilet.location.lat, toilet.location.lng), {
          zIndexOffset: 0,
          icon: new ToiletMarkerIcon({
            isHighlighted: false,
            toiletId: toilet.id,
            isUseOurLoosCampaign: toilet.campaignUOL,
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
          })
      );
  }, [loos, focus?.id, router]);

  const map = useMap();
  useEffect(() => {
    mcg.clearLayers();
    map.addLayer(focusedMarker);
    mcg.addLayers(filteredLooGroups);
    map.addLayer(mcg);
    return () => {
      mcg.clearLayers();
      map.removeLayer(focusedMarker);
      map.removeLayer(mcg);
    };
  }, [map, filteredLooGroups, focusedMarker]);

  return null;
};

export default Markers;
