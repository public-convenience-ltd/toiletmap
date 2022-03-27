import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useMap } from 'react-leaflet';
import { useLoosByGeohashQuery } from '../../api-client/graphql';
import config, { Filter } from '../../config';
import { useMapState } from '../MapState';
import { FILTER_TYPE, getAppliedFiltersAsFilterTypes } from '../../lib/filter';
import {
  filterCompressedLooByAppliedFilters,
  parseCompressedLoo,
} from '../../lib/loo';
import ngeohash from 'ngeohash';

const KEY_ENTER = 13;

const Markers: React.FC<{
  setLoadedToilets: (loadedToilets) => void;
}> = ({ setLoadedToilets }) => {
  const map = useMap();

  const isLocalisedView = map.getZoom() < 13;
  const isBirdsEyeView = map.getZoom() < 10;
  const isNationalView = map.getZoom() < 8;
  const hashPrecision = isNationalView
    ? 2
    : isBirdsEyeView
    ? 3
    : isLocalisedView
    ? 4
    : 5;
  const tileLat = isNationalView ? 51.509865 : map.getCenter().lat;
  const tileLng = isNationalView ? -0.118092 : map.getCenter().lng;

  const geohashTile = ngeohash.encode(tileLat, tileLng, hashPrecision);
  const neighbours = ngeohash.neighbors(geohashTile);
  const surroundingTiles = neighbours.flatMap((n) => ngeohash.neighbors(n));
  const neighbourSet = new Set([...surroundingTiles]);

  useEffect(() => {
    setLoadedToilets(neighbourSet);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileLat, tileLng]);

  return (
    <>
      {Array.from(neighbourSet).map((geohash) => (
        <MarkerGroup key={geohash} geohash={geohash} />
      ))}
    </>
  );
};

const MarkerGroup: React.FC<{
  geohash: string;
}> = ({ geohash }) => {
  const router = useRouter();
  const [mapState, setMapState] = useMapState();
  const map = useMap();
  const { appliedFilters: filters } = mapState;

  const { data } = useLoosByGeohashQuery({
    variables: { geohash },
  });

  useEffect(() => {
    if (data) {
      setMapState({
        loadedGroups: {
          ...mapState.loadedGroups,
          [geohash]: data?.loosByGeohash.map(parseCompressedLoo),
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mcg = useMemo(
    () =>
      L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        chunkInterval: 500,
      }),
    []
  );

  // Uncomment this to calculate the chunk bounds to draw a debug box.
  // const bbox = ngeohash.decode_bbox(geohash);
  // const bounds = L.rectangle(
  //   L.latLngBounds(L.latLng(bbox[0], bbox[1]), L.latLng(bbox[2], bbox[3]))
  // );

  const initialiseMarker = useCallback(
    (toilet) => {
      const marker = L.marker(
        new L.LatLng(toilet.location.lat, toilet.location.lng),
        {
          zIndexOffset: 0,
          icon: new ToiletMarkerIcon({
            toiletId: toilet.id,
            isHighlighted: toilet.id === mapState?.focus?.id,
          }),
          alt: 'Public Toilet',
          keyboard: false,
        }
      )
        .on('click', () => {
          // Clear the current search upon navigation
          setMapState({ searchLocation: undefined });
          router.push(`/loos/${toilet.id}`);
        })
        .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
          if (event.originalEvent.keyCode === KEY_ENTER) {
            // Clear the current search upon navigation
            setMapState({ searchLocation: undefined });
            router.push(`/loos/${toilet.id}`);
          }
        });

      marker.getElement()?.setAttribute('role', 'link');
      marker.getElement()?.setAttribute('aria-label', 'Public Toilet');
      return marker;
    },
    [mapState?.focus?.id, router, setMapState]
  );

  const [appliedFilterTypes, setAppliedFilterTypes] = useState<
    Array<FILTER_TYPE>
  >(
    getAppliedFiltersAsFilterTypes(
      config.filters.filter((filter) => filters[filter.id])
    )
  );

  useEffect(() => {
    const applied: Array<Filter> = config.filters.filter(
      (filter) => filters[filter.id]
    );
    const appliedFilterTypes = getAppliedFiltersAsFilterTypes(applied);
    window.setTimeout(() => {
      setAppliedFilterTypes(appliedFilterTypes);
    }, 200);
  }, [filters]);

  const getLooGroupLayers = useMemo(() => {
    if (!data?.loosByGeohash) {
      return null;
    }

    const parsedAndFilteredMarkers = data?.loosByGeohash
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
    data?.loosByGeohash,
    initialiseMarker,
    mapState.focus,
  ]);

  useEffect(() => {
    if (getLooGroupLayers) {
      mcg.clearLayers();
      mcg.addLayers(getLooGroupLayers);
      // uncomment this to highlight the bounds of each marker chunk for easier debugging.
      //mcg.addLayers([bounds]);
      map.addLayer(mcg);
    }
    return () => {
      mcg.clearLayers();
      map.removeLayer(mcg);
    };
  }, [getLooGroupLayers, map, mapState.focus, mcg]);

  return null;
};

export default Markers;
