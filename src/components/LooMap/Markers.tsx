import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useMap } from 'react-leaflet';
import { useUkLooMarkersQuery } from '../../api-client/graphql';
import config, { Filter } from '../../config';
import { useMapState } from '../MapState';
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
    filterBitmask: parseInt(l[3], 10),
  };
}

enum FILTER_TYPE {
  NO_PAYMENT = 0b00000001,
  ALL_GENDER = 0b00000010,
  AUTOMATIC = 0b00000100,
  ACCESSIBLE = 0b00001000,
  BABY_CHNG = 0b00010000,
  RADAR = 0b00100000,
}

const Markers = () => {
  const router = useRouter();

  const [mapState] = useMapState();
  const { filters } = mapState;
  const { data } = useUkLooMarkersQuery();

  const [appliedFilters, setAppliedFilters] = useState<Array<FILTER_TYPE>>([]);

  useEffect(() => {
    // get the filter objects from config for the filters applied by the user
    const applied: Array<Filter> = config.filters.filter(
      (filter) => filters[filter.id]
    );

    const bitmask = applied.reduce((p, c) => {
      switch (c.id) {
        case 'accessible':
          p.push(FILTER_TYPE.ACCESSIBLE);
          break;
        case 'allGender':
          p.push(FILTER_TYPE.ALL_GENDER);
          break;
        case 'automatic':
          p.push(FILTER_TYPE.AUTOMATIC);
          break;
        case 'babyChange':
          p.push(FILTER_TYPE.BABY_CHNG);
          break;
        case 'noPayment':
          p.push(FILTER_TYPE.NO_PAYMENT);
          break;
        case 'radar':
          p.push(FILTER_TYPE.RADAR);
          break;
      }
      return p;
    }, [] as Array<FILTER_TYPE>);

    window.setTimeout(() => {
      setAppliedFilters(bitmask);
    }, 200);
  }, [filters]);

  const filteredLooGroups = useMemo(() => {
    if (!data?.ukLooMarkers) {
      return [];
    }
    return data.ukLooMarkers
      .filter((compressed) => {
        const toilet = parseCompressedLoo(compressed);
        for (let i = 0; i < appliedFilters.length; i++) {
          const filter = appliedFilters[i];
          if (toilet.filterBitmask & filter) {
            return false;
          }
        }
        return true;
      })
      .map((compressed) => {
        const toilet = parseCompressedLoo(compressed);
        return L.marker(
          new L.LatLng(toilet.location.lat, toilet.location.lng),
          {
            zIndexOffset: 0,
            icon: new ToiletMarkerIcon({
              toiletId: toilet.id,
            }),
            alt: 'Public Toilet',
            keyboard: false,
          }
        )
          .on('click', () => {
            router.push(`/loos/${toilet.id}`);
          })
          .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
            if (event.originalEvent.keyCode === KEY_ENTER) {
              router.push(`/loos/${toilet.id}`);
            }
          });
      });
  }, [data, router, appliedFilters]);

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
