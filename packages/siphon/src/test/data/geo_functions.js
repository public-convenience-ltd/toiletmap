module.exports = {
  removeBoundWrapAround: {
    // no wrap around is needed for these values
    toNotAlter: [
      {
        min: {
          lat: -90,
          lng: -180,
        },
        max: {
          lat: 90,
          lng: 180,
        },
      },
      {
        min: {
          lat: -45,
          lng: -90,
        },
        max: {
          lat: 45,
          lng: 90,
        },
      },
      {
        min: {
          lat: 12,
          lng: 34,
        },
        max: {
          lat: 56,
          lng: 78,
        },
      },
    ],
    toWrapAround: {
      // note that, when testing, the order of the "after" results does not matter
      lat: {
        // the latitude wraps around the Earth
        before: {
          min: {
            lat: 80,
            lng: 10,
          },
          max: {
            lat: -10,
            lng: 20,
          },
        },
        // ...and so it can be represented as two non-wrapping bounds
        after: [
          {
            min: {
              lat: -90,
              lng: 10,
            },
            max: {
              lat: -10,
              lng: 20,
            },
          },
          {
            min: {
              lat: 80,
              lng: 10,
            },
            max: {
              lat: 90,
              lng: 20,
            },
          },
        ],
      },
      lng: {
        // the longitude wraps around the Earth
        before: {
          min: {
            lat: 10,
            lng: 170,
          },
          max: {
            lat: 20,
            lng: -10,
          },
        },
        // ...and so it can be represented as two non-wrapping bounds
        after: [
          {
            min: {
              lat: 10,
              lng: -180,
            },
            max: {
              lat: 20,
              lng: -10,
            },
          },
          {
            min: {
              lat: 10,
              lng: 170,
            },
            max: {
              lat: 20,
              lng: 180,
            },
          },
        ],
      },
      both: {
        // the latitude AND longitude wraps around the Earth
        before: {
          min: {
            lat: 80,
            lng: 170,
          },
          max: {
            lat: -10,
            lng: -10,
          },
        },
        // ...and so it must be represented as FOUR non-wrapping bounds
        after: [
          {
            min: {
              lat: 80,
              lng: 170,
            },
            max: {
              lat: 90,
              lng: 180,
            },
          },
          {
            min: {
              lat: 80,
              lng: -180,
            },
            max: {
              lat: 90,
              lng: -10,
            },
          },
          {
            min: {
              lat: -90,
              lng: 170,
            },
            max: {
              lat: -10,
              lng: 180,
            },
          },
          {
            min: {
              lat: -90,
              lng: -180,
            },
            max: {
              lat: -10,
              lng: -10,
            },
          },
        ],
      },
    },
  },
};
