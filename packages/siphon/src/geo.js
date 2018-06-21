// Earth's radius, in metres
const EARTH_RADIUS = 6371000;
const EARTH_CIRCUM = EARTH_RADIUS * 2 * Math.PI;

/**
 * Get the coordinate bounds that would be required to contain all ground
 * locations within a sea level distance of the given number of miles.
 *
 * NOTES: As of present, this will fail for:
 * - Within milesRadius of the poles
 * - Within milesRadius of longitudes 180 and -180 - TODO fix
 *
 * It may also be unreasonably cautious. With the right math done to check,
 * it /may/ be possible to restrict the bounds further.
 *
 * TODO put a few of these worries to rest
 */
exports.getCoordBounds = function(lng, lat, metresRadius) {
  const latDispl = (metresRadius / (EARTH_CIRCUM / 4)) * 90;

  const minLat = lat - latDispl;
  const maxLat = lat + latDispl;

  // work out the latitude the circle goes through that the distance could
  // alter the longitude most at
  // additional bounds savings could maybe be made here, as we just assume
  // a square of side 2*radius to be paranoid
  let bigLat;
  if (Math.sign(minLat) !== Math.sign(maxLat)) {
    // maximum longitudinal displacement is through the equator
    bigLat = 0;
  } else {
    bigLat = Math.min(Math.abs(minLat), Math.abs(maxLat));
  }

  const lngDispl =
    (metresRadius / (Math.cos(toRadians(bigLat)) * (EARTH_CIRCUM / 2))) * 180;

  const minLng = lng - lngDispl;
  const maxLng = lng + lngDispl;

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

function toRadians(degs) {
  // (degs / 360) * 2pi, simplified
  return (Math.PI * degs) / 180;
}
