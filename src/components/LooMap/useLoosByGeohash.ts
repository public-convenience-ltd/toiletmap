/**
 * Custom hook for fetching loo data by geohash
 * Uses REST API when NEXT_PUBLIC_REST_API_ENABLED=true with GraphQL fallback
 * Uses GraphQL exclusively when the env var is not set or false
 */

import { useEffect, useState, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  LoosByGeohashDocument,
  useLoosByGeohashQuery,
  LoosByGeohashQuery,
} from '../../api-client/graphql';
import { fetchCompressedLoos } from '../../lib/api/compressed-loo-api';

interface UseLoosByGeohashResult {
  data: LoosByGeohashQuery | undefined;
  loading: boolean;
  error: Error | undefined;
}

/**
 * Fetches loo data by geohash with environment-aware data source selection
 *
 * When NEXT_PUBLIC_REST_API_ENABLED === 'true':
 * - Attempts to fetch from REST API first
 * - Falls back to GraphQL on any error
 * - Writes REST data to Apollo cache for compatibility
 *
 * When NEXT_PUBLIC_REST_API_ENABLED is not set or false:
 * - Uses GraphQL exclusively
 *
 * @param geohash - The geohash tile to fetch loos for
 * @param active - Whether to only return active loos (default: true)
 * @returns Object with data, loading, and error properties (same interface as useLoosByGeohashQuery)
 */
export function useLoosByGeohash(
  geohash: string,
  active: boolean = true,
): UseLoosByGeohashResult {
  const apolloClient = useApolloClient();
  const [data, setData] = useState<LoosByGeohashQuery | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [shouldUseGraphQL, setShouldUseGraphQL] = useState(false);

  // Use ref to track if component is mounted (avoid state updates on unmounted component)
  const isMountedRef = useRef(true);

  // Check if new REST API is enabled via environment variable
  // Defaults to false if not set
  const isRestApiEnabled = process.env.NEXT_PUBLIC_REST_API_ENABLED === 'true';

  // Use GraphQL hook conditionally
  const graphqlResult = useLoosByGeohashQuery({
    variables: { geohash, active },
    fetchPolicy: 'cache-first',
    skip: isRestApiEnabled && !shouldUseGraphQL,
  });

  // REST API enabled: try REST API with GraphQL fallback
  useEffect(() => {
    isMountedRef.current = true;

    // If REST API is not enabled, skip this effect
    if (!isRestApiEnabled) {
      return;
    }

    // If we're already using GraphQL fallback, don't run REST fetch
    if (shouldUseGraphQL) {
      return;
    }

    let isCancelled = false;

    const fetchFromRestApi = async () => {
      try {
        setLoading(true);
        setError(undefined);

        const normalizedData = await fetchCompressedLoos(geohash, active);

        // Don't update state if component unmounted or request cancelled
        if (isCancelled || !isMountedRef.current) {
          return;
        }

        // Write to Apollo cache for compatibility with useRetrieveCachedLoos
        apolloClient.writeQuery({
          query: LoosByGeohashDocument,
          variables: { geohash, active },
          data: { loosByGeohash: normalizedData },
        });

        setData({ loosByGeohash: normalizedData });
        setLoading(false);
      } catch (err) {
        // Log error and fallback to GraphQL
        console.warn(
          `REST API failed for geohash ${geohash}, falling back to GraphQL:`,
          err instanceof Error ? err.message : String(err),
        );

        if (isCancelled || !isMountedRef.current) {
          return;
        }

        // Enable GraphQL fallback
        setShouldUseGraphQL(true);
      }
    };

    fetchFromRestApi();

    return () => {
      isCancelled = true;
    };
  }, [geohash, active, apolloClient, shouldUseGraphQL, isRestApiEnabled]);

  // If using GraphQL fallback (when REST API enabled), sync GraphQL result to state
  useEffect(() => {
    if (isRestApiEnabled && shouldUseGraphQL) {
      setData(graphqlResult.data);
      setLoading(graphqlResult.loading);
      setError(graphqlResult.error);
    }
  }, [
    isRestApiEnabled,
    shouldUseGraphQL,
    graphqlResult.data,
    graphqlResult.loading,
    graphqlResult.error,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // REST API disabled: return GraphQL result directly
  if (!isRestApiEnabled) {
    return {
      data: graphqlResult.data,
      loading: graphqlResult.loading,
      error: graphqlResult.error,
    };
  }

  // REST API enabled: return managed state
  return { data, loading, error };
}
