import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  OpeningTimes: { input: any; output: any; }
};

/**
 * A unit of Administrative Geography
 * e.g. a district council
 */
export type AdminGeo = {
  __typename?: 'AdminGeo';
  name?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
};

export type AreaToiletCount = {
  __typename?: 'AreaToiletCount';
  active?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  removed?: Maybe<Scalars['Int']['output']>;
};

/** The name of a contributor. This requires a certain level of permissions to access. */
export type AuthedContributor = {
  __typename?: 'AuthedContributor';
  name: Scalars['String']['output'];
};

export enum CacheControlScope {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

/**
 * A Toilet
 * The data representing a toilet is computed from its **Report**s
 */
export type Loo = {
  __typename?: 'Loo';
  accessible?: Maybe<Scalars['Boolean']['output']>;
  active?: Maybe<Scalars['Boolean']['output']>;
  allGender?: Maybe<Scalars['Boolean']['output']>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  attended?: Maybe<Scalars['Boolean']['output']>;
  automatic?: Maybe<Scalars['Boolean']['output']>;
  babyChange?: Maybe<Scalars['Boolean']['output']>;
  children?: Maybe<Scalars['Boolean']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  geohash?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['ID']['output']>;
  location?: Maybe<Point>;
  men?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  noPayment?: Maybe<Scalars['Boolean']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']['output']>;
  paymentDetails?: Maybe<Scalars['String']['output']>;
  radar?: Maybe<Scalars['Boolean']['output']>;
  removalReason?: Maybe<Scalars['String']['output']>;
  reports?: Maybe<Array<Maybe<Report>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  urinalOnly?: Maybe<Scalars['Boolean']['output']>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
  women?: Maybe<Scalars['Boolean']['output']>;
};

/** Include or Exclude Loos from search results based on whether they satisfy a filter condition */
export type LooFilter = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  areaName?: InputMaybe<Scalars['String']['input']>;
  contributors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  fromDate?: InputMaybe<Scalars['DateTime']['input']>;
  noPayment?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  toDate?: InputMaybe<Scalars['DateTime']['input']>;
};

export type LooSearchResponse = {
  __typename?: 'LooSearchResponse';
  limit?: Maybe<Scalars['Int']['output']>;
  loos: Array<Loo>;
  page?: Maybe<Scalars['Int']['output']>;
  pages?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  submitRemovalReport?: Maybe<ReportMutationResponse>;
  submitReport?: Maybe<ReportMutationResponse>;
  submitVerificationReport?: Maybe<ReportMutationResponse>;
};


export type MutationSubmitRemovalReportArgs = {
  report?: InputMaybe<RemovalReportInput>;
};


export type MutationSubmitReportArgs = {
  report?: InputMaybe<ReportInput>;
};


export type MutationSubmitVerificationReportArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type MutationResponse = {
  code: Scalars['String']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type PaginationInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * A Geographical Point
 * Expressed in WGS84 coordinates (SRID 4326).
 */
export type Point = {
  __typename?: 'Point';
  /** Latitude */
  lat: Scalars['Float']['output'];
  /** Longitude */
  lng: Scalars['Float']['output'];
};

export type PointInput = {
  lat: Scalars['Float']['input'];
  lng: Scalars['Float']['input'];
};

export type ProximityInput = {
  /** Latitude */
  lat: Scalars['Float']['input'];
  /** Longitude */
  lng: Scalars['Float']['input'];
  /** Maximum Distance in meters */
  maxDistance?: InputMaybe<Scalars['Int']['input']>;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve a list of areas in existence, name and type only */
  areas: Array<AdminGeo>;
  /** Retrieve detailed, compressed loos that sit within a given geohash */
  fullLoosByGeohash: Array<Scalars['String']['output']>;
  /** Retrieve a Loo by ID */
  loo?: Maybe<Loo>;
  looNamesByIds: Array<Loo>;
  /** Search for loos matching a filter */
  loos: LooSearchResponse;
  /** Retrieve loos that sit within a given geohash */
  loosByGeohash: Array<Scalars['String']['output']>;
  /** Retrieve Loos by proximity to a Point */
  loosByProximity: Array<Loo>;
  reportsForLoo: Array<Report>;
  /** Get statistics about our data */
  statistics?: Maybe<Statistics>;
};


export type QueryFullLoosByGeohashArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  geohash: Scalars['String']['input'];
};


export type QueryLooArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryLooNamesByIdsArgs = {
  idList?: InputMaybe<Array<InputMaybe<Scalars['ID']['input']>>>;
};


export type QueryLoosArgs = {
  filters: LooFilter;
  pagination?: InputMaybe<PaginationInput>;
  sort?: InputMaybe<SortOrder>;
};


export type QueryLoosByGeohashArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  geohash: Scalars['String']['input'];
};


export type QueryLoosByProximityArgs = {
  from: ProximityInput;
};


export type QueryReportsForLooArgs = {
  id: Scalars['ID']['input'];
};

export type RemovalReportInput = {
  edit: Scalars['ID']['input'];
  reason: Scalars['String']['input'];
};

/**
 * Reported information about a real-world toilet
 * Reports are submitted by contributors or created as part of data imports
 * A report can refer to another report (via the **previous** field) to indicate that it is intended to augment or adjust an existing Loo
 */
export type Report = {
  __typename?: 'Report';
  accessible?: Maybe<Scalars['Boolean']['output']>;
  active?: Maybe<Scalars['Boolean']['output']>;
  allGender?: Maybe<Scalars['Boolean']['output']>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  attended?: Maybe<Scalars['Boolean']['output']>;
  automatic?: Maybe<Scalars['Boolean']['output']>;
  babyChange?: Maybe<Scalars['Boolean']['output']>;
  children?: Maybe<Scalars['Boolean']['output']>;
  /** An identifier for the user or process which contributed the report */
  contributor: Scalars['String']['output'];
  /** When the report was added to the system */
  createdAt: Scalars['DateTime']['output'];
  geohash?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /**
   * We insert location updates separately using a DB trigger because Prisma doesn't support PostGIS yet.
   * This field is used to indicate to the client that the system created the report so that it can be coalesced with the user's report.
   */
  isSystemReport?: Maybe<Scalars['Boolean']['output']>;
  location?: Maybe<Point>;
  /** The Loo which uses the data submitted in this report */
  loo?: Maybe<Loo>;
  men?: Maybe<Scalars['Boolean']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  noPayment?: Maybe<Scalars['Boolean']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  openingTimes?: Maybe<Scalars['OpeningTimes']['output']>;
  paymentDetails?: Maybe<Scalars['String']['output']>;
  /**
   * A link to the previous report in the chain
   * This is nullable since this might be the first report about a particular toilet
   */
  previous?: Maybe<Report>;
  radar?: Maybe<Scalars['Boolean']['output']>;
  removalReason?: Maybe<Scalars['String']['output']>;
  urinalOnly?: Maybe<Scalars['Boolean']['output']>;
  verifiedAt?: Maybe<Scalars['DateTime']['output']>;
  women?: Maybe<Scalars['Boolean']['output']>;
};

export type ReportInput = {
  accessible?: InputMaybe<Scalars['Boolean']['input']>;
  active?: InputMaybe<Scalars['Boolean']['input']>;
  allGender?: InputMaybe<Scalars['Boolean']['input']>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  automatic?: InputMaybe<Scalars['Boolean']['input']>;
  babyChange?: InputMaybe<Scalars['Boolean']['input']>;
  children?: InputMaybe<Scalars['Boolean']['input']>;
  edit?: InputMaybe<Scalars['ID']['input']>;
  location: PointInput;
  men?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  noPayment?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  openingTimes?: InputMaybe<Scalars['OpeningTimes']['input']>;
  paymentDetails?: InputMaybe<Scalars['String']['input']>;
  radar?: InputMaybe<Scalars['Boolean']['input']>;
  urinalOnly?: InputMaybe<Scalars['Boolean']['input']>;
  women?: InputMaybe<Scalars['Boolean']['input']>;
};

export type ReportMutationResponse = MutationResponse & {
  __typename?: 'ReportMutationResponse';
  code: Scalars['String']['output'];
  loo?: Maybe<Loo>;
  message: Scalars['String']['output'];
  report?: Maybe<Report>;
  success: Scalars['Boolean']['output'];
};

export enum SortOrder {
  NewestFirst = 'NEWEST_FIRST',
  OldestFirst = 'OLDEST_FIRST'
}

export type Statistics = {
  __typename?: 'Statistics';
  active?: Maybe<Scalars['Int']['output']>;
  areaToiletCount?: Maybe<Array<Maybe<AreaToiletCount>>>;
  removed?: Maybe<Scalars['Int']['output']>;
  total?: Maybe<Scalars['Int']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;




/** Mapping of interface types */
export type ResolversInterfaceTypes<_RefType extends Record<string, unknown>> = {
  MutationResponse: ( ReportMutationResponse );
};

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AdminGeo: ResolverTypeWrapper<AdminGeo>;
  AreaToiletCount: ResolverTypeWrapper<AreaToiletCount>;
  AuthedContributor: ResolverTypeWrapper<AuthedContributor>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CacheControlScope: CacheControlScope;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Loo: ResolverTypeWrapper<Loo>;
  LooFilter: LooFilter;
  LooSearchResponse: ResolverTypeWrapper<LooSearchResponse>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  MutationResponse: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>['MutationResponse']>;
  OpeningTimes: ResolverTypeWrapper<Scalars['OpeningTimes']['output']>;
  PaginationInput: PaginationInput;
  Point: ResolverTypeWrapper<Point>;
  PointInput: PointInput;
  ProximityInput: ProximityInput;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  RemovalReportInput: RemovalReportInput;
  Report: ResolverTypeWrapper<Report>;
  ReportInput: ReportInput;
  ReportMutationResponse: ResolverTypeWrapper<ReportMutationResponse>;
  SortOrder: SortOrder;
  Statistics: ResolverTypeWrapper<Statistics>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AdminGeo: AdminGeo;
  AreaToiletCount: AreaToiletCount;
  AuthedContributor: AuthedContributor;
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  Loo: Loo;
  LooFilter: LooFilter;
  LooSearchResponse: LooSearchResponse;
  Mutation: Record<PropertyKey, never>;
  MutationResponse: ResolversInterfaceTypes<ResolversParentTypes>['MutationResponse'];
  OpeningTimes: Scalars['OpeningTimes']['output'];
  PaginationInput: PaginationInput;
  Point: Point;
  PointInput: PointInput;
  ProximityInput: ProximityInput;
  Query: Record<PropertyKey, never>;
  RemovalReportInput: RemovalReportInput;
  Report: Report;
  ReportInput: ReportInput;
  ReportMutationResponse: ReportMutationResponse;
  Statistics: Statistics;
  String: Scalars['String']['output'];
};

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']['input']>;
  maxAge?: Maybe<Scalars['Int']['input']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AdminGeoResolvers<ContextType = any, ParentType extends ResolversParentTypes['AdminGeo'] = ResolversParentTypes['AdminGeo']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AreaToiletCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['AreaToiletCount'] = ResolversParentTypes['AreaToiletCount']> = {
  active?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  removed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type AuthedContributorResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthedContributor'] = ResolversParentTypes['AuthedContributor']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type LooResolvers<ContextType = any, ParentType extends ResolversParentTypes['Loo'] = ResolversParentTypes['Loo']> = {
  accessible?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allGender?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  area?: Resolver<Maybe<Array<Maybe<ResolversTypes['AdminGeo']>>>, ParentType, ContextType>;
  attended?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  automatic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  babyChange?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  children?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  geohash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Point']>, ParentType, ContextType>;
  men?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  noPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  openingTimes?: Resolver<Maybe<ResolversTypes['OpeningTimes']>, ParentType, ContextType>;
  paymentDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  radar?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  removalReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  reports?: Resolver<Maybe<Array<Maybe<ResolversTypes['Report']>>>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  urinalOnly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  women?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
};

export type LooSearchResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['LooSearchResponse'] = ResolversParentTypes['LooSearchResponse']> = {
  limit?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  loos?: Resolver<Array<ResolversTypes['Loo']>, ParentType, ContextType>;
  page?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pages?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  submitRemovalReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitRemovalReportArgs>>;
  submitReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitReportArgs>>;
  submitVerificationReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitVerificationReportArgs>>;
};

export type MutationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MutationResponse'] = ResolversParentTypes['MutationResponse']> = {
  __resolveType: TypeResolveFn<'ReportMutationResponse', ParentType, ContextType>;
};

export interface OpeningTimesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['OpeningTimes'], any> {
  name: 'OpeningTimes';
}

export type PointResolvers<ContextType = any, ParentType extends ResolversParentTypes['Point'] = ResolversParentTypes['Point']> = {
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  areas?: Resolver<Array<ResolversTypes['AdminGeo']>, ParentType, ContextType>;
  fullLoosByGeohash?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryFullLoosByGeohashArgs, 'active' | 'geohash'>>;
  loo?: Resolver<Maybe<ResolversTypes['Loo']>, ParentType, ContextType, Partial<QueryLooArgs>>;
  looNamesByIds?: Resolver<Array<ResolversTypes['Loo']>, ParentType, ContextType, Partial<QueryLooNamesByIdsArgs>>;
  loos?: Resolver<ResolversTypes['LooSearchResponse'], ParentType, ContextType, RequireFields<QueryLoosArgs, 'filters' | 'pagination' | 'sort'>>;
  loosByGeohash?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<QueryLoosByGeohashArgs, 'active' | 'geohash'>>;
  loosByProximity?: Resolver<Array<ResolversTypes['Loo']>, ParentType, ContextType, RequireFields<QueryLoosByProximityArgs, 'from'>>;
  reportsForLoo?: Resolver<Array<ResolversTypes['Report']>, ParentType, ContextType, RequireFields<QueryReportsForLooArgs, 'id'>>;
  statistics?: Resolver<Maybe<ResolversTypes['Statistics']>, ParentType, ContextType>;
};

export type ReportResolvers<ContextType = any, ParentType extends ResolversParentTypes['Report'] = ResolversParentTypes['Report']> = {
  accessible?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allGender?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  area?: Resolver<Maybe<Array<Maybe<ResolversTypes['AdminGeo']>>>, ParentType, ContextType>;
  attended?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  automatic?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  babyChange?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  children?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  contributor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  geohash?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isSystemReport?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  location?: Resolver<Maybe<ResolversTypes['Point']>, ParentType, ContextType>;
  loo?: Resolver<Maybe<ResolversTypes['Loo']>, ParentType, ContextType>;
  men?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  noPayment?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  openingTimes?: Resolver<Maybe<ResolversTypes['OpeningTimes']>, ParentType, ContextType>;
  paymentDetails?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  previous?: Resolver<Maybe<ResolversTypes['Report']>, ParentType, ContextType>;
  radar?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  removalReason?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  urinalOnly?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  verifiedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  women?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
};

export type ReportMutationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['ReportMutationResponse'] = ResolversParentTypes['ReportMutationResponse']> = {
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  loo?: Resolver<Maybe<ResolversTypes['Loo']>, ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  report?: Resolver<Maybe<ResolversTypes['Report']>, ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type StatisticsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Statistics'] = ResolversParentTypes['Statistics']> = {
  active?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  areaToiletCount?: Resolver<Maybe<Array<Maybe<ResolversTypes['AreaToiletCount']>>>, ParentType, ContextType>;
  removed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  total?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AdminGeo?: AdminGeoResolvers<ContextType>;
  AreaToiletCount?: AreaToiletCountResolvers<ContextType>;
  AuthedContributor?: AuthedContributorResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Loo?: LooResolvers<ContextType>;
  LooSearchResponse?: LooSearchResponseResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  MutationResponse?: MutationResponseResolvers<ContextType>;
  OpeningTimes?: GraphQLScalarType;
  Point?: PointResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Report?: ReportResolvers<ContextType>;
  ReportMutationResponse?: ReportMutationResponseResolvers<ContextType>;
  Statistics?: StatisticsResolvers<ContextType>;
};

export type DirectiveResolvers<ContextType = any> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};
