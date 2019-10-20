const { gql } = require('apollo-server');

const typeDefs = gql`
  scalar DateTime

  directive @auth(requires: Permission) on OBJECT | FIELD_DEFINITION
  directive @redact(requires: Permission, replace: String) on FIELD_DEFINITION

  enum Permission {
    SUBMIT_REPORT
    MODERATE_REPORT
    VIEW_CONTRIBUTOR_INFO
  }

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

  enum SortOrder {
    NEWEST_FIRST
    OLDEST_FIRST
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
      @redact(requires: VIEW_CONTRIBUTOR_INFO, replace: Anonymous)
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

  """
  A container type for various statistical counters
  """
  type Counters {
    "The number of loos that are still open"
    activeLoos: Int
    "The number of loos which have been closed/removed"
    inactiveLoos: Int
    "The total number of loos"
    totalLoos: Int
    "The total number of reports"
    totalReports: Int
    "The total number of reports that report a loo as closed/removed"
    removalReports: Int
    "The number of loos which have more than one report registered for them"
    multipleReports: Int
  }

  """
  A piece of proportional data, with a name and a value
  """
  type Chunk {
    name: String!
    value: Int!
  }

  """
  Proportions of different values for different attributes
  """
  type Proportions {
    "The proportions of loos that are active vs removed"
    activeLoos: [Chunk!]!
    "The proportions of loos that are public vs restricted access"
    publicLoos: [Chunk!]!
    "The proportions of loos that have baby changing facilities vs those that don't"
    babyChanging: [Chunk!]!
    "The proportions of loos that are accessible vs not accessible"
    accessibleLoos: [Chunk!]!
  }

  """
  Statistics for a certain area.
  """
  type AreaStats {
    "The area's identifier. Note that only the \`name\` will be passed with this field."
    area: AdminGeo!
    "The total number of loos in this area"
    totalLoos: Int!
    "The number of loos marked as active in this area"
    activeLoos: Int!
    "The number of loos marked as public access in this area"
    publicLoos: Int!
    "The number of loos marked with permissive access in this area"
    permissiveLoos: Int!
    "The number of loos with baby changing facilities in this area"
    babyChangeLoos: Int!
  }

  """
  The name of a contributor. This requires a certain level of permissions to access.
  """
  type AuthedContributor {
    name: String! @redact(requires: VIEW_CONTRIBUTOR_INFO, replace: "Anonymous")
  }

  type Query {
    "Retrieve a Loo by ID"
    loo(id: ID): Loo
    "Search for loos matching a filter"
    loos(
      filters: LooFilter!
      pagination: PaginationInput = { limit: 10, page: 1 }
      sort: SortOrder = NEWEST_FIRST
    ): LooSearchResponse!
    "Retrieve a list of areas in existance"
    areas: [AdminGeo!]!
    "Retrieve Loos by proximity to a Point"
    loosByProximity(
      "A Point from which to begin the search"
      from: ProximityInput!
    ): [Loo!]!
    "Retrieve 'counter' statistics"
    counters: Counters!
    "Retrieve proportional statistics"
    proportions: Proportions!
    "Retrieve statistics, broken down by area, for all areas"
    areaStats: [AreaStats!]!
    "Retrieve a list of contributors. Requires correct authentication"
    contributors: [AuthedContributor!]!
  }

  "Include or Exclude Loos from search results based on whether they satisfy a filter condition"
  input LooFilter {
    active: Boolean = true
    fee: Boolean
    text: String
    fromDate: DateTime
    toDate: DateTime
    contributors: [String]
    areaName: String
  }

  input PaginationInput {
    limit: Int = 10
    page: Int = 1
  }

  type LooSearchResponse {
    loos: [Loo!]!
    total: Int
    page: Int
    limit: Int
    pages: Int
  }

  input ProximityInput {
    "Latitude"
    lat: Float!
    "Longitude"
    lng: Float!
    "Maximum Distance in meters"
    maxDistance: Int = 1000
  }

  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  input PointInput {
    lat: Float!
    lng: Float!
  }

  input ReportInput {
    edit: ID
    location: PointInput!
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
  }

  input RemovalReportInput {
    edit: ID!
    reason: String!
  }

  type ReportMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    report: Report
    loo: Loo
  }

  type Mutation @auth(requires: SUBMIT_REPORT) {
    submitReport(report: ReportInput): ReportMutationResponse
    submitRemovalReport(report: RemovalReportInput): ReportMutationResponse
  }
`;

module.exports = typeDefs;
