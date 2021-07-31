import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  OpeningTimes: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

/**
 * A unit of Administrative Geography
 *
 * e.g. a district council
 */
export type AdminGeo = {
  __typename?: 'AdminGeo';
  name?: Maybe<Scalars['String']>;
  type?: Maybe<Scalars['String']>;
};

/** Statistics for a certain area. */
export type AreaStats = {
  __typename?: 'AreaStats';
  /** The area's identifier. Note that only the `name` will be passed with this field. */
  area: AdminGeo;
  /** The total number of loos in this area */
  totalLoos: Scalars['Int'];
  /** The number of loos marked as active in this area */
  activeLoos: Scalars['Int'];
  /** The number of loos with baby changing facilities in this area */
  babyChangeLoos: Scalars['Int'];
};

/** The name of a contributor. This requires a certain level of permissions to access. */
export type AuthedContributor = {
  __typename?: 'AuthedContributor';
  name: Scalars['String'];
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

/** A piece of proportional data, with a name and a value */
export type Chunk = {
  __typename?: 'Chunk';
  name: Scalars['String'];
  value: Scalars['Int'];
};

/** A container type for various statistical counters */
export type Counters = {
  __typename?: 'Counters';
  /** The number of loos that are still open */
  activeLoos?: Maybe<Scalars['Int']>;
  /** The number of loos which have been closed/removed */
  inactiveLoos?: Maybe<Scalars['Int']>;
  /** The total number of loos */
  totalLoos?: Maybe<Scalars['Int']>;
  /** The total number of reports */
  totalReports?: Maybe<Scalars['Int']>;
  /** The total number of reports that report a loo as closed/removed */
  removalReports?: Maybe<Scalars['Int']>;
  /** The number of loos which have more than one report registered for them */
  multipleReports?: Maybe<Scalars['Int']>;
};


/**
 * A Toilet
 *
 * The data representing a toilet is computed from its **Report**s
 */
export type Loo = {
  __typename?: 'Loo';
  id?: Maybe<Scalars['ID']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  verifiedAt?: Maybe<Scalars['DateTime']>;
  reports?: Maybe<Array<Maybe<Report>>>;
  active?: Maybe<Scalars['Boolean']>;
  location?: Maybe<Point>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  name?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  accessible?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  men?: Maybe<Scalars['Boolean']>;
  women?: Maybe<Scalars['Boolean']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  radar?: Maybe<Scalars['Boolean']>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  paymentDetails?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  removalReason?: Maybe<Scalars['String']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
};

/** Include or Exclude Loos from search results based on whether they satisfy a filter condition */
export type LooFilter = {
  active?: Maybe<Scalars['Boolean']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  text?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['DateTime']>;
  toDate?: Maybe<Scalars['DateTime']>;
  contributors?: Maybe<Array<Maybe<Scalars['String']>>>;
  areaName?: Maybe<Scalars['String']>;
};

export type LooSearchResponse = {
  __typename?: 'LooSearchResponse';
  loos: Array<Loo>;
  total?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  limit?: Maybe<Scalars['Int']>;
  pages?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  submitReport?: Maybe<ReportMutationResponse>;
  submitRemovalReport?: Maybe<ReportMutationResponse>;
  submitVerificationReport?: Maybe<ReportMutationResponse>;
};


export type MutationSubmitReportArgs = {
  report?: Maybe<ReportInput>;
};


export type MutationSubmitRemovalReportArgs = {
  report?: Maybe<RemovalReportInput>;
};


export type MutationSubmitVerificationReportArgs = {
  id?: Maybe<Scalars['ID']>;
};

export type MutationResponse = {
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
};


export type PaginationInput = {
  limit?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
};

export enum Permission {
  SubmitReport = 'SUBMIT_REPORT',
  ModerateReport = 'MODERATE_REPORT',
  ViewContributorInfo = 'VIEW_CONTRIBUTOR_INFO'
}

/**
 * A Geographical Point
 *
 * Expressed in WGS84 coordinates (SRID 4326).
 */
export type Point = {
  __typename?: 'Point';
  /** Latitude */
  lat: Scalars['Float'];
  /** Longitude */
  lng: Scalars['Float'];
};

export type PointInput = {
  lat: Scalars['Float'];
  lng: Scalars['Float'];
};

/** Proportions of different values for different attributes */
export type Proportions = {
  __typename?: 'Proportions';
  /** The proportions of loos that are active vs removed */
  activeLoos: Array<Chunk>;
  /** The proportions of loos that have baby changing facilities vs those that don't */
  babyChanging: Array<Chunk>;
  /** The proportions of loos that are accessible vs not accessible */
  accessibleLoos: Array<Chunk>;
};

export type ProximityInput = {
  /** Latitude */
  lat: Scalars['Float'];
  /** Longitude */
  lng: Scalars['Float'];
  /** Maximum Distance in meters */
  maxDistance?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve a Loo by ID */
  loo?: Maybe<Loo>;
  /** Search for loos matching a filter */
  loos: LooSearchResponse;
  /** Retrieve Loos by proximity to a Point */
  loosByProximity: Array<Loo>;
  /** Retrieve a list of areas in existance, name and type only */
  areas: Array<AdminGeo>;
  /** Retrieve the explorer map TopoJSON data */
  mapAreas?: Maybe<TopoGeo>;
  /** Retrieve a report by ID */
  report?: Maybe<Report>;
  /** Retrieve 'counter' statistics */
  counters: Counters;
  /** Retrieve proportional statistics */
  proportions: Proportions;
  /** Retrieve statistics, broken down by area, for all areas */
  areaStats: Array<AreaStats>;
  /** Retrieve a list of contributors. Requires correct authentication */
  contributors: Array<AuthedContributor>;
};


export type QueryLooArgs = {
  id?: Maybe<Scalars['ID']>;
};


export type QueryLoosArgs = {
  filters: LooFilter;
  pagination?: Maybe<PaginationInput>;
  sort?: Maybe<SortOrder>;
};


export type QueryLoosByProximityArgs = {
  from: ProximityInput;
};


export type QueryMapAreasArgs = {
  areaType?: Maybe<Scalars['String']>;
};


export type QueryReportArgs = {
  id: Scalars['ID'];
};

export type RemovalReportInput = {
  edit: Scalars['ID'];
  reason: Scalars['String'];
};

/**
 * Reported information about a real-world toilet
 *
 * Reports are submitted by contributors or created as part of data imports
 * A report can refer to another report (via the **previous** field) to indicate
 * that it is intended to augment or adjust an exisitn Loo
 */
export type Report = {
  __typename?: 'Report';
  id: Scalars['ID'];
  /** An identifier for the user or process which contributed the report */
  contributor: Scalars['String'];
  /** When the report was added to the system */
  createdAt: Scalars['DateTime'];
  verifiedAt?: Maybe<Scalars['DateTime']>;
  /**
   * A link to the previous report in the chain
   * This is nullable since this might be the first report about a particular toilet
   */
  previous?: Maybe<Report>;
  active?: Maybe<Scalars['Boolean']>;
  location?: Maybe<Point>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  name?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  accessible?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  men?: Maybe<Scalars['Boolean']>;
  women?: Maybe<Scalars['Boolean']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  radar?: Maybe<Scalars['Boolean']>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  paymentDetails?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  removalReason?: Maybe<Scalars['String']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
  /** The Loo which uses the data submitted in this report */
  loo?: Maybe<Loo>;
};

export type ReportInput = {
  edit?: Maybe<Scalars['ID']>;
  location: PointInput;
  name?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  accessible?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  men?: Maybe<Scalars['Boolean']>;
  women?: Maybe<Scalars['Boolean']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  radar?: Maybe<Scalars['Boolean']>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  paymentDetails?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
};

export type ReportMutationResponse = MutationResponse & {
  __typename?: 'ReportMutationResponse';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  message: Scalars['String'];
  report?: Maybe<Report>;
  loo?: Maybe<Loo>;
};

export enum SortOrder {
  NewestFirst = 'NEWEST_FIRST',
  OldestFirst = 'OLDEST_FIRST'
}

/** Main TopoJSON type. Contains various objects and arcs. */
export type TopoGeo = {
  __typename?: 'TopoGeo';
  type: Scalars['String'];
  transform?: Maybe<TopoTransform>;
  objects: Array<TopoObjectContainer>;
  arcs: Array<Array<Array<Scalars['Float']>>>;
};

export type TopoGeometry = {
  __typename?: 'TopoGeometry';
  type: Scalars['String'];
  arcs: Array<Array<Array<Scalars['Float']>>>;
  /** JSON-encoded properties string */
  properties: Scalars['String'];
};

export type TopoObject = {
  __typename?: 'TopoObject';
  type: Scalars['String'];
  geometries: Array<TopoGeometry>;
};

export type TopoObjectContainer = {
  __typename?: 'TopoObjectContainer';
  name: Scalars['String'];
  value: TopoObject;
};

/** A whole load of TopoJSON stuff follows */
export type TopoTransform = {
  __typename?: 'TopoTransform';
  scale: Array<Scalars['Float']>;
  translate: Array<Scalars['Float']>;
};


export type GetAreaStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAreaStatsQuery = (
  { __typename?: 'Query' }
  & { areaStats: Array<(
    { __typename?: 'AreaStats' }
    & Pick<AreaStats, 'totalLoos' | 'activeLoos' | 'babyChangeLoos'>
    & { meta: (
      { __typename?: 'AdminGeo' }
      & Pick<AdminGeo, 'name'>
    ) }
  )> }
);

export type ChunkDetailsFragment = (
  { __typename?: 'Chunk' }
  & Pick<Chunk, 'name' | 'value'>
);

export type HeadlineStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type HeadlineStatsQuery = (
  { __typename?: 'Query' }
  & { counters: (
    { __typename?: 'Counters' }
    & Pick<Counters, 'activeLoos' | 'inactiveLoos' | 'totalLoos' | 'totalReports' | 'removalReports' | 'multipleReports'>
  ), proportions: (
    { __typename?: 'Proportions' }
    & { activeLoos: Array<(
      { __typename?: 'Chunk' }
      & ChunkDetailsFragment
    )>, babyChanging: Array<(
      { __typename?: 'Chunk' }
      & ChunkDetailsFragment
    )>, accessibleLoos: Array<(
      { __typename?: 'Chunk' }
      & ChunkDetailsFragment
    )> }
  ) }
);

export type FullLooDetailsQueryVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
}>;


export type FullLooDetailsQuery = (
  { __typename?: 'Query' }
  & { loo?: Maybe<(
    { __typename?: 'Loo' }
    & Pick<Loo, 'id' | 'name' | 'active' | 'openingTimes' | 'accessible' | 'men' | 'women' | 'children' | 'babyChange' | 'radar' | 'attended' | 'noPayment' | 'paymentDetails' | 'notes' | 'removalReason'>
    & { area?: Maybe<Array<Maybe<(
      { __typename?: 'AdminGeo' }
      & Pick<AdminGeo, 'name' | 'type'>
    )>>>, location?: Maybe<(
      { __typename?: 'Point' }
      & Pick<Point, 'lat' | 'lng'>
    )>, reports?: Maybe<Array<Maybe<(
      { __typename?: 'Report' }
      & Pick<Report, 'id' | 'contributor' | 'createdAt' | 'active' | 'openingTimes' | 'accessible' | 'babyChange' | 'radar' | 'attended' | 'noPayment' | 'paymentDetails' | 'notes' | 'removalReason'>
      & { location?: Maybe<(
        { __typename?: 'Point' }
        & Pick<Point, 'lat' | 'lng'>
      )> }
    )>>> }
  )> }
);

export type GetAreasQueryVariables = Exact<{
  areaType?: Maybe<Scalars['String']>;
}>;


export type GetAreasQuery = (
  { __typename?: 'Query' }
  & { mapAreas?: Maybe<(
    { __typename?: 'TopoGeo' }
    & Pick<TopoGeo, 'type' | 'arcs'>
    & { objects: Array<(
      { __typename?: 'TopoObjectContainer' }
      & Pick<TopoObjectContainer, 'name'>
      & { value: (
        { __typename?: 'TopoObject' }
        & Pick<TopoObject, 'type'>
        & { geometries: Array<(
          { __typename?: 'TopoGeometry' }
          & Pick<TopoGeometry, 'type' | 'arcs' | 'properties'>
        )> }
      ) }
    )> }
  )> }
);

export type GetStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetStatsQuery = (
  { __typename?: 'Query' }
  & { areaStats: Array<(
    { __typename?: 'AreaStats' }
    & Pick<AreaStats, 'totalLoos' | 'activeLoos' | 'babyChangeLoos'>
    & { area: (
      { __typename?: 'AdminGeo' }
      & Pick<AdminGeo, 'name' | 'type'>
    ) }
  )> }
);

export type GetFormAreasQueryVariables = Exact<{ [key: string]: never; }>;


export type GetFormAreasQuery = (
  { __typename?: 'Query' }
  & { items: Array<(
    { __typename?: 'AdminGeo' }
    & { label: AdminGeo['name'] }
  )> }
);

export type GetContributorsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetContributorsQuery = (
  { __typename?: 'Query' }
  & { items: Array<(
    { __typename?: 'AuthedContributor' }
    & { label: AuthedContributor['name'] }
  )> }
);

export type SearchQueryVariables = Exact<{
  rows?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
  text?: Maybe<Scalars['String']>;
  order?: Maybe<SortOrder>;
  areaName?: Maybe<Scalars['String']>;
  fromDate?: Maybe<Scalars['DateTime']>;
  toDate?: Maybe<Scalars['DateTime']>;
  contributor?: Maybe<Scalars['String']>;
}>;


export type SearchQuery = (
  { __typename?: 'Query' }
  & { loos: (
    { __typename?: 'LooSearchResponse' }
    & Pick<LooSearchResponse, 'total' | 'page'>
    & { loos: Array<(
      { __typename?: 'Loo' }
      & Pick<Loo, 'id' | 'name' | 'updatedAt' | 'openingTimes'>
      & { area?: Maybe<Array<Maybe<(
        { __typename?: 'AdminGeo' }
        & Pick<AdminGeo, 'name' | 'type'>
      )>>>, reports?: Maybe<Array<Maybe<(
        { __typename?: 'Report' }
        & Pick<Report, 'contributor'>
      )>>> }
    )> }
  ) }
);

export type FindLooByIdQueryVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
}>;


export type FindLooByIdQuery = (
  { __typename?: 'Query' }
  & { loo?: Maybe<(
    { __typename?: 'Loo' }
    & LooFragmentFragment
  )> }
);

export type LooFragmentFragment = (
  { __typename?: 'Loo' }
  & Pick<Loo, 'id' | 'createdAt' | 'updatedAt' | 'verifiedAt' | 'active' | 'name' | 'openingTimes' | 'accessible' | 'men' | 'women' | 'allGender' | 'babyChange' | 'children' | 'urinalOnly' | 'radar' | 'automatic' | 'noPayment' | 'paymentDetails' | 'notes' | 'removalReason' | 'attended' | 'campaignUOL'>
  & { location?: Maybe<(
    { __typename?: 'Point' }
    & Pick<Point, 'lat' | 'lng'>
  )> }
);

export type RemoveLooMutationVariables = Exact<{
  id: Scalars['ID'];
  reason: Scalars['String'];
}>;


export type RemoveLooMutation = (
  { __typename?: 'Mutation' }
  & { submitRemovalReport?: Maybe<(
    { __typename?: 'ReportMutationResponse' }
    & Pick<ReportMutationResponse, 'code' | 'success'>
    & { loo?: Maybe<(
      { __typename?: 'Loo' }
      & Pick<Loo, 'id' | 'active' | 'removalReason'>
    )> }
  )> }
);

export type UpdateLooMutationVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
  location: PointInput;
  name?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  accessible?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  men?: Maybe<Scalars['Boolean']>;
  women?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  radar?: Maybe<Scalars['Boolean']>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  paymentDetails?: Maybe<Scalars['String']>;
  notes?: Maybe<Scalars['String']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
}>;


export type UpdateLooMutation = (
  { __typename?: 'Mutation' }
  & { submitReport?: Maybe<(
    { __typename?: 'ReportMutationResponse' }
    & Pick<ReportMutationResponse, 'code' | 'success' | 'message'>
    & { loo?: Maybe<(
      { __typename?: 'Loo' }
      & LooFragmentFragment
    )> }
  )> }
);

export const ChunkDetailsFragmentDoc = gql`
    fragment chunkDetails on Chunk {
  name
  value
}
    `;
export const LooFragmentFragmentDoc = gql`
    fragment LooFragment on Loo {
  id
  createdAt
  updatedAt
  verifiedAt
  active
  location {
    lat
    lng
  }
  name
  openingTimes
  accessible
  men
  women
  allGender
  babyChange
  children
  urinalOnly
  radar
  automatic
  noPayment
  paymentDetails
  notes
  removalReason
  attended
  campaignUOL
}
    `;
export const GetAreaStatsDocument = gql`
    query getAreaStats {
  areaStats {
    meta: area {
      name
    }
    totalLoos
    activeLoos
    babyChangeLoos
  }
}
    `;
export type GetAreaStatsQueryResult = Apollo.QueryResult<GetAreaStatsQuery, GetAreaStatsQueryVariables>;
export const HeadlineStatsDocument = gql`
    query headlineStats {
  counters {
    activeLoos
    inactiveLoos
    totalLoos
    totalReports
    removalReports
    multipleReports
  }
  proportions {
    activeLoos {
      ...chunkDetails
    }
    babyChanging {
      ...chunkDetails
    }
    accessibleLoos {
      ...chunkDetails
    }
  }
}
    ${ChunkDetailsFragmentDoc}`;
export type HeadlineStatsQueryResult = Apollo.QueryResult<HeadlineStatsQuery, HeadlineStatsQueryVariables>;
export const FullLooDetailsDocument = gql`
    query fullLooDetails($id: ID) {
  loo(id: $id) {
    id
    name
    area {
      name
      type
    }
    location {
      lat
      lng
    }
    active
    openingTimes
    accessible
    men
    women
    children
    babyChange
    radar
    attended
    noPayment
    paymentDetails
    notes
    removalReason
    reports {
      id
      contributor
      createdAt
      active
      openingTimes
      accessible
      babyChange
      radar
      attended
      noPayment
      paymentDetails
      notes
      removalReason
      location {
        lat
        lng
      }
    }
  }
}
    `;
export type FullLooDetailsQueryResult = Apollo.QueryResult<FullLooDetailsQuery, FullLooDetailsQueryVariables>;
export const GetAreasDocument = gql`
    query getAreas($areaType: String) {
  mapAreas(areaType: $areaType) {
    type
    objects {
      name
      value {
        type
        geometries {
          type
          arcs
          properties
        }
      }
    }
    arcs
  }
}
    `;
export type GetAreasQueryResult = Apollo.QueryResult<GetAreasQuery, GetAreasQueryVariables>;
export const GetStatsDocument = gql`
    query getStats {
  areaStats {
    area {
      name
      type
    }
    totalLoos
    activeLoos
    babyChangeLoos
  }
}
    `;
export type GetStatsQueryResult = Apollo.QueryResult<GetStatsQuery, GetStatsQueryVariables>;
export const GetFormAreasDocument = gql`
    query getFormAreas {
  items: areas {
    label: name
  }
}
    `;
export type GetFormAreasQueryResult = Apollo.QueryResult<GetFormAreasQuery, GetFormAreasQueryVariables>;
export const GetContributorsDocument = gql`
    query getContributors {
  items: contributors {
    label: name
  }
}
    `;
export type GetContributorsQueryResult = Apollo.QueryResult<GetContributorsQuery, GetContributorsQueryVariables>;
export const SearchDocument = gql`
    query search($rows: Int = 10, $page: Int = 1, $text: String, $order: SortOrder = NEWEST_FIRST, $areaName: String, $fromDate: DateTime, $toDate: DateTime, $contributor: String) {
  loos(pagination: {limit: $rows, page: $page}, filters: {text: $text, fromDate: $fromDate, toDate: $toDate, contributors: [$contributor], areaName: $areaName}, sort: $order) {
    loos {
      id
      name
      area {
        name
        type
      }
      reports {
        contributor
      }
      updatedAt
      openingTimes
    }
    total
    page
  }
}
    `;
export type SearchQueryResult = Apollo.QueryResult<SearchQuery, SearchQueryVariables>;
export const FindLooByIdDocument = gql`
    query findLooById($id: ID) {
  loo(id: $id) {
    ...LooFragment
  }
}
    ${LooFragmentFragmentDoc}`;
export type FindLooByIdQueryResult = Apollo.QueryResult<FindLooByIdQuery, FindLooByIdQueryVariables>;
export const RemoveLooDocument = gql`
    mutation removeLoo($id: ID!, $reason: String!) {
  submitRemovalReport(report: {edit: $id, reason: $reason}) {
    code
    success
    loo {
      id
      active
      removalReason
    }
  }
}
    `;
export type RemoveLooMutationFn = Apollo.MutationFunction<RemoveLooMutation, RemoveLooMutationVariables>;
export type RemoveLooMutationResult = Apollo.MutationResult<RemoveLooMutation>;
export type RemoveLooMutationOptions = Apollo.BaseMutationOptions<RemoveLooMutation, RemoveLooMutationVariables>;
export const UpdateLooDocument = gql`
    mutation updateLoo($id: ID, $location: PointInput!, $name: String, $openingTimes: OpeningTimes, $accessible: Boolean, $allGender: Boolean, $men: Boolean, $women: Boolean, $children: Boolean, $urinalOnly: Boolean, $babyChange: Boolean, $radar: Boolean, $attended: Boolean, $automatic: Boolean, $noPayment: Boolean, $paymentDetails: String, $notes: String, $campaignUOL: Boolean) {
  submitReport(report: {edit: $id, location: $location, name: $name, openingTimes: $openingTimes, accessible: $accessible, men: $men, women: $women, children: $children, urinalOnly: $urinalOnly, allGender: $allGender, babyChange: $babyChange, radar: $radar, attended: $attended, automatic: $automatic, noPayment: $noPayment, paymentDetails: $paymentDetails, notes: $notes, campaignUOL: $campaignUOL}) {
    code
    success
    message
    loo {
      ...LooFragment
    }
  }
}
    ${LooFragmentFragmentDoc}`;
export type UpdateLooMutationFn = Apollo.MutationFunction<UpdateLooMutation, UpdateLooMutationVariables>;
export type UpdateLooMutationResult = Apollo.MutationResult<UpdateLooMutation>;
export type UpdateLooMutationOptions = Apollo.BaseMutationOptions<UpdateLooMutation, UpdateLooMutationVariables>;