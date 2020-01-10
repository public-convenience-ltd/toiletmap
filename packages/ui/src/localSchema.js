import { gql } from '@apollo/client';

const resolvers = {
  Mutation: {
    updateCenter: (_root, { lat, lng }, { cache }) => {
      console.log('mutate update center:', lat, lng);
      const newData = {
        mapControls: {
          center: {
            lat,
            lng,
          },
        },
      };
      cache.writeData({
        data: newData,
      });
      console.log('done update location');
      return true;
    },
    updateZoom: (_root, { zoom }, { cache }) => {
      console.log('mutate update zoom:', zoom);
      const newData = {
        mapControls: {
          zoom,
        },
      };
      cache.writeData({
        data: newData,
      });
      console.log('done update zoom');
      return true;
    },
    toggleViewMode: (_root, vars, { cache }) => {
      const { mapControls } = cache.readQuery({
        query: gql`
          {
            mapControls {
              viewMap
            }
          }
        `,
      });
      const newData = {
        mapControls: {
          viewMap: !mapControls.viewMap,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
    loginUser: (_root, { name }, { cache }) => {
      const newData = {
        userData: {
          name,
          loggedIn: true,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
    logoutUser: (_root, vars, { cache }) => {
      const newData = {
        userData: {
          name: null,
          loggedIn: false,
        },
      };
      cache.writeData({
        data: newData,
      });
      return true;
    },
  },
};

// No validation is done with this, but it allows us an overview of how
// we are handling the local state
const typeDefs = gql`
  extend type Mutation {
    updateCenter(lat: Number!, lng: Number!): Boolean
    updateZoom(zoom: Number!): Boolean
    toggleViewMode: Boolean
    loginUser(name: String!): Boolean
    logoutUser: Boolean
  }

  type MapControls {
    zoom: Number!
    center: Point!
    viewMap: Boolean!
  }

  type Point {
    lat: Number!
    lng: Number!
  }

  type UserData {
    loggedIn: Boolean!
    name: String
  }
`;

export default {
  resolvers,
  typeDefs,
};
