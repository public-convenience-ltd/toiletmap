import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useFindLoosNearbyQuery } from '../../api-client/graphql';
import { Marker, useMapEvents, useMap } from 'react-leaflet';
import ToiletMarkerIcon from './ToiletMarkerIcon';

const KEY_ENTER = 13;

function mapToFindVars(map) {
  return {
    lat: map.getCenter().lat,
    lng: map.getCenter().lng,
    radius: Math.ceil(
      map.getBounds().getNorthEast().distanceTo(map.getCenter())
    ),
  };
}

const Markers = ({ focus }) => {
  const router = useRouter();
  const map = useMap();

  const { data, refetch } = useFindLoosNearbyQuery({
    variables: {
      ...mapToFindVars(map),
    },
  });

  useMapEvents({
    moveend: () => refetch(mapToFindVars(map)),
  });

  const memoizedMarkers = useMemo(() => {
    if (!data?.loosByProximity) {
      return null;
    }
    return data.loosByProximity.map((toilet) => (
      <Marker
        key={toilet.id}
        position={toilet.location}
        zIndexOffset={toilet.id === focus?.id ? 1000 : 0}
        icon={
          new ToiletMarkerIcon({
            isHighlighted: toilet.id === focus?.id,
            toiletId: toilet.id,
            isUseOurLoosCampaign: toilet.campaignUOL,
          })
        }
        alt={toilet.name || 'Unnamed toilet'}
        eventHandlers={{
          click: () => {
            router.push(`/loos/${toilet.id}`);
          },
          keydown: (event: { originalEvent: { keyCode: number } }) => {
            if (event.originalEvent.keyCode === KEY_ENTER) {
              router.push(`/loos/${toilet.id}`);
            }
          },
        }}
        keyboard={false}
      />
    ));
  }, [data, router, focus]);

  return <>{memoizedMarkers}</>;
};

export default Markers;
