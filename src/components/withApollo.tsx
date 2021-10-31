import { NextPage } from 'next';
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

export const withApollo = (Comp: NextPage) =>
  function WithApollo(props: any) {
    return (
      <ApolloProvider client={getApolloClient(props.data)}>
        <Comp {...props} />
      </ApolloProvider>
    );
  };

export const getApolloClient = (initialState?: NormalizedCacheObject) => {
  const url =
    process.env.NODE_ENV === 'development'
      ? process.env.AUTH0_BASE_URL
      : process.env.VERCEL_URL;
  const httpLink = createHttpLink({
    uri: typeof window === 'undefined' ? url + '/api' : '/api',
    fetch,
  });
  const cache = new InMemoryCache().restore(initialState || {});
  return new ApolloClient({
    link: httpLink,
    cache,
  });
};
