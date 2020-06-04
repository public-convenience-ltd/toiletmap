import { request } from 'graphql-request';

const fetcher = (query, variables) => request('/api', query, variables);

export default fetcher;
