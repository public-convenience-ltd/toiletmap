import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { FILTER_TYPE, getAppliedFiltersAsFilterTypes } from '../../lib/filter';
import {
  filterCompressedLooByAppliedFilters,
  parseCompressedLoo,
} from '../../lib/loo';
const KEY_ENTER = 13;

const mcg = L.markerClusterGroup({
  chunkedLoading: true,
  showCoverageOnHover: false,
  chunkInterval: 500,
});

const Markers = () => {
  const router = useRouter();

  const [mapState, setMapState] = useMapState();
  const { filters } = mapState;
  const { data } = useUkLooMarkersQuery();

  const [appliedFilterTypes, setAppliedFilterTypes] = useState<
    Array<FILTER_TYPE>
  >([]);

  useEffect(() => {
    const applied: Array<Filter> = config.filters.filter(
      (filter) => filters[filter.id]
    );
    const appliedFilterTypes = getAppliedFiltersAsFilterTypes(applied);
    window.setTimeout(() => {
      setAppliedFilterTypes(appliedFilterTypes);
    }, 200);
  }, [filters]);

  const initialiseMarker = useCallback(
    (toilet) => {
      return L.marker(new L.LatLng(toilet.location.lat, toilet.location.lng), {
        zIndexOffset: 0,
        icon: new ToiletMarkerIcon({
          toiletId: toilet.id,
          isHighlighted: toilet.id === mapState?.focus?.id,
        }),
        alt: 'Public Toilet',
        keyboard: false,
      })
        .on('click', () => {
          router.push(`/loos/${toilet.id}`);
        })
        .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
          if (event.originalEvent.keyCode === KEY_ENTER) {
            router.push(`/loos/${toilet.id}`);
          }
        });
    },
    [mapState?.focus?.id, router]
  );

  const getLooGroupLayers = useMemo(() => {
    if (!data?.ukLooMarkers) {
      return {};
    }

    const parsedAndFilteredMarkers = data?.ukLooMarkers
      .map(parseCompressedLoo)
      .filter((compressedLoo) =>
        filterCompressedLooByAppliedFilters(compressedLoo, appliedFilterTypes)
      );

    return parsedAndFilteredMarkers
      .filter((toilet) => {
        return toilet.id !== mapState?.focus?.id;
      })
      .map(initialiseMarker);
  }, [
    appliedFilterTypes,
    data?.ukLooMarkers,
    initialiseMarker,
    mapState?.focus?.id,
  ]);

  const map = useMap();
  useEffect(() => {
    if (getLooGroupLayers) {
      mcg.clearLayers();
      mcg.addLayers(getLooGroupLayers);
      map.addLayer(mcg);
    }
    return () => {
      mcg.clearLayers();
      map.removeLayer(mcg);
    };
  }, [map, getLooGroupLayers, mapState?.focus]);

  return null;
};

export default Markers;
