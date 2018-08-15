const { Report } = require('./models');

/**
 * Gets any useful textual information from a string or undefined if there is
 * none.
 */
function ignoreEmpty(string) {
  if (string === undefined) {
    return undefined;
  }

  if (string.trim().length === 0) {
    // only whitespace, we shouldn't populate the field
    return undefined;
  }

  return string.trim();
}

/**
 * Convert a legacy report to the new report schema.
 */
exports.toNewReport = function toNewReport(legacy) {
  return new Report({
    diff: {
      geometry: legacy.geometry,
      name: ignoreEmpty(legacy.properties.name),
      active: legacy.properties.active,
      access: ignoreEmpty(legacy.properties.access),
      opening: ignoreEmpty(legacy.properties.opening),
      type: ignoreEmpty(legacy.properties.type),
      accessibleType: ignoreEmpty(legacy.properties.accessibleType),
      disposal: legacy.properties.disposal,
      babyChange: legacy.properties.babyChange,
      babyChangeLocation: legacy.properties.babyChangeLocation,
      changingPlace: legacy.properties.changingPlace,
      familyToilet: legacy.properties.familyToilet,
      radar: legacy.properties.radar,
      attended: legacy.properties.attended,
      automatic: legacy.properties.automatic,
      parking: legacy.properties.parking,
      fee: ignoreEmpty(legacy.properties.fee),
      streetAddress: legacy.properties.streetAddress,
      postcode: legacy.properties.postcode,
      operator: legacy.properties.operator,
      reportEmail: legacy.properties.reportEmail,
      reportPhone: legacy.properties.reportPhone,
      notes: ignoreEmpty(legacy.properties.notes),
      infoUrl: legacy.properties.infoUrl,
      architecturalInterest: legacy.properties.architecturalInterest,
      historicalInterest: legacy.properties.historicalInterest,
      geocoded: legacy.properties.geocoded,
      geocoding_method: legacy.properties.geocoding_method,
      orig: legacy.properties.orig,
      removal_reason: ignoreEmpty(legacy.properties.removal_reason),
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
