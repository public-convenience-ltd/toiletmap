const { gql } = require('apollo-server');
const config = require('../config/config');
const { Loo, Report } = require('../db')(config.mongo.url);
const { GraphQLDateTime } = require('graphql-iso-date');

const typeDefs = gql`
  scalar DateTime

  """
  A Geographical Point

  Expressed in WGS84 coordinates (SRID 4326).
  """
  type Point {
    "Latitude"
    lat: Float!
    "Longitude"
    lng: Float!
  }

  """
  A unit of Administrative Geography

  e.g. a district council
  """
  type AdminGeo {
    name: String
    type: String
  }

  """
  A Toilet

  The data representing a toilet is computed from its **Report**s
  """
  type Loo {
    id: ID
    createdAt: DateTime
    updatedAt: DateTime
    reports: [Report]
    active: Boolean
    location: Point
    area: [AdminGeo]
    name: String
    access: AccessPermission
    opening: String
    type: Facilities
    accessibleType: Facilities
    babyChange: Boolean
    radar: Boolean
    attended: Boolean
    automatic: Boolean
    fee: String
    notes: String
    removalReason: String
  }

  enum AccessPermission {
    PUBLIC
    PERMISSIVE
    CUSTOMERS_ONLY
    PRIVATE
  }

  enum Facilities {
    FEMALE
    MALE
    FEMALE_AND_MALE
    UNISEX
    MALE_URINAL
    CHILDREN
    NONE
  }

  """
  Reported information about a real-world toilet

  Reports are submitted by contributors or created as part of data imports
  A report can refer to another report (via the **previous** field) to indicate that it is intended to augment or adjust an exisitn Loo
  """
  type Report {
    id: ID!
    "An identifier for the user or process which contributed the report"
    contributor: String!
    "When the report was added to the system"
    createdAt: DateTime!
    """
    A link to the previous report in the chain
    This is nullable since this might be the first report about a particular toilet
    """
    previous: Report
    active: Boolean
    location: Point
    area: [AdminGeo]
    name: String
    access: AccessPermission
    opening: String
    type: Facilities
    accessibleType: Facilities
    babyChange: Boolean
    radar: Boolean
    attended: Boolean
    automatic: Boolean
    fee: String
    notes: String
    removalReason: String
    "The Loo which uses the data submitted in this report"
    loo: Loo
  }

  type Query {
    "Retrieve a Loo by ID"
    loo(id: ID): Loo
    "Retrieve Loos by proximity to a Point"
    loosByProximity(
      "A Point from which to begin the search"
      from: ProximityInput!
    ): [Loo]
  }

  input ProximityInput {
    "Latitude"
    lat: Float!
    "Longitude"
    lng: Float!
    "Maximum Distance in meters"
    maxDistance: Int = 1000
  }
`;

const subPropertyResolver = property => (parent, args, context, info) =>
  parent[property][info.fieldName];
const looInfoResolver = property => {
  let resolve = subPropertyResolver(property);
  return {
    active: resolve,
    area: resolve,
    name: resolve,
    access: resolve,
    opening: resolve,
    type: resolve,
    accessibleType: resolve,
    babyChange: resolve,
    radar: resolve,
    attended: resolve,
    automatic: resolve,
    fee: resolve,
    notes: resolve,
    removalReason: resolve,
  };
};

const resolvers = {
  Query: {
    loo: (parent, args) => Loo.findById(args.id),
    loosByProximity: (parent, args) =>
      Loo.findNear(
        args.from.lng,
        args.from.lat,
        args.from.maxDistance,
        'complete'
      ),
  },

  Report: {
    id: r => r._id.toString(),
    previous: r => Report.findById(r.previous),
    location: r => ({
      lng: r.diff.geometry.coordinates[0],
      lat: r.diff.geometry.coordinates[1],
    }),
    ...looInfoResolver('diff'),
    loo: r => r.getLoo(),
  },

  Loo: {
    id: l => l._id.toString(),
    reports: l =>
      Report.find()
        .where('_id')
        .in(l.reports)
        .exec(),
    location: l => ({
      lng: l.properties.geometry.coordinates[0],
      lat: l.properties.geometry.coordinates[1],
    }),
    ...looInfoResolver('properties'),
  },

  DateTime: GraphQLDateTime,

  AccessPermission: {
    PUBLIC: 'public',
    PERMISSIVE: 'permissive',
    CUSTOMERS_ONLY: 'customers only',
    PRIVATE: 'none',
  },

  Facilities: {
    FEMALE: 'female',
    MALE: 'male',
    FEMALE_AND_MALE: 'female and male',
    UNISEX: 'unisex',
    MALE_URINAL: 'male urinal',
    CHILDREN: 'children only',
    NONE: 'none',
  },
};

module.exports = {
  typeDefs,
  resolvers,
};
