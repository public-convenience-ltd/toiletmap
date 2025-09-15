import { useState, useRef, useMemo, useEffect } from 'react';
import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';
import Link from 'next/link';

import { Media } from '../Media';
import VisuallyHidden from '../../design-system/utilities/VisuallyHidden';
import Box from '../Box';
import Text from '../Text';
import Icon from '../../design-system/components/Icon';
import LocationSearch from '../LocationSearch';
import Filters from '../Filters';
import Button from '../../design-system/components/Button';
import { useMapState } from '../MapState';
import config from '../../config';
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

  // State for the share button text and the ARIA live region
  const [shareText, setShareText] = useState('Share');
  const [copiedMessage, setCopiedMessage] = useState('');

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

  // Build the share URL from the current location (works across dev/staging/prod).
  const buildShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('lat', String(mapState.center.lat));
    url.searchParams.set('lng', String(mapState.center.lng));
    url.searchParams.set('zoom', String(mapState.zoom));
    return url.toString();
  };

  const handleShare = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareText('Link copied');
      setCopiedMessage('Link copied to clipboard');
    } catch (err) {
      console.error('Share failed: ', err);
    } finally {
      setTimeout(() => {
        setShareText('Share');
        setCopiedMessage('');
      }, 2000);
    }
  };

  return (
    <section aria-labelledby="heading-search">
      {/* ARIA live region to announce copy status to screen readers */}
      <VisuallyHidden as="span" aria-live="polite" role="status">
        {copiedMessage}
      </VisuallyHidden>

      <Media lessThan="md">
        <VisuallyHidden as="span" id="heading-search">
          Search
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
          <Box display="flex" mt={3}>
            <Button
              htmlElement="button"
              type="button"
              variant="primary"
              onClick={handleShare}
              aria-label="Share your current map view"
            >
              {shareText}
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
          <span id="heading-search">
            <b>Search</b>
          </span>

          <Box mt={3}>
            <LocationSearch
              onSelectedItemChange={(searchLocation) =>
                setMapState({ searchLocation })
              }
            />
          </Box>

          <Box as="section" my={4} aria-labelledby="heading-filters">
            <h2 id="heading-filters">
              <VisuallyHidden as="span">
                Filters — {appliedFilterCount} filters are applied.
              </VisuallyHidden>
            </h2>

            <Box display="flex" justifyContent="space-between">
              <Box
                as="button"
                // @ts-expect-error -- Generic box component can't handle these props
                type="button"
                display="flex"
                alignItems="center"
                aria-expanded={isFilterExpanded}
                onClick={() => {
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
                    // @ts-expect-error -- Generic box component can't handle these props
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
              <VisuallyHidden as="span">Add a toilet</VisuallyHidden>
            </h2>
            <StyledNavLink
              href={`/loos/add?lat=${mapState.center.lat}&lng=${mapState.center.lng}`}
            >
              {/* @ts-expect-error -- Generic box component can't handle these props */}
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
                <VisuallyHidden as="span">Find a toilet near me</VisuallyHidden>
              </h2>
              <Box
                as="button"
                // @ts-expect-error -- Generic box component can't handle these props
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

            <Box
              as="section"
              mt={4}
              display="flex"
              aria-labelledby="heading-share"
            >
              <h2 id="heading-share">
                <VisuallyHidden as="span">
                  Share your current location
                </VisuallyHidden>
              </h2>
              <Button
                htmlElement="button"
                type="button"
                variant="secondary"
                onClick={handleShare}
                aria-label="Share your current map view"
              >
                {shareText}
                <Icon
                  icon="share"
                  data-test="share-location"
                  style={{
                    marginLeft: '8px',
                  }}
                  aria-hidden={true}
                  size="medium"
                />
              </Button>
            </Box>
          </Box>
        </Box>
      </Media>
    </section>
  );
};

export default Sidebar;
