// Earth's radius, in metres
const EARTH_RADIUS = 6371000;
const EARTH_CIRCUM = EARTH_RADIUS * 2 * Math.PI;

/**
 * Get the coordinate bounds that would be required to contain all ground
 * locations within a sea level distance of the given number of miles.
 *
 * It may be possible to tighten bounds further, as we are working out the
 * rectangular bounds of coordinates through a naive approach, but this has not
 * been explored.
 *
 * This function should perform as expected for extreme values of metresRadius.
 *
 * Note that, in some cases, owing to the way that angles wrap around, the max
 * coordinate values may be lesser than the minimum coordinate values; this
 * indicates a passage over the poles or going beyond one side of the Earth.
 */
exports.getCoordBounds = function(lng, lat, metresRadius) {
  // the proportion of the way up or down a radius can move a coordinate over
  // the world, as an angle from 0 to 90
  const latDispl = (metresRadius / (EARTH_CIRCUM / 4)) * 90;

  let minLat;
  let maxLat;
  if (latDispl >= 90) {
    // the radius is significant enough to cover the entire side of the Earth vertically
    minLat = -90;
    maxLat = 90;
  } else {
    minLat = wrapAroundLat(lat - latDispl);
    maxLat = wrapAroundLat(lat + latDispl);
  }

  // work out the closest angle we get to the poles, the biggest longitude
  // change for a given distance in metres is here
  let bigLat = Math.max(Math.abs(minLat), Math.abs(maxLat));

  let minLng;
  let maxLng;
  if (minLat > maxLat || bigLat === 90) {
    // we go through the poles or one of our bounds is on the poles
    minLng = -180;
    maxLng = 180;
  } else {
    // the Earth's circumference at big latitude (the smaller this is, the
    // bigger our longitundinal displacement can be
    const circumAt = (EARTH_CIRCUM / 2) * Math.cos(toRadians(bigLat));

    // longitundinal displacement
    const lngDispl = (metresRadius / circumAt) * 180;

    if (lngDispl >= 180) {
      // the radius is significant enough to cover the entire side of the Earth horizontally
      minLng = -180;
      maxLng = 180;
    } else {
      minLng = wrapAroundLng(lng - lngDispl);
      maxLng = wrapAroundLng(lng + lngDispl);
    }
  }

  return {
    min: {
      lat: minLat,
      lng: minLng,
    },
    max: {
      lat: maxLat,
      lng: maxLng,
    },
  };
};

/**
 * Bounds returned from getCoordBounds() may wrap around, as spherical
 * coordinates can. This converts a bound that wraps around into multiple other
 * bounds as necessary to remove this property: all mins will be less than their
 * respective maxes but the area covered will be the same.
 *
 * This is messy and I don't really like it; hopefully it will refactor out
 * nicely when this module is tidied.
 */
exports.removeBoundWrapAround = function(bounds) {
  if (bounds.min.lat > bounds.max.lat) {
    // deep clone; this occurs four times in this function and should probably
    // be pulled out to a new data type or util method if repeated again
    const lowBounds = {
      ...bounds,
      min: {
        ...bounds.min,
        lat: -90,
      },
      max: { ...bounds.max },
    };

    const highBounds = {
      ...bounds,
      min: { ...bounds.min },
      max: {
        ...bounds.max,
        lat: 90,
      },
    };

    // recursively call, we haven't checked longitude yet
    return [
      ...exports.removeBoundWrapAround(lowBounds),
      ...exports.removeBoundWrapAround(highBounds),
    ];
  } else if (bounds.min.lng > bounds.max.lng) {
    const lowBounds = {
      ...bounds,
      min: {
        ...bounds.min,
        lng: -180,
      },
      max: { ...bounds.max },
    };

    const highBounds = {
      ...bounds,
      min: { ...bounds.min },
      max: {
        ...bounds.max,
        lng: 180,
      },
    };

    return [lowBounds, highBounds];
  }

  return [bounds];
};

/**
 * Wrap around:
 * - Longitudes at 180 + x to -180 + x
 * - Longitudes at -180 - x to 180 - x
 * to preserve -180 <= longitude <= 180
 */
function wrapAroundLng(deg) {
  // we don't need to wrap around there, both -180 and 180 are acceptable
  if (deg === 180) return deg;

  return ((deg + 180) % 360) - 180;
}

/**
 * Wrap around:
 * - Latitudes at 90 + y to -90 + y
 * - Latitudes at -90 - y to 90 - y
 * to preserve -90 <= latidude <= 90
 */
function wrapAroundLat(deg) {
  // we don't need to wrap around there, both -90 and 90 are acceptable
  if (deg === 90) return deg;

  return ((deg + 90) % 180) - 90;
}

/**
 * Convert from degrees to radians.
 */
function toRadians(degs) {
  // (degs / 360) * 2pi, simplified
  return (Math.PI * degs) / 180;
}
