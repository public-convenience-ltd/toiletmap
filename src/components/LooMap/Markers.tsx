import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import { useRouter } from 'next/router';
import { useFindLoosNearbyQuery } from '../../api-client/graphql';
import { Marker, useMapEvents, useMap } from 'react-leaflet';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import MarkerClusterGroup from 'react-leaflet-markercluster';
const KEY_ENTER = 13;

const Markers = ({ focus }) => {
  const router = useRouter();
  const map = useMap();

  const [mapFind, setMapFind] = useState({
    lat: 54.093409, //map.getCenter().lat,
    lng: -2.89479, //map.getCenter().lng,
    radius: 1000000, //Math.ceil(
    //  map.getBounds().getNorthEast().distanceTo(map.getCenter())
    //),
  });

  const { data } = useFindLoosNearbyQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    variables: mapFind,
  });

  useMapEvents({
    moveend: () => setMapFind(mapFind),
  });

  const memoizedMarkers = useMemo(() => {
    if (!data?.loosByProximity) {
      return null;
    }
    return data.loosByProximity.map((toilet) => {
      return (
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
      );
    });
  }, [data, focus, router]);

  return <MarkerClusterGroup>{memoizedMarkers}</MarkerClusterGroup>;
};

export default Markers;
