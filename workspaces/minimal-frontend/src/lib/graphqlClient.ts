export interface GraphQLRequestOptions {
  query: string;
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface GraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}

export class GraphQLClient {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async request<T>(options: GraphQLRequestOptions): Promise<T> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: JSON.stringify({
        query: options.query,
        variables: options.variables ?? {},
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GraphQLResponse<T>;

    if (payload.errors && payload.errors.length > 0) {
      const [firstError] = payload.errors;
      throw new Error(firstError.message ?? 'Unknown GraphQL error');
    }

    return payload.data;
  }
}

const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT ?? '/api/graphql';

export const graphQLClient = new GraphQLClient(endpoint);
