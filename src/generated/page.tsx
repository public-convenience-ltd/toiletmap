import * as Types from './graphql';

import * as Operations from './graphql';
import { NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router'
import { QueryHookOptions, useQuery } from '@apollo/client';
import * as Apollo from '@apollo/client';
import type React from 'react';
import { getApolloClient , any} from '../components/withApollo';
export async function getServerPageGetAreaStats
    (options: Omit<Apollo.QueryOptions<Types.GetAreaStatsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.GetAreaStatsQuery>({ ...options, query: Operations.GetAreaStatsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useGetAreaStats = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetAreaStatsQuery, Types.GetAreaStatsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.GetAreaStatsDocument, options);
};
export type PageGetAreaStatsComp = React.FC<{data?: Types.GetAreaStatsQuery, error?: Apollo.ApolloError}>;
export const withPageGetAreaStats = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetAreaStatsQuery, Types.GetAreaStatsQueryVariables>) => (WrappedComponent:PageGetAreaStatsComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.GetAreaStatsDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrGetAreaStats = {
      getServerPage: getServerPageGetAreaStats,
      withPage: withPageGetAreaStats,
      usePage: useGetAreaStats,
    }
export async function getServerPageHeadlineStats
    (options: Omit<Apollo.QueryOptions<Types.HeadlineStatsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.HeadlineStatsQuery>({ ...options, query: Operations.HeadlineStatsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useHeadlineStats = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.HeadlineStatsQuery, Types.HeadlineStatsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.HeadlineStatsDocument, options);
};
export type PageHeadlineStatsComp = React.FC<{data?: Types.HeadlineStatsQuery, error?: Apollo.ApolloError}>;
export const withPageHeadlineStats = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.HeadlineStatsQuery, Types.HeadlineStatsQueryVariables>) => (WrappedComponent:PageHeadlineStatsComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.HeadlineStatsDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrHeadlineStats = {
      getServerPage: getServerPageHeadlineStats,
      withPage: withPageHeadlineStats,
      usePage: useHeadlineStats,
    }
export async function getServerPageFullLooDetails
    (options: Omit<Apollo.QueryOptions<Types.FullLooDetailsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.FullLooDetailsQuery>({ ...options, query: Operations.FullLooDetailsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useFullLooDetails = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FullLooDetailsQuery, Types.FullLooDetailsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.FullLooDetailsDocument, options);
};
export type PageFullLooDetailsComp = React.FC<{data?: Types.FullLooDetailsQuery, error?: Apollo.ApolloError}>;
export const withPageFullLooDetails = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FullLooDetailsQuery, Types.FullLooDetailsQueryVariables>) => (WrappedComponent:PageFullLooDetailsComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.FullLooDetailsDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrFullLooDetails = {
      getServerPage: getServerPageFullLooDetails,
      withPage: withPageFullLooDetails,
      usePage: useFullLooDetails,
    }
export async function getServerPageGetAreas
    (options: Omit<Apollo.QueryOptions<Types.GetAreasQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.GetAreasQuery>({ ...options, query: Operations.GetAreasDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useGetAreas = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetAreasQuery, Types.GetAreasQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.GetAreasDocument, options);
};
export type PageGetAreasComp = React.FC<{data?: Types.GetAreasQuery, error?: Apollo.ApolloError}>;
export const withPageGetAreas = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetAreasQuery, Types.GetAreasQueryVariables>) => (WrappedComponent:PageGetAreasComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.GetAreasDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrGetAreas = {
      getServerPage: getServerPageGetAreas,
      withPage: withPageGetAreas,
      usePage: useGetAreas,
    }
export async function getServerPageGetStats
    (options: Omit<Apollo.QueryOptions<Types.GetStatsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.GetStatsQuery>({ ...options, query: Operations.GetStatsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useGetStats = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetStatsQuery, Types.GetStatsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.GetStatsDocument, options);
};
export type PageGetStatsComp = React.FC<{data?: Types.GetStatsQuery, error?: Apollo.ApolloError}>;
export const withPageGetStats = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetStatsQuery, Types.GetStatsQueryVariables>) => (WrappedComponent:PageGetStatsComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.GetStatsDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrGetStats = {
      getServerPage: getServerPageGetStats,
      withPage: withPageGetStats,
      usePage: useGetStats,
    }
export async function getServerPageGetFormAreas
    (options: Omit<Apollo.QueryOptions<Types.GetFormAreasQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.GetFormAreasQuery>({ ...options, query: Operations.GetFormAreasDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useGetFormAreas = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetFormAreasQuery, Types.GetFormAreasQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.GetFormAreasDocument, options);
};
export type PageGetFormAreasComp = React.FC<{data?: Types.GetFormAreasQuery, error?: Apollo.ApolloError}>;
export const withPageGetFormAreas = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetFormAreasQuery, Types.GetFormAreasQueryVariables>) => (WrappedComponent:PageGetFormAreasComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.GetFormAreasDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrGetFormAreas = {
      getServerPage: getServerPageGetFormAreas,
      withPage: withPageGetFormAreas,
      usePage: useGetFormAreas,
    }
export async function getServerPageGetContributors
    (options: Omit<Apollo.QueryOptions<Types.GetContributorsQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.GetContributorsQuery>({ ...options, query: Operations.GetContributorsDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useGetContributors = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetContributorsQuery, Types.GetContributorsQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.GetContributorsDocument, options);
};
export type PageGetContributorsComp = React.FC<{data?: Types.GetContributorsQuery, error?: Apollo.ApolloError}>;
export const withPageGetContributors = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.GetContributorsQuery, Types.GetContributorsQueryVariables>) => (WrappedComponent:PageGetContributorsComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.GetContributorsDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrGetContributors = {
      getServerPage: getServerPageGetContributors,
      withPage: withPageGetContributors,
      usePage: useGetContributors,
    }
export async function getServerPageSearch
    (options: Omit<Apollo.QueryOptions<Types.SearchQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.SearchQuery>({ ...options, query: Operations.SearchDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useSearch = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.SearchQuery, Types.SearchQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.SearchDocument, options);
};
export type PageSearchComp = React.FC<{data?: Types.SearchQuery, error?: Apollo.ApolloError}>;
export const withPageSearch = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.SearchQuery, Types.SearchQueryVariables>) => (WrappedComponent:PageSearchComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.SearchDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrSearch = {
      getServerPage: getServerPageSearch,
      withPage: withPageSearch,
      usePage: useSearch,
    }
export async function getServerPageFindLooById
    (options: Omit<Apollo.QueryOptions<Types.FindLooByIdQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.FindLooByIdQuery>({ ...options, query: Operations.FindLooByIdDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useFindLooById = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FindLooByIdQuery, Types.FindLooByIdQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.FindLooByIdDocument, options);
};
export type PageFindLooByIdComp = React.FC<{data?: Types.FindLooByIdQuery, error?: Apollo.ApolloError}>;
export const withPageFindLooById = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FindLooByIdQuery, Types.FindLooByIdQueryVariables>) => (WrappedComponent:PageFindLooByIdComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.FindLooByIdDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrFindLooById = {
      getServerPage: getServerPageFindLooById,
      withPage: withPageFindLooById,
      usePage: useFindLooById,
    }
export async function getServerPageFindLoosNearby
    (options: Omit<Apollo.QueryOptions<Types.FindLoosNearbyQueryVariables>, 'query'>, ctx?: any ){
        const apolloClient = getApolloClient(ctx);
        
        const data = await apolloClient.query<Types.FindLoosNearbyQuery>({ ...options, query: Operations.FindLoosNearbyDocument });
        
        const apolloState = apolloClient.cache.extract();

        return {
            props: {
                apolloState: apolloState,
                data: data?.data,
                error: data?.error ?? data?.errors ?? null,
            },
        };
      }
export const useFindLoosNearby = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FindLoosNearbyQuery, Types.FindLoosNearbyQueryVariables>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.FindLoosNearbyDocument, options);
};
export type PageFindLoosNearbyComp = React.FC<{data?: Types.FindLoosNearbyQuery, error?: Apollo.ApolloError}>;
export const withPageFindLoosNearby = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<Types.FindLoosNearbyQuery, Types.FindLoosNearbyQueryVariables>) => (WrappedComponent:PageFindLoosNearbyComp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.FindLoosNearbyDocument, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; 
export const ssrFindLoosNearby = {
      getServerPage: getServerPageFindLoosNearby,
      withPage: withPageFindLoosNearby,
      usePage: useFindLoosNearby,
    }

