import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import { useTheme } from 'emotion-theming';
import isPropValid from '@emotion/is-prop-valid';
import {
  faFilter,
  faAngleRight,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom';

import VisuallyHidden from './VisuallyHidden';
import Box from './Box';
import Text from './Text';
import Icon from './Icon';
import LocationSearch from './LocationSearch';
import Filters from './Filters';

const Arrow = styled((props) => <Icon icon={faAngleRight} {...props} />, {
  shouldForwardProp: (prop) => {
    return isPropValid(prop) && prop !== 'isExpanded';
  },
})`
  transition: transform 0.2s ease;

  ${(props) =>
    props.isExpanded &&
    `
    transform: rotate(90deg);
  `}
`;

Arrow.propTypes = {
  isExpanded: PropTypes.bool,
};

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
`;

const Sidebar = ({
  filters,
  onFilterChange,
  onSelectedItemChange,
  mapCenter,
}) => {
  const theme = useTheme();
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  return (
    <Box
      position="absolute"
      top={3}
      left={3}
      p={4}
      borderRadius={35}
      bg="white"
      width="100%"
      maxHeight={`calc(100% - ${theme.space[4]}px)`}
      maxWidth={326}
      overflowY="auto"
    >
      <section aria-labelledby="heading-search">
        <h2 id="heading-search">
          <b>Search</b>
        </h2>

        <Box mt={3}>
          <LocationSearch onSelectedItemChange={onSelectedItemChange} />
        </Box>
      </section>

      <Box as="section" my={4} aria-labelledby="heading-filters">
        <h2 id="heading-filters">
          <VisuallyHidden>Filters</VisuallyHidden>
        </h2>

        <Box display="flex" justifyContent="space-between">
          <Box
            as="button"
            type="button"
            display="flex"
            alignItems="center"
            aria-expanded={isFilterExpanded}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <Icon icon={faFilter} fixedWidth size="lg" />
            <Box mx={2}>
              <Text lineHeight={1}>
                <b>Filter</b>
              </Text>
            </Box>
            <Arrow isExpanded={isFilterExpanded} />
          </Box>

          {isFilterExpanded && (
            <Text fontSize={12}>
              <Box
                as="button"
                type="button"
                onClick={() => onFilterChange({})}
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
          <Filters filters={filters} onFilterChange={onFilterChange} />
        </Box>
      </Box>

      <Box as="section" mt={4} aria-labelledby="heading-add">
        <h2 id="heading-add">
          <VisuallyHidden>Add a Loo</VisuallyHidden>
        </h2>
        <StyledNavLink
          to={`/loos/add?lat=${mapCenter.lat}&lng=${mapCenter.lng}`}
        >
          <Icon icon={faPlusCircle} fixedWidth size="lg" />
          <Box mx={2}>
            <Text lineHeight={1}>
              <b>Add a Loo</b>
            </Text>
          </Box>
          <Arrow />
        </StyledNavLink>
      </Box>
    </Box>
  );
};

Sidebar.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSelectedItemChange: PropTypes.func.isRequired,
};

export default Sidebar;
