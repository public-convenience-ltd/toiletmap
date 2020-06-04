import React from 'react';
import { GraphQLClient } from 'graphql-request';

import { isAuthenticated } from '../Auth';

const API_ENDPOINT = '/api';

const accessToken = localStorage.getItem('access_token');

const graphQLClient = new GraphQLClient(API_ENDPOINT, {
  headers: {
    authorization: isAuthenticated ? `Bearer ${accessToken}` : '',
  },
});

const fetcher = (query, variables) => graphQLClient.request(query, variables);

export const setAuthHeader = (token) => {
  graphQLClient.setHeader('authorization', token ? `Bearer ${token}` : '');
};

export const useMutation = (mutation) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState();
  const [data, setData] = React.useState();

  const doMutation = (variables) => {
    return new Promise((resolve, reject) => {
      setIsLoading(true);

      fetcher(mutation, variables)
        .then((data) => {
          setIsLoading(false);
          setData(data);
          resolve(data);
        })
        .catch((err) => {
          setIsLoading(false);
          setError(err);
          reject(err);
        });
    });
  };

  return [
    doMutation,
    {
      isLoading,
      error,
      data,
    },
  ];
};

export default fetcher;
