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

const Markers = () => {
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

  return (
    <>
      {Array.from(neighbourSet).map((hash) => (
        <MarkerGroup key={hash} geohash={hash} />
      ))}
    </>
  );
};

const MarkerGroup: React.FC<{ geohash: string }> = ({ geohash }) => {
  const mcg = useMemo(
    () =>
      L.markerClusterGroup({
        chunkedLoading: true,
        showCoverageOnHover: false,
        chunkInterval: 500,
      }),
    []
  );

  const router = useRouter();

  const [mapState] = useMapState();
  const { filters } = mapState;

  const map = useMap();

  const { data } = useLoosByGeohashQuery({
    variables: { geohash },
  });

  // Uncomment this to calculate the chunk bounds to draw a debug box.
  // const bbox = ngeohash.decode_bbox(geohash);
  // const bounds = L.rectangle(
  //   L.latLngBounds(L.latLng(bbox[0], bbox[1]), L.latLng(bbox[2], bbox[3]))
  // );
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
    mapState?.focus?.id,
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
