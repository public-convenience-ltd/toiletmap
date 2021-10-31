import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  forwardRef,
} from 'react';
import { useRouter } from 'next/router';
import {
  Loo,
  useMinimumViableLooResponseQuery,
} from '../../api-client/graphql';
import { Marker, useMapEvents, useMap, MarkerProps } from 'react-leaflet';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import config from '../../config';
const KEY_ENTER = 13;

// const MarkerCustom: React.FC<MarkerProps> = (props) => {
//   return <div id={props.<Marker {...props} />;
// };

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

  const filteredLooGroups = useMemo(() => {
    const filters = [
      {
        id: 'noPayment',
        label: 'Free',
      },
      {
        id: 'babyChange',
        label: 'Baby Changing',
      },
      {
        id: 'accessible',
        label: 'Accessible',
      },
      {
        id: 'allGender',
        label: 'Gender Neutral',
      },
      {
        id: 'radar',
        label: 'Radar Key',
      },
      {
        id: 'automatic',
        label: 'Automatic',
      },
    ];
    const groups = {};
    filters.forEach((group) => {
      const filteredRealLooGroup = loos.filter((loo) => !loo[group.id]);
      groups[group.id] = filteredRealLooGroup.map((toilet) => {
        return (
          <Marker
            pane={group.id}
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
    });

    return groups;
  }, [loos, focus?.id, router]);
  return (
    <>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'noPayment'}
      >
        {filteredLooGroups['noPayment']}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'babyChange'}
      >
        {filteredLooGroups['babyChange']}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'accessible'}
      >
        {filteredLooGroups['accessible']}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'allGender'}
      >
        {filteredLooGroups['allGender']}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'radar'}
      >
        {filteredLooGroups['radar']}
      </MarkerClusterGroup>
      <MarkerClusterGroup
        animateAddingMarkers={false}
        removeOutsideVisibleBounds
        chunkedLoading
        maxClusterRadius={200}
        clusterPane={'automatic'}
      >
        {filteredLooGroups['automatic']}
      </MarkerClusterGroup>
    </>
  );
};

export default Markers;
