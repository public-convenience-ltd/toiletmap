import { NextPage } from 'next';
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import { schema } from '../pages/api';

export const withApollo = (Comp: NextPage) =>
  function WithApollo(props: any) {
    return (
      <ApolloProvider client={getApolloClient()}>
        <Comp />
      </ApolloProvider>
    );
  };

export function getApolloClient(ctx: any): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    ssrMode: true,
    link: new SchemaLink({ schema }),
    cache: new InMemoryCache({}),
  });
}
