import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import isPropValid from '@emotion/is-prop-valid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFilter,
  faPoundSign,
  faBaby,
  faPlusCircle,
  faWheelchair,
  faVenusMars,
  faGenderless,
  faKey,
  faCog,
  faAngleRight,
} from '@fortawesome/free-solid-svg-icons';

import VisuallyHidden from './VisuallyHidden';

import Box from './Box';
import Text from './Text';
import Button from './Button';
import LocationSearch from './LocationSearch';
import Switch from './Switch';
import Divider from './Divider';

const Arrow = styled(
  (props) => <FontAwesomeIcon icon={faAngleRight} {...props} />,
  {
    shouldForwardProp: (prop) => {
      return isPropValid(prop) && prop !== 'isExpanded';
    },
  }
)`
  transition: transform 0.25s ease;

  ${(props) =>
    props.isExpanded &&
    `
    transform: rotate(90deg);
  `}
`;

Arrow.propTypes = {
  isExpanded: PropTypes.bool,
};

// Todo: obtain via query
const filters = [
  {
    id: 'free',
    label: 'Free',
    value: false,
    icon: faPoundSign,
  },
  {
    id: 'baby-changing',
    label: 'Baby Changing',
    value: false,
    icon: faBaby,
  },
  {
    id: 'accessible',
    label: 'Accessible',
    value: false,
    icon: faWheelchair,
  },
  {
    id: 'unisex',
    label: 'Unisex',
    value: false,
    icon: faVenusMars,
  },
  {
    id: 'gender-neutral',
    label: 'Gender Neutral',
    value: false,
    icon: faGenderless,
  },
  {
    id: 'radar-key',
    label: 'Radar Key',
    value: false,
    icon: faKey,
  },
  {
    id: 'automatic',
    label: 'Automatic',
    value: false,
    icon: faCog,
  },
];

const Sidebar = () => {
  const [isAddExpanded, setIsAddExpanded] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // map filter data to state
  let state = {};
  filters.forEach((filter) => {
    state[filter.id] = filter.value;
  });

  const [filterState, setFilterState] = useState(state);

  const resetFilters = () => {
    let state = {};

    filters.forEach((filter) => {
      state[filter.id] = false;
    });

    setFilterState(state);
  };

  return (
    <Box
      as="aside"
      position="absolute"
      top={3}
      left={3}
      p={4}
      borderRadius={35}
      bg="white"
      width="100%"
      maxWidth={326}
    >
      <section aria-labelledby="heading-search">
        <h2 id="heading-search">
          <b>Search</b>
        </h2>

        <Box mt={3}>
          <LocationSearch />
        </Box>
      </section>

      {isFilterExpanded && <Divider />}

      <Box as="section" my={4} aria-labelledby="heading-filters">
        <h2 id="heading-filters">
          <VisuallyHidden>Filters</VisuallyHidden>
        </h2>

        <Box display="flex" justifyContent="space-between">
          <Box
            as="button"
            type="button"
            display="flex"
            alignItems="flex-end"
            aria-expanded={isFilterExpanded}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <FontAwesomeIcon icon={faFilter} fixedWidth size="lg" />
            <Box as="b" mx={2}>
              <Text lineHeight={1}>Filter</Text>
            </Box>
            <Arrow isExpanded={isFilterExpanded} />
          </Box>

          {isFilterExpanded && (
            <Text fontSize={12}>
              <Box
                as="button"
                type="button"
                onClick={resetFilters}
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
          <ul>
            {filters.map((filter, index) => (
              <Box
                as="li"
                key={filter.id}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={index ? 3 : undefined}
              >
                <Box display="flex" alignItems="center">
                  <FontAwesomeIcon icon={filter.icon} fixedWidth size="lg" />
                  <Box ml={3} id={`filter-${filter.id}`}>
                    {filter.label}
                  </Box>
                </Box>

                <Switch
                  name={filter.id}
                  checked={filterState[filter.id]}
                  aria-labelledby={`filter-${filter.id}`}
                  onClick={() =>
                    setFilterState({
                      ...filterState,
                      [filter.id]: !filterState[filter.id],
                    })
                  }
                />
              </Box>
            ))}
          </ul>
        </Box>
      </Box>

      {(isFilterExpanded || isAddExpanded) && <Divider />}

      <Box as="section" mt={4} aria-labelledby="heading-add">
        <h2 id="heading-add">
          <VisuallyHidden>Add a Loo</VisuallyHidden>
        </h2>

        <Box
          as="button"
          type="button"
          aria-expanded={isAddExpanded}
          onClick={() => setIsAddExpanded(!isAddExpanded)}
          display="flex"
          alignItems="flex-end"
        >
          <FontAwesomeIcon icon={faPlusCircle} fixedWidth size="lg" />
          <Box as="b" mx={2}>
            <Text lineHeight={1}>Add a Loo</Text>
          </Box>
          <Arrow isExpanded={isAddExpanded} />
        </Box>

        <Box px={2} pt={4} hidden={!isAddExpanded}>
          <Text fontSize={14}>
            <p>
              Before you can contribute data we'll need to know who to thank.
            </p>
            <p>
              We'll only store the first part of the email address you give us
              against the data you contribute.
            </p>
            <p>Login or sign up to let us know you're real.</p>
          </Text>

          <Box mt={3}>
            <Button
              type="secondary"
              css={{
                width: '100%',
              }}
            >
              Login / Sign Up
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
