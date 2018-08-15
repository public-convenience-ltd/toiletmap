const { Report } = require('./models');

/**
 * Convert a legacy report to the new report schema.
 */
exports.toNewReport = function toNewReport(legacy) {
  return new Report({
    diff: {
      geometry: legacy.geometry,
      name: legacy.properties.name,
      active: legacy.properties.active,
      access: legacy.properties.access,
      opening: legacy.properties.opening,
      type: legacy.properties.type,
      accessibleType: legacy.properties.accessibleType,
      disposal: legacy.properties.disposal,
      babyChange: legacy.properties.babyChange,
      babyChangeLocation: legacy.properties.babyChangeLocation,
      changingPlace: legacy.properties.changingPlace,
      familyToilet: legacy.properties.familyToilet,
      radar: legacy.properties.radar,
      attended: legacy.properties.attended,
      automatic: legacy.properties.automatic,
      parking: legacy.properties.parking,
      fee: legacy.properties.fee,
      streetAddress: legacy.properties.streetAddress,
      postcode: legacy.properties.postcode,
      operator: legacy.properties.operator,
      reportEmail: legacy.properties.reportEmail,
      reportPhone: legacy.properties.reportPhone,
      notes: legacy.properties.notes,
      infoUrl: legacy.properties.infoUrl,
      architecturalInterest: legacy.properties.architecturalInterest,
      historicalInterest: legacy.properties.historicalInterest,
      geocoded: legacy.properties.geocoded,
      geocoding_method: legacy.properties.geocoding_method,
      orig: legacy.properties.orig,
      removal_reason: legacy.properties.removal_reason,
      area: legacy.properties.area,
    },
  });
};

/**
 * Convert a list of legacy reports to a list of new reports. This is its own
 * function as, in the future, a new report will not always be solely created
 * from the data of one legacy report.
 */
exports.toNewReports = function toNewReports(legacies) {
  return legacies.map(exports.toNewReport);
};
