const { DateTime, Info, Interval } = require('luxon');

const rangeTypes = {
  UNKNOWN: 'UNKNOWN',
  CLOSED: 'CLOSED',
};

const WEEKDAYS = Info.weekdays();

const definitions = [
  {
    name: '24/7',
    value: '24/7',
    openingTimes: WEEKDAYS.map((day, i) => ['00:00', '23:59']),
  },
  {
    name: 'Business hours, Mon-Sun',
    value: '09:00-17:00',
    openingTimes: WEEKDAYS.map((day, i) => ['09:00', '17:00']),
  },
  {
    name: 'Business hours, Mon-Fri',
    value: 'Mo-Fr 09:00-17:00',
    openingTimes: WEEKDAYS.map((day, i) => {
      if (i > 4) {
        return rangeTypes.CLOSED;
      }
      return ['09:00', '17:00'];
    }),
  },
  {
    name: 'Evening only',
    value: '17:00-00:00',
    openingTimes: WEEKDAYS.map((day, i) => ['17:00', '00:00']),
  },
  {
    name: 'Daylight hours only',
    value: '09:00-18:00',
    openingTimes: WEEKDAYS.map((day, i) => ['09:00', '18:00']),
  },
];

function getIsOpen(openingTimes = [], dateTime = DateTime.local()) {
  const weekdayToCheck = dateTime.weekday;
  const timeRangeToCheck = openingTimes[weekdayToCheck - 1];

  if (timeRangeToCheck === rangeTypes.CLOSED) {
    return false;
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

const getOpeningTimes = (definitionValue) => {
  const definition = definitions.find((d) => d.value === definitionValue);

  if (!definition) {
    return WEEKDAYS.map(() => rangeTypes.UNKNOWN);
  }

  return definition.openingTimes;
};

module.exports = {
  definitions,
  rangeTypes,
  WEEKDAYS,
  getIsOpen,
  getOpeningTimes,
};
