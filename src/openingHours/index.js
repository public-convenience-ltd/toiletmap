const { DateTime, Info, Interval } = require('luxon');

const weekdays = Info.weekdays();
const today = DateTime.local().startOf('day');

const definitions = [
  {
    name: '24/7',
    value: '24/7',
    openingTimes: weekdays.map((day, i) => {
      const startOfDay = today.set({ weekday: i + 1 });

      const start = startOfDay.set({ hours: 0, minutes: 0 });
      const end = startOfDay.set({ hours: 23, minutes: 59 });

      return {
        day,
        interval: Interval.fromDateTimes(start, end),
      };
    }),
  },
  {
    name: 'Business hours, Mon-Sun',
    value: '09:00-17:00',
    openingTimes: weekdays.map((day, i) => {
      const startOfDay = today.set({ weekday: i + 1 });

      const start = startOfDay.set({ hours: 9, minutes: 0 });
      const end = startOfDay.set({ hours: 17, minutes: 0 });

      return {
        day,
        interval: Interval.fromDateTimes(start, end),
      };
    }),
  },
  {
    name: 'Business hours, Mon-Fri',
    value: 'Mo-Fr 09:00-17:00',
    openingTimes: weekdays.map((day, i) => {
      const startOfDay = today.set({ weekday: i + 1 });

      // if toilet is closed, return Interval with length 0
      if (i > 4) {
        return {
          day,
          interval: Interval.fromDateTimes(startOfDay, startOfDay),
        };
      }

      const start = startOfDay.set({ hours: 9, minutes: 0 });
      const end = startOfDay.set({ hours: 17, minutes: 0 });

      return {
        day,
        interval: Interval.fromDateTimes(start, end),
      };
    }),
  },
  {
    name: 'Evening only',
    value: '17:00-00:00',
    openingTimes: weekdays.map((day, i) => {
      const startOfDay = today.set({ weekday: i + 1 });

      const start = startOfDay.set({ hours: 17, minutes: 0 });
      const end = startOfDay.set({ hours: 23, minutes: 59 });

      return {
        day,
        interval: Interval.fromDateTimes(start, end),
      };
    }),
  },
  {
    name: 'Daylight hours only',
    value: '09:00-18:00',
    openingTimes: weekdays.map((day, i) => {
      const startOfDay = today.set({ weekday: i + 1 });

      const start = startOfDay.set({ hours: 9, minutes: 0 });
      const end = startOfDay.set({ hours: 18, minutes: 0 });

      return {
        day,
        interval: Interval.fromDateTimes(start, end),
      };
    }),
  },
];

function getIntervalLabel(interval) {
  if (!interval) {
    return 'Unknown';
  }

  // toilets are closed if Interval has length of 0
  if (interval.length() === 0) {
    return 'Closed';
  }

  return interval.toFormat('T');
}

const getOpeningTimes = (definitionValue) => {
  const definition = definitions.find((d) => d.value === definitionValue);

  if (!definition) {
    return weekdays.map((day) => ({
      day,
      interval: null,
    }));
  }

  return definition.openingTimes;
};

module.exports = {
  definitions,
  getIntervalLabel,
  getOpeningTimes,
};
