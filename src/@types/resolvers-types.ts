import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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

export type AreaToiletCount = {
  __typename?: 'AreaToiletCount';
  active?: Maybe<Scalars['Int']>;
  name?: Maybe<Scalars['String']>;
  removed?: Maybe<Scalars['Int']>;
};

/** The name of a contributor. This requires a certain level of permissions to access. */
export type AuthedContributor = {
  __typename?: 'AuthedContributor';
  name: Scalars['String'];
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
  accessible?: Maybe<Scalars['Boolean']>;
  active?: Maybe<Scalars['Boolean']>;
  allGender?: Maybe<Scalars['Boolean']>;
  area?: Maybe<Array<Maybe<AdminGeo>>>;
  attended?: Maybe<Scalars['Boolean']>;
  automatic?: Maybe<Scalars['Boolean']>;
  babyChange?: Maybe<Scalars['Boolean']>;
  children?: Maybe<Scalars['Boolean']>;
  createdAt?: Maybe<Scalars['DateTime']>;
  geohash?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  legacy_id?: Maybe<Scalars['ID']>;
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
  active?: InputMaybe<Scalars['Boolean']>;
  areaName?: InputMaybe<Scalars['String']>;
  contributors?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  fromDate?: InputMaybe<Scalars['DateTime']>;
  noPayment?: InputMaybe<Scalars['Boolean']>;
  text?: InputMaybe<Scalars['String']>;
  toDate?: InputMaybe<Scalars['DateTime']>;
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
  id?: InputMaybe<Scalars['ID']>;
};

export type MutationResponse = {
  code: Scalars['String'];
  message: Scalars['String'];
  success: Scalars['Boolean'];
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

export type ProximityInput = {
  /** Latitude */
  lat: Scalars['Float'];
  /** Longitude */
  lng: Scalars['Float'];
  /** Maximum Distance in meters */
  maxDistance?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  /** Retrieve a list of areas in existence, name and type only */
  areas: Array<AdminGeo>;
  legacyReportsForLoo: Array<Report>;
  /** Retrieve a Loo by ID */
  loo?: Maybe<Loo>;
  looNamesByIds: Array<Loo>;
  /** Retrieve loos that sit within a given geohash */
  loosByGeohash: Array<Scalars['String']>;
  /** Retrieve Loos by proximity to a Point */
  loosByProximity: Array<Loo>;
  reportsForLoo: Array<Report>;
  /** Get statistics about our data */
  statistics?: Maybe<Statistics>;
};


export type QueryLegacyReportsForLooArgs = {
  id: Scalars['ID'];
};


export type QueryLooArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QueryLooNamesByIdsArgs = {
  idList?: InputMaybe<Array<InputMaybe<Scalars['ID']>>>;
};


export type QueryLoosByGeohashArgs = {
  active?: InputMaybe<Scalars['Boolean']>;
  geohash: Scalars['String'];
};


export type QueryLoosByProximityArgs = {
  from: ProximityInput;
};


export type QueryReportsForLooArgs = {
  id: Scalars['ID'];
};

export type RemovalReportInput = {
  edit: Scalars['ID'];
  reason: Scalars['String'];
};

/**
 * Reported information about a real-world toilet
 * Reports are submitted by contributors or created as part of data imports
 * A report can refer to another report (via the **previous** field) to indicate that it is intended to augment or adjust an existing Loo
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
  accessible?: InputMaybe<Scalars['Boolean']>;
  active?: InputMaybe<Scalars['Boolean']>;
  allGender?: InputMaybe<Scalars['Boolean']>;
  attended?: InputMaybe<Scalars['Boolean']>;
  automatic?: InputMaybe<Scalars['Boolean']>;
  babyChange?: InputMaybe<Scalars['Boolean']>;
  children?: InputMaybe<Scalars['Boolean']>;
  edit?: InputMaybe<Scalars['ID']>;
  location: PointInput;
  men?: InputMaybe<Scalars['Boolean']>;
  name?: InputMaybe<Scalars['String']>;
  noPayment?: InputMaybe<Scalars['Boolean']>;
  notes?: InputMaybe<Scalars['String']>;
  openingTimes?: InputMaybe<Scalars['OpeningTimes']>;
  paymentDetails?: InputMaybe<Scalars['String']>;
  radar?: InputMaybe<Scalars['Boolean']>;
  urinalOnly?: InputMaybe<Scalars['Boolean']>;
  women?: InputMaybe<Scalars['Boolean']>;
};

export type ReportMutationResponse = MutationResponse & {
  __typename?: 'ReportMutationResponse';
  code: Scalars['String'];
  loo?: Maybe<Loo>;
  message: Scalars['String'];
  report?: Maybe<Report>;
  success: Scalars['Boolean'];
};

export type Statistics = {
  __typename?: 'Statistics';
  active?: Maybe<Scalars['Int']>;
  areaToiletCount?: Maybe<Array<Maybe<AreaToiletCount>>>;
  removed?: Maybe<Scalars['Int']>;
  total?: Maybe<Scalars['Int']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  AdminGeo: ResolverTypeWrapper<AdminGeo>;
  AreaToiletCount: ResolverTypeWrapper<AreaToiletCount>;
  AuthedContributor: ResolverTypeWrapper<AuthedContributor>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  CacheControlScope: CacheControlScope;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Loo: ResolverTypeWrapper<Loo>;
  LooFilter: LooFilter;
  Mutation: ResolverTypeWrapper<{}>;
  MutationResponse: ResolversTypes['ReportMutationResponse'];
  OpeningTimes: ResolverTypeWrapper<Scalars['OpeningTimes']>;
  Point: ResolverTypeWrapper<Point>;
  PointInput: PointInput;
  ProximityInput: ProximityInput;
  Query: ResolverTypeWrapper<{}>;
  RemovalReportInput: RemovalReportInput;
  Report: ResolverTypeWrapper<Report>;
  ReportInput: ReportInput;
  ReportMutationResponse: ResolverTypeWrapper<ReportMutationResponse>;
  Statistics: ResolverTypeWrapper<Statistics>;
  String: ResolverTypeWrapper<Scalars['String']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  AdminGeo: AdminGeo;
  AreaToiletCount: AreaToiletCount;
  AuthedContributor: AuthedContributor;
  Boolean: Scalars['Boolean'];
  DateTime: Scalars['DateTime'];
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Loo: Loo;
  LooFilter: LooFilter;
  Mutation: {};
  MutationResponse: ResolversParentTypes['ReportMutationResponse'];
  OpeningTimes: Scalars['OpeningTimes'];
  Point: Point;
  PointInput: PointInput;
  ProximityInput: ProximityInput;
  Query: {};
  RemovalReportInput: RemovalReportInput;
  Report: Report;
  ReportInput: ReportInput;
  ReportMutationResponse: ReportMutationResponse;
  Statistics: Statistics;
  String: Scalars['String'];
};

export type CacheControlDirectiveArgs = {
  inheritMaxAge?: Maybe<Scalars['Boolean']>;
  maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>;
};

export type CacheControlDirectiveResolver<Result, Parent, ContextType = any, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AdminGeoResolvers<ContextType = any, ParentType extends ResolversParentTypes['AdminGeo'] = ResolversParentTypes['AdminGeo']> = {
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AreaToiletCountResolvers<ContextType = any, ParentType extends ResolversParentTypes['AreaToiletCount'] = ResolversParentTypes['AreaToiletCount']> = {
  active?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  removed?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type AuthedContributorResolvers<ContextType = any, ParentType extends ResolversParentTypes['AuthedContributor'] = ResolversParentTypes['AuthedContributor']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  legacy_id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  submitRemovalReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitRemovalReportArgs>>;
  submitReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitReportArgs>>;
  submitVerificationReport?: Resolver<Maybe<ResolversTypes['ReportMutationResponse']>, ParentType, ContextType, Partial<MutationSubmitVerificationReportArgs>>;
};

export type MutationResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['MutationResponse'] = ResolversParentTypes['MutationResponse']> = {
  __resolveType: TypeResolveFn<'ReportMutationResponse', ParentType, ContextType>;
  code?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  message?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export interface OpeningTimesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['OpeningTimes'], any> {
  name: 'OpeningTimes';
}

export type PointResolvers<ContextType = any, ParentType extends ResolversParentTypes['Point'] = ResolversParentTypes['Point']> = {
  lat?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lng?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  areas?: Resolver<Array<ResolversTypes['AdminGeo']>, ParentType, ContextType>;
  legacyReportsForLoo?: Resolver<Array<ResolversTypes['Report']>, ParentType, ContextType, RequireFields<QueryLegacyReportsForLooArgs, 'id'>>;
  loo?: Resolver<Maybe<ResolversTypes['Loo']>, ParentType, ContextType, Partial<QueryLooArgs>>;
  looNamesByIds?: Resolver<Array<ResolversTypes['Loo']>, ParentType, ContextType, Partial<QueryLooNamesByIdsArgs>>;
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
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  AdminGeo?: AdminGeoResolvers<ContextType>;
  AreaToiletCount?: AreaToiletCountResolvers<ContextType>;
  AuthedContributor?: AuthedContributorResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Loo?: LooResolvers<ContextType>;
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
