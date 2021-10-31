import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Loo } from '../../api-client/graphql';
import { Marker } from 'react-leaflet';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { useMap } from 'react-leaflet';
const KEY_ENTER = 13;

const mcg = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false,
});

const Markers = ({
  focus,
  loos,
  flobs,
}: {
  loos: Array<Loo>;
  focus: Loo;
  flobs: any;
}) => {
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
    const filters = [
      'noPayment',

      'babyChange',

      'accessible',

      'allGender',

      'radar',

      'automatic',
    ];

    const totalLoos = loos.filter((loo) => {
      for (const filter of filters) {
        if (flobs[filter]) {
          if (loo[filter] === true) {
            return false;
          }
        }
      }
      return true;
    });

    return totalLoos.map((toilet) =>
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
  }, [loos, flobs, focus?.id, toiletMarkerIcon, router]);

  const map = useMap();
  useEffect(() => {
    mcg.clearLayers();
    mcg.addLayers(filteredLooGroups);
    map.addLayer(mcg);
  }, [map, filteredLooGroups]);

  return null;
};

export default Markers;
