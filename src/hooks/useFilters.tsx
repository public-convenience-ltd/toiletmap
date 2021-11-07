import { useEffect, useState, useMemo } from 'react';
import config, { FILTERS_KEY } from '../config';

const useFilters = (toilets) => {
  let initialState = config.getSettings(FILTERS_KEY);
  // default any unsaved filters as 'false'
  config.filters.forEach((filter) => {
    initialState[filter.id] = initialState[filter.id] || false;
  });
  const [filters, setFilters] = useState(initialState);

  // keep local storage and state in sync
  useEffect(() => {
    window.localStorage.setItem(FILTERS_KEY, JSON.stringify(filters));
  }, [filters]);

  return {
    filters,
    setFilters,
  };
};

export default useFilters;
