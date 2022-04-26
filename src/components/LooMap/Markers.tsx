import React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import ToiletMarkerIcon, { MarkerIcon } from './ToiletMarkerIcon';
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
import {
  useIsUserInteractingWithMap,
  useMapClusterRadius,
  useMapGeohashPrecision,
} from './hooks';
import _ from 'lodash';
import { motion, MotionConfig } from 'framer-motion';
import { createRoot } from 'react-dom/client';

const KEY_ENTER = 13;

const Markers = () => {
  const [mapState, setMapState] = useMapState();

  const map = useMap();
  const router = useRouter();
  const boundingBox = map.getBounds();

  const { lat: boundingBoxNorth, lng: boundingBoxEast } =
    boundingBox.getNorthEast();
  const { lat: boundingBoxSouth, lng: boundingBoxWest } =
    boundingBox.getSouthWest();

  const userInteractingWithMap = useIsUserInteractingWithMap();
  const geohashPrecision = useMapGeohashPrecision();
  const maxClusterRadius = useMapClusterRadius();

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

  const throttledPrefetch = useMemo(() => {
    return _.throttle((id) => {
      router.prefetch(id);
      console.log(id);
    }, 1000);
  }, [router]);

  const prefetchVisibleToilets = useCallback(() => {
    const visibleMarkers = document.getElementsByClassName('toilet-marker');
    for (const marker of visibleMarkers) {
      if (marker instanceof HTMLElement) {
        const toiletId = marker.dataset?.toiletid;
        throttledPrefetch(`/loos/${toiletId}`);
      }
    }
  }, [throttledPrefetch]);

  useEffect(() => {
    setMapState({
      ...mapState,
      currentlyLoadedGeohashes: geohashesToLoad,
    });

    if (!userInteractingWithMap) {
      prefetchVisibleToilets();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geohashesToLoad, userInteractingWithMap]);

  return (
    <>
      {mapState.currentlyLoadedGeohashes.map((geohash) => (
        <MarkerGroup
          key={geohash}
          geohash={geohash}
          maxClusterRadius={maxClusterRadius}
        />
      ))}
    </>
  );
};
const MotionMarker = ({
  toilet,
  highlighted,
  loading,
  clickHighlighted,
  id,
}) => {
  const bounceTransition = {
    y: {
      duration: 0.3,
      yoyo: Infinity,
      ease: 'easeOut',
    },
    backgroundColor: {
      duration: 0,
      yoyo: Infinity,
      ease: 'easeOut',
      repeatDelay: 0.8,
    },
  };
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        data-toiletid={toilet.id}
        data-loaded={true}
        className="toilet-marker hydrate"
        whileHover={{ scale: highlighted ? 1.4 : 1.1 }}
        whileTap={{ scale: highlighted ? 1.3 : 0.8 }}
        style={{ scale: highlighted ? 1.5 : 1.0 }}
        transition={loading && clickHighlighted ? bounceTransition : undefined}
        animate={
          loading && clickHighlighted
            ? {
                y: ['20%', '-20%'],
              }
            : undefined
        }
      >
        <MarkerIcon isHighlighted={highlighted} />
      </motion.div>
    </MotionConfig>
  );
};

const MarkerGroup: React.FC<{
  geohash: string;
  maxClusterRadius: number;
}> = ({ geohash, maxClusterRadius }) => {
  const router = useRouter();
  const [mapState, setMapState] = useMapState();
  const map = useMap();

  const { appliedFilters: filters } = mapState;

  const { data } = useLoosByGeohashQuery({
    variables: { geohash },
  });

  const mcg = useMemo(
    () =>
      L.markerClusterGroup({
        maxClusterRadius,
        showCoverageOnHover: false,
        chunkedLoading: true,
      }),
    [maxClusterRadius]
  );

  // Uncomment this to calculate the chunk bounds to draw a debug box.
  // const bbox = ngeohash.decode_bbox(geohash);
  // const bounds = L.rectangle(
  //   L.latLngBounds(L.latLng(bbox[0], bbox[1]), L.latLng(bbox[2], bbox[3]))
  // );

  const [loading, setLoading] = useState(false);
  const [clickedToilet, setClickedToilet] = useState('');
  useEffect(() => {
    router.events.on('routeChangeStart', () => setLoading(true));
    router.events.on('routeChangeComplete', () => {
      setLoading(false);
      setClickedToilet('');
    });
  }, [router.events]);

  const initialiseMarker = useCallback(
    (toilet) => {
      const highlighted = toilet.id === mapState.focus?.id;

      const marker = L.marker(
        new L.LatLng(toilet.location.lat, toilet.location.lng),
        {
          zIndexOffset: 0,
          icon: ToiletMarkerIcon({
            toiletId: toilet.id as string,
            isHighlighted: highlighted,
          }),
          alt: 'Public Toilet',
          keyboard: false,
        }
      )
        .on('click', () => {
          // Clear the current search upon navigation
          router.push(`/loos/${toilet.id}`);
          setMapState({ searchLocation: undefined });
          setClickedToilet(toilet.id);
        })
        .on('keydown', (event: { originalEvent: { keyCode: number } }) => {
          if (event.originalEvent.keyCode === KEY_ENTER) {
            // Clear the current search upon navigation
            router.push(`/loos/${toilet.id}`);
            setMapState({ searchLocation: undefined });
            setClickedToilet(toilet.id);
          }
        })
        .on('add', (e) => {
          const parent = e.target?._icon;
          const child = parent.children[0];
          const clickHighlighted = clickedToilet === toilet.id;
          if (parent instanceof HTMLElement && child instanceof HTMLElement) {
            const hydrated = parent.dataset.hydrated === 'true';
            if (!hydrated) {
              const markerRoot = createRoot(parent);
              parent.setAttribute('data-hydrated', 'true');

              if (loading) {
                if (clickHighlighted) {
                  markerRoot.render(
                    <MotionMarker
                      clickHighlighted={clickHighlighted}
                      highlighted={highlighted}
                      loading={loading}
                      toilet={toilet}
                    />
                  );
                }
              } else {
                markerRoot.render(
                  <MotionMarker
                    clickHighlighted={clickHighlighted}
                    highlighted={highlighted}
                    loading={loading}
                    toilet={toilet}
                  />
                );
              }
            }
          }
        });

      marker.getElement()?.setAttribute('role', 'link');
      marker.getElement()?.setAttribute('aria-label', 'Public Toilet');

      return marker;
    },
    [mapState.focus?.id, setMapState, loading, clickedToilet]
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

  const parsedAndFilteredMarkers = useMemo(() => {
    if (!data?.loosByGeohash) {
      return null;
    }

    const parsedAndFilteredMarkers = data?.loosByGeohash
      .map(parseCompressedLoo)
      .filter((compressedLoo) =>
        filterCompressedLooByAppliedFilters(compressedLoo, appliedFilterTypes)
      );

    const parsedAndFilteredMarkersWithoutFocusedMarker =
      parsedAndFilteredMarkers.map(initialiseMarker);

    const focusedMarker = parsedAndFilteredMarkers.find(
      (m) => m.id === mapState?.focus?.id
    );

    return {
      focusedMarker: focusedMarker
        ? initialiseMarker(focusedMarker)
        : undefined,
      parsedAndFilteredMarkersWithoutFocusedMarker,
    };
  }, [
    appliedFilterTypes,
    data?.loosByGeohash,
    initialiseMarker,
    mapState?.focus?.id,
  ]);

  useEffect(() => {
    if (
      parsedAndFilteredMarkers?.parsedAndFilteredMarkersWithoutFocusedMarker &&
      mapState.geohashLoadState[geohash] === undefined
    ) {
      setMapState({
        ...mapState,
        geohashLoadState: {
          ...mapState.geohashLoadState,
          [geohash]: true,
        },
      });
    }
  }, [geohash, parsedAndFilteredMarkers, mapState, setMapState]);

  const [selectedMarkerLayer, setSelectedMarkerLayer] = useState();
  useEffect(() => {
    // if (parsedAndFilteredMarkers?.focusedMarker) {
    //   setSelectedMarkerLayer(parsedAndFilteredMarkers?.focusedMarker);
    //   map.addLayer(parsedAndFilteredMarkers?.focusedMarker);
    // }

    if (
      parsedAndFilteredMarkers?.parsedAndFilteredMarkersWithoutFocusedMarker
    ) {
      mcg.clearLayers();
      mcg.addLayers(
        parsedAndFilteredMarkers.parsedAndFilteredMarkersWithoutFocusedMarker
      );
      // uncomment this to highlight the bounds of each marker chunk for easier debugging.
      // mcg.addLayers([bounds]);
      map.addLayer(mcg);
    }
    return () => {
      mcg.clearLayers();
      // We're not using the spiderifier and it causes an internal -
      // leaflet warning when we remove the layer if it is defined.
      // So we set it to undefined to suppress the warning.
      // eslint-disable-next-line functional/immutable-data
      mcg._spiderfierOnRemove = undefined;
      map.removeLayer(mcg);
    };
  }, [parsedAndFilteredMarkers, map, mcg, selectedMarkerLayer]);

  return null;
};

export default Markers;
