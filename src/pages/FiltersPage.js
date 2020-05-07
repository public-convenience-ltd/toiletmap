import React, { useState } from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

import headings from '../css/headings.module.css';
import layout from '../components/css/layout.module.css';
import controls from '../css/controls.module.css';
import filters from './css/filters.module.css';

// Todo: obtain via query
const filterData = [
  {
    id: 'free',
    label: 'Free',
    value: false,
  },
  {
    id: 'baby-changing',
    label: 'Baby Changing',
    value: true,
  },
];

// Todo: handle change or submit
const FiltersPage = (props) => {
  const [mapPosition, setMapPosition] = useMapPosition();

  // map filter data to state
  let state = {};
  filterData.forEach((filter) => {
    state[filter.id] = filter.value;
  });

  const [filterState, setFilterState] = useState(state);

  const { data } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
  });

  const mainFragment = (
    <div>
      <div className={layout.controls}>
        {config.showBackButtons && (
          <button onClick={props.history.goBack} className={controls.btn}>
            Back
          </button>
        )}
      </div>

      <h2 className={headings.regular}>Filters</h2>

      <ul className={filters.list}>
        {filterData.map((filter) => (
          <li key={filter.id} className={filters.item}>
            <span id={`filter-${filter.id}`}>{filter.label}</span>
            <button
              name={filter.id}
              type="button"
              role="switch"
              aria-checked={filterState[filter.id]}
              aria-labelledby={`filter-${filter.id}`}
              className={filters.control}
              onClick={() =>
                setFilterState({
                  ...filterState,
                  [filter.id]: !filterState[filter.id],
                })
              }
            >
              <span>yes</span>
              <span>no</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <PageLayout
      main={mainFragment}
      map={
        <LooMap
          loos={data}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          onViewportChanged={setMapPosition}
          showContributor
          showCenter
          showSearchControl
          showLocateControl
        />
      }
    />
  );
};

export default FiltersPage;
