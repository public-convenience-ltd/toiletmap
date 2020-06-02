import { gql } from '@apollo/client';

const resolvers = {
  Mutation: {
    updateCenter: (_root, { lat, lng }, { cache }) => {
      const query = gql`
        query {
          mapCenter @client {
            lat
            lng
          }
        }
      `;

      const data = {
        mapCenter: {
          __typename: 'Point',
          lat,
          lng,
        },
      };

      cache.writeQuery({ query, data });

      return true;
    },
    updateZoom: (_root, { zoom }, { cache }) => {
      const query = gql`
        query {
          mapZoom @client
        }
      `;

      const data = {
        mapZoom: zoom,
      };

      cache.writeQuery({ query, data });

      return true;
    },
    updateGeolocation: (_root, { lat, lng }, { cache }) => {
      const query = gql`
        query {
          geolocation @client {
            lat
            lng
          }
        }
      `;

      if (!lat || !lng) {
        cache.writeQuery({ query, data: { geolocation: null } });
        return true;
      }

      const data = {
        geolocation: {
          __typename: 'Point',
          lat,
          lng,
        },
      };

      cache.writeQuery({ query, data });

      return true;
    },
    updateRadius: (_root, { radius }, { cache }) => {
      const query = gql`
        query {
          mapRadius @client
        }
      `;

      const data = {
        mapRadius: radius,
      };

      cache.writeQuery({ query, data });

      return true;
    },
  },
};

// No validation is done with this, but it allows us an overview of how
// we are handling the local state
const typeDefs = gql`
  extend type Query {
    mapCenter: Point!
    mapZoom: Number!
    geolocation: Point
  }

  extend type Mutation {
    updateCenter(lat: Number!, lng: Number!): Boolean
    updateZoom(zoom: Number!): Boolean
    updateGeolocation(lat: Number, lng: Number): Boolean
    toggleViewMode: Boolean
  }

  type Point {
    lat: Number!
    lng: Number!
  }
`;

export default {
  resolvers,
  typeDefs,
};
