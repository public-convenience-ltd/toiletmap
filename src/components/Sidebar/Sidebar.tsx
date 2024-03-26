import { useState, useRef, useMemo, useEffect } from 'react';
import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';
import Link from 'next/link';

import { Media } from '../Media';
import VisuallyHidden from '../VisuallyHidden';
import Box from '../Box';
import Text from '../Text';
import Icon from '../../design-system/components/Icon';
import LocationSearch from '../LocationSearch';
import Filters from '../Filters';
import Button from '../../design-system/components/Button';
import { useMapState } from '../MapState';
import config from '../../config';
import { usePlausible } from 'next-plausible';
import dynamic from 'next/dynamic';

const Drawer = dynamic(() => import('../../design-system/components/Drawer'));

interface Props {
  isExpanded?: boolean;
}

const Arrow = styled(
  (props: Props) => (
    <span {...props}>
      <Icon icon="angle-right" size="small" />
    </span>
  ),
  {
    shouldForwardProp: (prop) => {
      return isPropValid(prop) && prop !== 'isExpanded';
    },
  },
)`
  transition: transform 0.2s ease;

  ${(props: { isExpanded: unknown }) =>
    props.isExpanded &&
    `
    transform: rotate(90deg);
  `}
`;

const StyledNavLink = styled(Link)`
  display: flex;
  align-items: center;
`;

const Sidebar = () => {
  const [mapState, setMapState] = useMapState();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const filterToggleRef = useRef(null);

  // Show the filters panel on first pageload if there is a filter set.
  // TODO: Disabled for now until decided how this behaviour should work.
  // useEffect(() => {
  //   if (mapState.appliedFilters) {
  //     const isThereAFilterSet = Object.values(mapState.appliedFilters).some(
  //       (filterState) => filterState
  //     );
  //     console.log(mapState.appliedFilters);

  //     setIsFilterExpanded(isThereAFilterSet);
  //   }
  // }, [mapState.appliedFilters]);

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
  const plausible = usePlausible();
  return (
    <section aria-labelledby="heading-search">
      <Media lessThan="md">
        <VisuallyHidden>
          <h2 id="heading-search">Search</h2>
        </VisuallyHidden>

        <LocationSearch
          onSelectedItemChange={(searchLocation) =>
            setMapState({ searchLocation })
          }
        />

        <Box display="flex" flexWrap="wrap" justifyContent="center">
          <Box display="flex" mt={3} mr={1}>
            <Button
              htmlElement="button"
              variant="secondary"
              ref={filterToggleRef}
              aria-expanded={isFiltersExpanded}
              onClick={() => {
                const stateText = isFiltersExpanded ? 'Close' : 'Open';
                plausible(`${stateText} Filters Panel`);
                setIsFiltersExpanded(!isFiltersExpanded);
              }}
              aria-label="Filters Panel"
              data-cy="mobile-filter"
            >
              <Icon icon="filter" size="medium" />
              <span>Filter</span>
            </Button>
          </Box>
          <Box display="flex" mt={3}>
            <Button
              htmlElement="button"
              type="button"
              variant="primary"
              onClick={() => mapState?.locationServices?.startLocate()}
              aria-label="Find a toilet near me"
            >
              Find a toilet near me
            </Button>
          </Box>
        </Box>
        <Drawer visible={isFiltersExpanded} animateFrom="left">
          <Box display="flex" justifyContent="space-between" mb={4}>
            <Box display="flex" alignItems="flex-end">
              <Icon icon="filter" size="medium" />
              <Box as="h2" mx={2}>
                <Text lineHeight={1}>
                  <b>Filter </b>
                  {appliedFilterCountRendered}
                </Text>
              </Box>
            </Box>

            <Text fontSize={12}>
              <Box
                as="button"
                itemType="button"
                onClick={() =>
                  setMapState({ ...mapState, appliedFilters: undefined })
                }
                border={0}
                borderBottom={2}
                borderStyle="solid"
              >
                Reset Filter
              </Box>
            </Text>
          </Box>

          {filterPanel}

          <Box display="flex" justifyContent="center" mt={4}>
            <Button
              htmlElement="button"
              variant="secondary"
              type="button"
              onClick={() => {
                setIsFiltersExpanded(false);

                // return focus to the control that invoked the filter overlay
                filterToggleRef.current.focus();
              }}
              css={{
                width: '100%',
              }}
            >
              Done
            </Button>
          </Box>
        </Drawer>
      </Media>

      <Media greaterThan="sm">
        <Box p={4} borderRadius={35} bg="white" width="100%">
          <h2 id="heading-search">
            <b>Search</b>
          </h2>

          <Box mt={3}>
            <LocationSearch
              onSelectedItemChange={(searchLocation) =>
                setMapState({ searchLocation })
              }
            />
          </Box>

          <Box as="section" my={4} aria-labelledby="heading-filters">
            <h2 id="heading-filters">
              <VisuallyHidden>
                Filters — {appliedFilterCount} filters are applied.
              </VisuallyHidden>
            </h2>

            <Box display="flex" justifyContent="space-between">
              <Box
                as="button"
                type="button"
                display="flex"
                alignItems="center"
                aria-expanded={isFilterExpanded}
                onClick={() => {
                  const stateText = isFilterExpanded ? 'Close' : 'Open';
                  plausible(`${stateText} Filters Panel`);
                  setIsFilterExpanded(!isFilterExpanded);
                }}
              >
                <Icon icon="filter" size="medium" />
                <Box mx={2}>
                  <Text lineHeight={1}>
                    <b>Filter </b>
                    {appliedFilterCountRendered}
                  </Text>
                </Box>
                <Arrow isExpanded={isFilterExpanded} />
              </Box>

              {isFilterExpanded && (
                <Text fontSize={12}>
                  <Box
                    as="button"
                    type="button"
                    onClick={() =>
                      setMapState({ ...mapState, appliedFilters: undefined })
                    }
                    border={0}
                    borderBottom={2}
                    borderStyle="solid"
                  >
                    Reset Filter
                  </Box>
                </Text>
              )}
            </Box>

            <Box pt={4} hidden={!isFilterExpanded}>
              {filterPanel}
            </Box>
          </Box>

          <Box as="section" mt={4} aria-labelledby="heading-add">
            <h2 id="heading-add">
              <VisuallyHidden>Add a toilet</VisuallyHidden>
            </h2>
            <StyledNavLink
              href={`/loos/add?lat=${mapState.center.lat}&lng=${mapState.center.lng}`}
            >
              <Box display="flex" alignItems="center" as="button" type="button">
                <Icon icon="circle-plus" size="medium" />
                <Box mx={2}>
                  <Text lineHeight={1}>
                    <b>Add a Toilet</b>
                  </Text>
                </Box>
                <Arrow isExpanded={false} />
              </Box>
            </StyledNavLink>
            <Box as="section" mt={4} aria-labelledby="heading-find">
              <h2 id="heading-find">
                <VisuallyHidden>Find a toilet near me</VisuallyHidden>
              </h2>
              <Box
                as="button"
                type="button"
                display="flex"
                alignItems="center"
                onClick={() => mapState?.locationServices?.startLocate()}
              >
                <Icon icon="map-location-dot" size="medium" />
                <Box mx={2}>
                  <Text lineHeight={1}>
                    <b>Find a toilet near me</b>
                  </Text>
                </Box>
                <Arrow isExpanded={false} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Media>
    </section>
  );
};

export default Sidebar;
