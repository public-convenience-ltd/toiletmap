import { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CompressedLooObject } from '../../lib/loo';
import { Rectangle, useMap } from 'react-leaflet';
import ngeohash from 'ngeohash';
import {
  useIsUserInteractingWithMap,
  useMapGeohashPrecision,
  useRetrieveCachedLoos,
} from './hooks';

// Keycodes for numbers 0-5
// https://github.com/Leaflet/Leaflet/issues/5766
const KEY_CODES = [48, 49, 50, 51, 52, 53];

const AccessibilityIntersection = ({
  onIntersection,
  onSelection,
  className,
}: {
  onIntersection: (compressedLoos: CompressedLooObject[]) => void;
  onSelection: (selectionIndex: string | number) => void;
  className: string;
}) => {
  const map = useMap();

  const bounds = map?.getBounds().pad(-0.4);
  const { lat: boundingBoxNorth, lng: boundingBoxEast } = bounds.getNorthEast();
  const { lat: boundingBoxSouth, lng: boundingBoxWest } = bounds.getSouthWest();

  const userInteractingWithMap = useIsUserInteractingWithMap();

  const geohashPrecision = useMapGeohashPrecision();

  const geohashIntersections = useMemo(() => {
    if (bounds) {
      return ngeohash.bboxes(
        boundingBoxSouth,
        boundingBoxWest,
        boundingBoxNorth,
        boundingBoxEast,
        geohashPrecision,
      );
    }

    return [];
  }, [
    bounds,
    boundingBoxSouth,
    boundingBoxWest,
    boundingBoxNorth,
    boundingBoxEast,
    geohashPrecision,
  ]);

  const loos = useRetrieveCachedLoos(geohashIntersections);

  useEffect(() => {
    if (userInteractingWithMap === false) {
      const contains = loos
        ?.filter((toilet) => toilet && bounds.contains(toilet.location))
        .slice(0, KEY_CODES.length);
      if (contains) {
        onIntersection(contains);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInteractingWithMap]);

  useEffect(() => {
    const keyDownHandler = (event: { keyCode: number }) => {
      const selectionIndex = KEY_CODES.indexOf(event.keyCode);
      if (selectionIndex === -1) {
        return;
      }

      onSelection(selectionIndex);
    };
    document.addEventListener('keydown', keyDownHandler);
    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [onSelection]);
  return <Rectangle className={className} bounds={bounds}></Rectangle>;
};

AccessibilityIntersection.propTypes = {
  onIntersection: PropTypes.func.isRequired,
  onSelection: PropTypes.func.isRequired,
};

export default AccessibilityIntersection;
