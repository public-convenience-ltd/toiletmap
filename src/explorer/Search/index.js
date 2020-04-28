import React from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useLocation, useHistory, useRouteMatch } from 'react-router-dom';
import { parse, stringify } from 'query-string';

import Results from './Results';
import SearchForm from './SearchForm';

const SEARCH_QUERY = loader('./search.graphql');

function useSearchVariables() {
  let { search } = useLocation();
  let query = parse(search, {
    parseNumbers: true,
    parseBooleans: true,
  });
  let defaults = {
    text: '',
    order: 'NEWEST_FIRST',
    to_date: '',
    from_date: '',
    contributors: '',
    area_name: '',
    page: 1,
    limit: 10,
  };

  return {
    ...defaults,
    ...query,
  };
}

export default function Search() {
  let history = useHistory();
  let { path } = useRouteMatch();
  let variables = useSearchVariables();
  const { loading, error, data } = useQuery(SEARCH_QUERY, { variables });

  function search(params) {
    console.log(params);
    console.log({ ...variables, ...params });
    let query = stringify({ ...variables, ...params });
    history.push(`${path}?${query}`);
  }

  if (loading) return <p>Loading ...</p>;
  if (error) throw error;
  return (
    <>
      <SearchForm defaultValues={variables} onSubmit={search} />
      <Results
        data={data.loos}
        rowsPerPage={variables.limit}
        handleChangePage={(e, page) => search({ page })}
        handleChangeRowsPerPage={(e) => search({ limit: e.target.value })}
      />
    </>
  );
}
