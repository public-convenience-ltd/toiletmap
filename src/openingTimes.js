const { DateTime, Info, Interval } = require('luxon');

const rangeTypes = {
  CLOSED: 'CLOSED',
};

const WEEKDAYS = Info.weekdays();

function getIsOpen(openingTimes = [], dateTime = DateTime.local()) {
  const weekdayToCheck = dateTime.weekday;
  const timeRangeToCheck = openingTimes[weekdayToCheck - 1];

  if (timeRangeToCheck === rangeTypes.CLOSED) {
    return false;
  }

  if (!timeRangeToCheck) {
    return null;
  }

  // if times are the same we can assume 24 hour opening
  if (timeRangeToCheck[0] === timeRangeToCheck[1]) {
    return true;
  }

  const genericDate = DateTime.local();

  const startHoursAndMinutes = timeRangeToCheck[0].split(':');
  const startDateTime = genericDate.set({
    hours: startHoursAndMinutes[0],
    minutes: startHoursAndMinutes[1],
    weekday: weekdayToCheck,
  });

  const endHoursAndMinutes = timeRangeToCheck[1].split(':');
  const endDateTime = genericDate.set({
    hours: endHoursAndMinutes[0],
    minutes: endHoursAndMinutes[1],
    weekday: weekdayToCheck,
  });

  const interval = Interval.fromDateTimes(startDateTime, endDateTime);

  if (interval.contains(dateTime)) {
    return true;
  }

  return false;
}

module.exports = {
  rangeTypes,
  WEEKDAYS,
  getIsOpen,
};
