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

  // get the filter objects from config for the filters applied by the user
  const applied = config.filters.filter((filter) => filters[filter.id]);

  const filtered = useMemo(() => {
    if (toilets) {
      return toilets.filter((toilet: { [x: string]: any }) =>
        applied.every((filter) => {
          const value = toilet[filter.id];

          if (value === null) {
            return false;
          }

          return !!value;
        })
      );
    }
    return [];
  }, [applied, toilets]);

  return {
    filtered,
    filters,
    setFilters,
  };
};

export default useFilters;
