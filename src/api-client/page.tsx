import * as Types from './graphql';

import * as Operations from './graphql';
import { NextPage } from 'next';
import { NextRouter, useRouter } from 'next/router'
import { QueryHookOptions, useQuery } from '@apollo/client';
import * as Apollo from '@apollo/client';
import type React from 'react';
import { getApolloClient } from '../components/withApollo';
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


