import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  OpeningTimes: any;
};

/**
 * A unit of Administrative Geography
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
  /** The number of loos marked as active in this area */
  activeLoos: Scalars['Int'];
  /** The area's identifier. Note that only the 'name' will be passed with this field. */
  area: AdminGeo;
  /** The number of loos with baby changing facilities in this area */
  babyChangeLoos: Scalars['Int'];
  /** The total number of loos in this area */
  totalLoos: Scalars['Int'];
};

/** The name of a contributor. This requires a certain level of permissions to access. */
export type AuthedContributor = {
  __typename?: 'AuthedContributor';
  name: Scalars['String'];
};

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
  /** The number of loos which have more than one report registered for them */
  multipleReports?: Maybe<Scalars['Int']>;
  /** The total number of reports that report a loo as closed/removed */
  removalReports?: Maybe<Scalars['Int']>;
  /** The total number of loos */
  totalLoos?: Maybe<Scalars['Int']>;
  /** The total number of reports */
  totalReports?: Maybe<Scalars['Int']>;
};

/**
 * A Toilet
 * The data representing a toilet is computed from its **Report**s
 */
export type Loo = {
  __typename?: 'Loo';
  accessible?: Maybe<Scalars['Boolean']>;
  active?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  id?: Maybe<Scalars['ID']>;
  location?: Maybe<Point>;
  men?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  notes?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  paymentDetails?: Maybe<Scalars['String']>;
  radar?: Maybe<Scalars['Boolean']>;
  removalReason?: Maybe<Scalars['String']>;
  reports?: Maybe<Array<Maybe<Report>>>;
  updatedAt?: Maybe<Scalars['DateTime']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  verifiedAt?: Maybe<Scalars['DateTime']>;
  women?: Maybe<Scalars['Boolean']>;
};

/** Include or Exclude Loos from search results based on whether they satisfy a filter condition */
export type LooFilter = {
  active?: Maybe<Scalars['Boolean']>;
  areaName?: Maybe<Scalars['String']>;
  contributors?: Maybe<Array<Maybe<Scalars['String']>>>;
  fromDate?: Maybe<Scalars['DateTime']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  text?: Maybe<Scalars['String']>;
  toDate?: Maybe<Scalars['DateTime']>;
};

export type LooSearchResponse = {
  __typename?: 'LooSearchResponse';
  limit?: Maybe<Scalars['Int']>;
  loos: Array<Loo>;
  page?: Maybe<Scalars['Int']>;
  pages?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  submitRemovalReport?: Maybe<ReportMutationResponse>;
  submitReport?: Maybe<ReportMutationResponse>;
  submitVerificationReport?: Maybe<ReportMutationResponse>;
};

export type MutationSubmitRemovalReportArgs = {
  report?: Maybe<RemovalReportInput>;
};

export type MutationSubmitReportArgs = {
  report?: Maybe<ReportInput>;
};

export type MutationSubmitVerificationReportArgs = {
  id?: Maybe<Scalars['ID']>;
};

export type MutationResponse = {
  code: Scalars['String'];
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type PaginationInput = {
  limit?: Maybe<Scalars['Int']>;
  page?: Maybe<Scalars['Int']>;
};

/**
 * A Geographical Point
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
  /** The proportions of loos that are accessible vs not accessible */
  accessibleLoos: Array<Chunk>;
  /** The proportions of loos that are active vs removed */
  activeLoos: Array<Chunk>;
  /** The proportions of loos that have baby changing facilities vs those that don't */
  babyChanging: Array<Chunk>;
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
  /** Retrieve statistics, broken down by area, for all areas */
  areaStats: Array<AreaStats>;
  /** Retrieve a list of areas in existance, name and type only */
  areas: Array<AdminGeo>;
  /** Retrieve a list of contributors. Requires correct authentication */
  contributors: Array<AuthedContributor>;
  /** Retrieve 'counter' statistics */
  counters: Counters;
  /** Retrieve a Loo by ID */
  loo?: Maybe<Loo>;
  /** Search for loos matching a filter */
  loos: LooSearchResponse;
  /** Retrieve Loos by proximity to a Point */
  loosByProximity: Array<Loo>;
  /** Retrieve the explorer map TopoJSON data */
  mapAreas?: Maybe<TopoGeo>;
  /** Retrieve proportional statistics */
  proportions: Proportions;
  /** Retrieve a report by ID */
  report?: Maybe<Report>;
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
 * Reports are submitted by contributors or created as part of data imports
 * A report can refer to another report (via the **previous** field) to indicate that it is intended to augment or adjust an exisitn Loo
 */
export type Report = {
  __typename?: 'Report';
  accessible?: Maybe<Scalars['Boolean']>;
  active?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  /** An identifier for the user or process which contributed the report */
  contributor: Scalars['String'];
  /** When the report was added to the system */
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  location?: Maybe<Point>;
  /** The Loo which uses the data submitted in this report */
  loo?: Maybe<Loo>;
  men?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  notes?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  paymentDetails?: Maybe<Scalars['String']>;
  /**
   * A link to the previous report in the chain
   * This is nullable since this might be the first report about a particular toilet
   */
  previous?: Maybe<Report>;
  radar?: Maybe<Scalars['Boolean']>;
  removalReason?: Maybe<Scalars['String']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  verifiedAt?: Maybe<Scalars['DateTime']>;
  women?: Maybe<Scalars['Boolean']>;
};

export type ReportInput = {
  accessible?: Maybe<Scalars['Boolean']>;
  active?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  campaignUOL?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  edit?: Maybe<Scalars['ID']>;
  location: PointInput;
  men?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
  noPayment?: Maybe<Scalars['Boolean']>;
  notes?: Maybe<Scalars['String']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']>;
  paymentDetails?: Maybe<Scalars['String']>;
  radar?: Maybe<Scalars['Boolean']>;
  urinalOnly?: Maybe<Scalars['Boolean']>;
  women?: Maybe<Scalars['Boolean']>;
};

export type ReportMutationResponse = MutationResponse & {
  __typename?: 'ReportMutationResponse';
  code: Scalars['String'];
  loo?: Maybe<Loo>;
  message: Scalars['String'];
  report?: Maybe<Report>;
  success: Scalars['Boolean'];
};

export enum SortOrder {
  NewestFirst = 'NEWEST_FIRST',
  OldestFirst = 'OLDEST_FIRST',
}

/** Main TopoJSON type. Contains various objects and arcs. */
export type TopoGeo = {
  __typename?: 'TopoGeo';
  arcs: Array<Array<Array<Scalars['Float']>>>;
  objects: Array<TopoObjectContainer>;
  transform?: Maybe<TopoTransform>;
  type: Scalars['String'];
};

export type TopoGeometry = {
  __typename?: 'TopoGeometry';
  arcs: Array<Array<Array<Scalars['Float']>>>;
  /** JSON-encoded properties string */
  properties: Scalars['String'];
  type: Scalars['String'];
};

export type TopoObject = {
  __typename?: 'TopoObject';
  geometries: Array<TopoGeometry>;
  type: Scalars['String'];
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

export type FindLooByIdQueryVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
}>;

export type FindLooByIdQuery = {
  __typename?: 'Query';
  loo?: Maybe<{
    __typename?: 'Loo';
    id?: Maybe<string>;
    createdAt?: Maybe<any>;
    updatedAt?: Maybe<any>;
    verifiedAt?: Maybe<any>;
    active?: Maybe<boolean>;
    name?: Maybe<string>;
    openingTimes?: Maybe<any>;
    accessible?: Maybe<boolean>;
    men?: Maybe<boolean>;
    women?: Maybe<boolean>;
    allGender?: Maybe<boolean>;
    babyChange?: Maybe<boolean>;
    children?: Maybe<boolean>;
    urinalOnly?: Maybe<boolean>;
    radar?: Maybe<boolean>;
    automatic?: Maybe<boolean>;
    noPayment?: Maybe<boolean>;
    paymentDetails?: Maybe<string>;
    notes?: Maybe<string>;
    removalReason?: Maybe<string>;
    attended?: Maybe<boolean>;
    campaignUOL?: Maybe<boolean>;
    location?: Maybe<{ __typename?: 'Point'; lat: number; lng: number }>;
  }>;
};

export type FindLoosNearbyQueryVariables = Exact<{
  lat: Scalars['Float'];
  lng: Scalars['Float'];
  radius: Scalars['Int'];
}>;

export type FindLoosNearbyQuery = {
  __typename?: 'Query';
  loosByProximity: Array<{
    __typename?: 'Loo';
    id?: Maybe<string>;
    name?: Maybe<string>;
    noPayment?: Maybe<boolean>;
    allGender?: Maybe<boolean>;
    automatic?: Maybe<boolean>;
    accessible?: Maybe<boolean>;
    babyChange?: Maybe<boolean>;
    radar?: Maybe<boolean>;
    campaignUOL?: Maybe<boolean>;
    location?: Maybe<{ __typename?: 'Point'; lat: number; lng: number }>;
  }>;
};

export type LooFragmentFragment = {
  __typename?: 'Loo';
  id?: Maybe<string>;
  createdAt?: Maybe<any>;
  updatedAt?: Maybe<any>;
  verifiedAt?: Maybe<any>;
  active?: Maybe<boolean>;
  name?: Maybe<string>;
  openingTimes?: Maybe<any>;
  accessible?: Maybe<boolean>;
  men?: Maybe<boolean>;
  women?: Maybe<boolean>;
  allGender?: Maybe<boolean>;
  babyChange?: Maybe<boolean>;
  children?: Maybe<boolean>;
  urinalOnly?: Maybe<boolean>;
  radar?: Maybe<boolean>;
  automatic?: Maybe<boolean>;
  noPayment?: Maybe<boolean>;
  paymentDetails?: Maybe<string>;
  notes?: Maybe<string>;
  removalReason?: Maybe<string>;
  attended?: Maybe<boolean>;
  campaignUOL?: Maybe<boolean>;
  location?: Maybe<{ __typename?: 'Point'; lat: number; lng: number }>;
};

export type RemoveLooMutationVariables = Exact<{
  id: Scalars['ID'];
  reason: Scalars['String'];
}>;

export type RemoveLooMutation = {
  __typename?: 'Mutation';
  submitRemovalReport?: Maybe<{
    __typename?: 'ReportMutationResponse';
    code: string;
    success: boolean;
    loo?: Maybe<{
      __typename?: 'Loo';
      id?: Maybe<string>;
      active?: Maybe<boolean>;
      removalReason?: Maybe<string>;
    }>;
  }>;
};

export type SubmitVerificationReportMutationMutationVariables = Exact<{
  id?: Maybe<Scalars['ID']>;
}>;

export type SubmitVerificationReportMutationMutation = {
  __typename?: 'Mutation';
  submitVerificationReport?: Maybe<{
    __typename?: 'ReportMutationResponse';
    loo?: Maybe<{
      __typename?: 'Loo';
      id?: Maybe<string>;
      verifiedAt?: Maybe<any>;
    }>;
  }>;
};

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
  active?: Maybe<Scalars['Boolean']>;
}>;

export type UpdateLooMutation = {
  __typename?: 'Mutation';
  submitReport?: Maybe<{
    __typename?: 'ReportMutationResponse';
    code: string;
    success: boolean;
    message: string;
    loo?: Maybe<{
      __typename?: 'Loo';
      id?: Maybe<string>;
      createdAt?: Maybe<any>;
      updatedAt?: Maybe<any>;
      verifiedAt?: Maybe<any>;
      active?: Maybe<boolean>;
      name?: Maybe<string>;
      openingTimes?: Maybe<any>;
      accessible?: Maybe<boolean>;
      men?: Maybe<boolean>;
      women?: Maybe<boolean>;
      allGender?: Maybe<boolean>;
      babyChange?: Maybe<boolean>;
      children?: Maybe<boolean>;
      urinalOnly?: Maybe<boolean>;
      radar?: Maybe<boolean>;
      automatic?: Maybe<boolean>;
      noPayment?: Maybe<boolean>;
      paymentDetails?: Maybe<string>;
      notes?: Maybe<string>;
      removalReason?: Maybe<string>;
      attended?: Maybe<boolean>;
      campaignUOL?: Maybe<boolean>;
      location?: Maybe<{ __typename?: 'Point'; lat: number; lng: number }>;
    }>;
  }>;
};

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
export const FindLooByIdDocument = gql`
  query findLooById($id: ID) {
    loo(id: $id) {
      ...LooFragment
    }
  }
  ${LooFragmentFragmentDoc}
`;

/**
 * __useFindLooByIdQuery__
 *
 * To run a query within a React component, call `useFindLooByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLooByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLooByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useFindLooByIdQuery(
  baseOptions?: Apollo.QueryHookOptions<
    FindLooByIdQuery,
    FindLooByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FindLooByIdQuery, FindLooByIdQueryVariables>(
    FindLooByIdDocument,
    options
  );
}
export function useFindLooByIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FindLooByIdQuery,
    FindLooByIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FindLooByIdQuery, FindLooByIdQueryVariables>(
    FindLooByIdDocument,
    options
  );
}
export type FindLooByIdQueryHookResult = ReturnType<typeof useFindLooByIdQuery>;
export type FindLooByIdLazyQueryHookResult = ReturnType<
  typeof useFindLooByIdLazyQuery
>;
export type FindLooByIdQueryResult = Apollo.QueryResult<
  FindLooByIdQuery,
  FindLooByIdQueryVariables
>;
export const FindLoosNearbyDocument = gql`
  query findLoosNearby($lat: Float!, $lng: Float!, $radius: Int!) {
    loosByProximity(from: { lat: $lat, lng: $lng, maxDistance: $radius }) {
      id
      name
      location {
        lat
        lng
      }
      noPayment
      allGender
      automatic
      accessible
      babyChange
      radar
      campaignUOL
    }
  }
`;

/**
 * __useFindLoosNearbyQuery__
 *
 * To run a query within a React component, call `useFindLoosNearbyQuery` and pass it any options that fit your needs.
 * When your component renders, `useFindLoosNearbyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFindLoosNearbyQuery({
 *   variables: {
 *      lat: // value for 'lat'
 *      lng: // value for 'lng'
 *      radius: // value for 'radius'
 *   },
 * });
 */
export function useFindLoosNearbyQuery(
  baseOptions: Apollo.QueryHookOptions<
    FindLoosNearbyQuery,
    FindLoosNearbyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FindLoosNearbyQuery, FindLoosNearbyQueryVariables>(
    FindLoosNearbyDocument,
    options
  );
}
export function useFindLoosNearbyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FindLoosNearbyQuery,
    FindLoosNearbyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FindLoosNearbyQuery, FindLoosNearbyQueryVariables>(
    FindLoosNearbyDocument,
    options
  );
}
export type FindLoosNearbyQueryHookResult = ReturnType<
  typeof useFindLoosNearbyQuery
>;
export type FindLoosNearbyLazyQueryHookResult = ReturnType<
  typeof useFindLoosNearbyLazyQuery
>;
export type FindLoosNearbyQueryResult = Apollo.QueryResult<
  FindLoosNearbyQuery,
  FindLoosNearbyQueryVariables
>;
export const RemoveLooDocument = gql`
  mutation removeLoo($id: ID!, $reason: String!) {
    submitRemovalReport(report: { edit: $id, reason: $reason }) {
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
export type RemoveLooMutationFn = Apollo.MutationFunction<
  RemoveLooMutation,
  RemoveLooMutationVariables
>;

/**
 * __useRemoveLooMutation__
 *
 * To run a mutation, you first call `useRemoveLooMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveLooMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeLooMutation, { data, loading, error }] = useRemoveLooMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useRemoveLooMutation(
  baseOptions?: Apollo.MutationHookOptions<
    RemoveLooMutation,
    RemoveLooMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveLooMutation, RemoveLooMutationVariables>(
    RemoveLooDocument,
    options
  );
}
export type RemoveLooMutationHookResult = ReturnType<
  typeof useRemoveLooMutation
>;
export type RemoveLooMutationResult = Apollo.MutationResult<RemoveLooMutation>;
export type RemoveLooMutationOptions = Apollo.BaseMutationOptions<
  RemoveLooMutation,
  RemoveLooMutationVariables
>;
export const SubmitVerificationReportMutationDocument = gql`
  mutation submitVerificationReportMutation($id: ID) {
    submitVerificationReport(id: $id) {
      loo {
        id
        verifiedAt
      }
    }
  }
`;
export type SubmitVerificationReportMutationMutationFn =
  Apollo.MutationFunction<
    SubmitVerificationReportMutationMutation,
    SubmitVerificationReportMutationMutationVariables
  >;

/**
 * __useSubmitVerificationReportMutationMutation__
 *
 * To run a mutation, you first call `useSubmitVerificationReportMutationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitVerificationReportMutationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitVerificationReportMutationMutation, { data, loading, error }] = useSubmitVerificationReportMutationMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSubmitVerificationReportMutationMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SubmitVerificationReportMutationMutation,
    SubmitVerificationReportMutationMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SubmitVerificationReportMutationMutation,
    SubmitVerificationReportMutationMutationVariables
  >(SubmitVerificationReportMutationDocument, options);
}
export type SubmitVerificationReportMutationMutationHookResult = ReturnType<
  typeof useSubmitVerificationReportMutationMutation
>;
export type SubmitVerificationReportMutationMutationResult =
  Apollo.MutationResult<SubmitVerificationReportMutationMutation>;
export type SubmitVerificationReportMutationMutationOptions =
  Apollo.BaseMutationOptions<
    SubmitVerificationReportMutationMutation,
    SubmitVerificationReportMutationMutationVariables
  >;
export const UpdateLooDocument = gql`
  mutation updateLoo(
    $id: ID
    $location: PointInput!
    $name: String
    $openingTimes: OpeningTimes
    $accessible: Boolean
    $allGender: Boolean
    $men: Boolean
    $women: Boolean
    $children: Boolean
    $urinalOnly: Boolean
    $babyChange: Boolean
    $radar: Boolean
    $attended: Boolean
    $automatic: Boolean
    $noPayment: Boolean
    $paymentDetails: String
    $notes: String
    $campaignUOL: Boolean
    $active: Boolean
  ) {
    submitReport(
      report: {
        edit: $id
        location: $location
        name: $name
        openingTimes: $openingTimes
        accessible: $accessible
        men: $men
        women: $women
        children: $children
        urinalOnly: $urinalOnly
        allGender: $allGender
        babyChange: $babyChange
        radar: $radar
        attended: $attended
        automatic: $automatic
        noPayment: $noPayment
        paymentDetails: $paymentDetails
        notes: $notes
        campaignUOL: $campaignUOL
        active: $active
      }
    ) {
      code
      success
      message
      loo {
        ...LooFragment
      }
    }
  }
  ${LooFragmentFragmentDoc}
`;
export type UpdateLooMutationFn = Apollo.MutationFunction<
  UpdateLooMutation,
  UpdateLooMutationVariables
>;

/**
 * __useUpdateLooMutation__
 *
 * To run a mutation, you first call `useUpdateLooMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLooMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLooMutation, { data, loading, error }] = useUpdateLooMutation({
 *   variables: {
 *      id: // value for 'id'
 *      location: // value for 'location'
 *      name: // value for 'name'
 *      openingTimes: // value for 'openingTimes'
 *      accessible: // value for 'accessible'
 *      allGender: // value for 'allGender'
 *      men: // value for 'men'
 *      women: // value for 'women'
 *      children: // value for 'children'
 *      urinalOnly: // value for 'urinalOnly'
 *      babyChange: // value for 'babyChange'
 *      radar: // value for 'radar'
 *      attended: // value for 'attended'
 *      automatic: // value for 'automatic'
 *      noPayment: // value for 'noPayment'
 *      paymentDetails: // value for 'paymentDetails'
 *      notes: // value for 'notes'
 *      campaignUOL: // value for 'campaignUOL'
 *      active: // value for 'active'
 *   },
 * });
 */
export function useUpdateLooMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateLooMutation,
    UpdateLooMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateLooMutation, UpdateLooMutationVariables>(
    UpdateLooDocument,
    options
  );
}
export type UpdateLooMutationHookResult = ReturnType<
  typeof useUpdateLooMutation
>;
export type UpdateLooMutationResult = Apollo.MutationResult<UpdateLooMutation>;
export type UpdateLooMutationOptions = Apollo.BaseMutationOptions<
  UpdateLooMutation,
  UpdateLooMutationVariables
>;
