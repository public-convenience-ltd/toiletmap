import { useState, useRef, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';

import { useMapState } from '../../../components/MapState';

import Button from '../Button';
import Filters from '../../../components/Filters';
import Icon from '../Icon';
import LocationSearch from '../../../components/LocationSearch';
import Stack from '../../layout/Stack';
import VisuallyHidden from '../../utilities/VisuallyHidden';

import config from '../../../config';

const Drawer = dynamic(() => import('../Drawer'));

const Sidebar = () => {
  const [mapState, setMapState] = useMapState();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const filterToggleRef = useRef(null);

  const filterPanel = useMemo(
    () =>
      (isFilterExpanded || isFiltersExpanded) && (
        <Filters
          appliedFilters={mapState.appliedFilters}
          onChange={(appliedFilters) => {
            setMapState({ ...mapState, appliedFilters: { ...appliedFilters } });
          }}
        />
      ),
    [isFilterExpanded, isFiltersExpanded, mapState, setMapState],
  );

  const [appliedFilterCount, setAppliedFilterCount] = useState(0);

  useEffect(
    function setTheAmountOfAppliedFilters() {
      setAppliedFilterCount(
        config.filters
          .map(({ id }) => mapState.appliedFilters?.[id] === true)
          .reduce((v, c) => +c + v, 0),
      );
    },
    [mapState.appliedFilters],
  );

  const appliedFilterCountRendered = useMemo(() => {
    return appliedFilterCount > 0 && <b>({appliedFilterCount})</b>;
  }, [appliedFilterCount]);

  return (
    <section className="sidebar" aria-labelledby="heading-search">
      <div className="sidebar__smaller-devices">
        <Stack>
          <VisuallyHidden as="span" id="heading-search">
            <h2>Search</h2>
          </VisuallyHidden>

          <LocationSearch
            onSelectedItemChange={(searchLocation) =>
              setMapState({ searchLocation })
            }
          />

          <div className="sidebar__filter">
            <Button
              htmlElement="button"
              variant="secondary"
              ref={filterToggleRef}
              aria-expanded={isFiltersExpanded}
              onClick={() => {
                setIsFiltersExpanded(!isFiltersExpanded);
              }}
              aria-label="Filters Panel"
              data-cy="mobile-filter"
            >
              <Icon icon="filter" size="medium" />
              <span>Filter</span>
            </Button>
            <Button
              htmlElement="button"
              type="button"
              variant="primary"
              onClick={() => mapState?.locationServices?.startLocate()}
              aria-label="Find a toilet near me"
            >
              Find a toilet near me
            </Button>
          </div>
        </Stack>

        <Drawer visible={isFiltersExpanded} animateFrom="left">
          <Stack>
            <div className="sidebar__filter">
              <h2 className="sidebar__heading">
                <Icon icon="filter" size="medium" />
                <b>Filter </b>
                {appliedFilterCountRendered}
              </h2>
              <button
                onClick={() =>
                  setMapState({ ...mapState, appliedFilters: undefined })
                }
              >
                Reset Filter
              </button>
            </div>

            {filterPanel}

            <Button
              htmlElement="button"
              variant="primary"
              type="button"
              onClick={() => {
                setIsFiltersExpanded(false);
                // return focus to the control that invoked the filter overlay
                filterToggleRef.current.focus();
              }}
            >
              Done
            </Button>
          </Stack>
        </Drawer>
      </div>

      <div className="sidebar__larger-devices">
        <Stack>
          <h2 className="sidebar__heading" id="heading-search">
            Search
          </h2>
          <LocationSearch
            onSelectedItemChange={(searchLocation) =>
              setMapState({ searchLocation })
            }
          />
          <section aria-labelledby="heading-filters">
            <h2 id="heading-filters">
              <VisuallyHidden as="span">
                Filters — {appliedFilterCount} filters are applied.
              </VisuallyHidden>
            </h2>
            <Stack>
              <div className="sidebar__filter">
                <button
                  className="sidebar__button"
                  aria-expanded={isFilterExpanded}
                  onClick={() => {
                    setIsFilterExpanded(!isFilterExpanded);
                  }}
                >
                  <Icon icon="filter" size="medium" />
                  <span>
                    Filter
                    {appliedFilterCountRendered}
                  </span>
                  <Icon icon="angle-right" size="medium" />
                </button>
                {isFilterExpanded && (
                  <button
                    onClick={() =>
                      setMapState({ ...mapState, appliedFilters: undefined })
                    }
                  >
                    Reset Filter
                  </button>
                )}
              </div>
              <div hidden={!isFilterExpanded}>{filterPanel}</div>
            </Stack>
          </section>
          <section aria-labelledby="heading-add">
            <h2 id="heading-add">
              <VisuallyHidden as="span">Add a toilet</VisuallyHidden>
            </h2>
            <a
              className="sidebar__button"
              href={`/loos/add?lat=${mapState.center.lat}&lng=${mapState.center.lng}`}
            >
              <Icon icon="circle-plus" size="medium" />
              <span>Add a Toilet</span>
              <Icon icon="angle-right" size="medium" />
            </a>
          </section>
          <section aria-labelledby="heading-find">
            <h2 id="heading-find">
              <VisuallyHidden as="span">Find a toilet near me</VisuallyHidden>
            </h2>
            <button
              className="sidebar__button"
              onClick={() => mapState?.locationServices?.startLocate()}
            >
              <Icon icon="map-location-dot" size="medium" />
              <span>Find a toilet near me</span>
              <Icon icon="angle-right" size="medium" />
            </button>
          </section>
        </Stack>
      </div>
    </section>
  );
};

export default Sidebar;
