import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import { useRouter } from 'next/router';
import { useMinimumViableLooResponseQuery } from '../../api-client/graphql';
import { Marker, useMapEvents, useMap } from 'react-leaflet';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import MarkerClusterGroup from 'react-leaflet-markercluster';
const KEY_ENTER = 13;

const Markers = ({ focus }) => {
  const router = useRouter();

  const { data } = useMinimumViableLooResponseQuery({
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    variables: { limit: 1000000 },
  });

  const memoizedMarkers = useMemo(() => {
    if (!data?.loos.loos) {
      return null;
    }
    return data.loos.loos.map((toilet) => {
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

  return (
    <MarkerClusterGroup
      chunkedLoading={true}
      animateAddingMarkers={false}
      removeOutsideVisibleBounds={true}
      maxClusterRadius={150}
    >
      {memoizedMarkers}
    </MarkerClusterGroup>
  );
};

export default Markers;
