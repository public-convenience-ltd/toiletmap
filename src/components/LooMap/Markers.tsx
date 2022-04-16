import React from 'react';
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
  const [loadedGroupCount, setLoadedGroupCount] = useState(0);
  const [mapState, setMapState] = useMapState();
  const [userInteractingWithMap, setUserInteractingWithMap] = useState(false);

  const map = useMap();

  const boundingBox = map.getBounds();

  const { lat: boundingBoxNorth, lng: boundingBoxEast } =
    boundingBox.getNorthEast();
  const { lat: boundingBoxSouth, lng: boundingBoxWest } =
    boundingBox.getSouthWest();

  const zoom = map.getZoom();

  useEffect(() => {
    map.on('moveend', () =>
      setTimeout(() => setUserInteractingWithMap(false), 100)
    );
    map.on('zoomend', () =>
      setTimeout(() => setUserInteractingWithMap(false), 100)
    );

    map.on('zoomstart', () => setUserInteractingWithMap(true));
    map.on('movestart', () => setUserInteractingWithMap(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const geohashPrecision = useMemo(() => {
    console.log(zoom);
    switch (true) {
      case zoom < 8:
        return 2;
      case zoom < 11:
        return 3;
      case zoom < 13:
        return 4;
      default:
        return 5;
    }
  }, [zoom]);

  const maxClusterRadius = useMemo(() => {
    switch (true) {
      case zoom < 8:
        return 200;
      case zoom < 10:
        return 150;
      case zoom < 13:
        return 125;
      case zoom < 15:
        return 100;
      default:
        return 10;
    }
  }, [zoom]);

  const geohashesToLoad = useMemo(() => {
    const bbSouth = boundingBoxSouth > 49.699282 ? boundingBoxSouth : 49.699282;
    const bbNorth = boundingBoxNorth < 62.957486 ? boundingBoxNorth : 62.957486;
    const bbWest = boundingBoxWest > -11.227341 ? boundingBoxWest : -11.227341;
    const bbEast = boundingBoxEast < 3.010941 ? boundingBoxEast : 3.010941;
    return ngeohash.bboxes(bbSouth, bbWest, bbNorth, bbEast, geohashPrecision);
  }, [
    boundingBoxEast,
    geohashPrecision,
    boundingBoxNorth,
    boundingBoxSouth,
    boundingBoxWest,
  ]);

  useEffect(() => {
    if (userInteractingWithMap === false) {
      setLoadedGroupCount(0);

      setMapState({
        ...mapState,
        currentlyLoadedGeohashes: geohashesToLoad,
        markersLoading: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geohashesToLoad, userInteractingWithMap]);

  useEffect(() => {
    if (loadedGroupCount === mapState.currentlyLoadedGeohashes.length - 1) {
      setMapState({ ...mapState, markersLoading: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedGroupCount]);

  const incrLoadedGroupCount = useCallback(() => {
    setLoadedGroupCount(loadedGroupCount + 1);
  }, [loadedGroupCount]);

  return (
    <>
      {mapState.currentlyLoadedGeohashes.map((geohash) => (
        <MarkerGroup
          key={geohash}
          geohash={geohash}
          incrLoadedGroupCount={incrLoadedGroupCount}
          maxClusterRadius={maxClusterRadius}
        />
      ))}
    </>
  );
};

const MarkerGroup: React.FC<{
  geohash: string;
  maxClusterRadius: number;
  incrLoadedGroupCount: () => void;
}> = ({ geohash, incrLoadedGroupCount, maxClusterRadius }) => {
  const router = useRouter();
  const [mapState, setMapState] = useMapState();
  const map = useMap();

  const { appliedFilters: filters } = mapState;

  const { data, loading } = useLoosByGeohashQuery({
    variables: { geohash },
  });

  const mcg = useMemo(
    () =>
      L.markerClusterGroup({
        maxClusterRadius,
        showCoverageOnHover: false,
      }),
    [maxClusterRadius]
  );

  useEffect(() => {
    if (loading === false) {
      incrLoadedGroupCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
          icon: ToiletMarkerIcon({
            toiletId: toilet.id as string,
            isHighlighted: (toilet.id as string) === mapState?.focus?.id,
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
      config.filters.filter((filter) => filters?.[filter.id])
    )
  );

  useEffect(() => {
    const applied: Array<Filter> = config.filters.filter(
      (filter) => filters?.[filter.id]
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
      // mcg.addLayers([bounds]);
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
