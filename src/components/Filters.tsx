import React from 'react';
import {
  faPoundSign,
  faBaby,
  faKey,
  faCog,
  faToilet,
} from '@fortawesome/free-solid-svg-icons';
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons';

import Box from './Box';
import Switch from './Switch';
import Icon from './Icon';
import config from '../config';
import type { Filters as FilterTypes } from '../config';
import { usePlausible } from 'next-plausible';

const iconMap = {
  noPayment: faPoundSign,
  babyChange: faBaby,
  accessible: faAccessibleIcon,
  allGender: faToilet,
  radar: faKey,
  automatic: faCog,
};

const Filters: React.FC<{
  appliedFilters: Record<FilterTypes, boolean>;
  onChange: (changedFilters: Record<FilterTypes, boolean>) => void;
}> = ({ appliedFilters, onChange }) => {
  const plausible = usePlausible();

  return (
    <ul>
      {config.filters.map(({ id, label }, index) => (
        <Box
          as="li"
          key={id}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={index ? 3 : undefined}
        >
          <Box display="flex" alignItems="center">
            <Icon icon={iconMap[id]} fixedWidth size="lg" />
            <Box ml={3} id={`filter-${id}`}>
              {label}
            </Box>
          </Box>

          <Switch
            name={id}
            checked={appliedFilters?.[id] || false}
            aria-labelledby={`filter-${id}`}
            onClick={() => {
              plausible('Toggle Filter', { props: { filter: label } });
              onChange({
                ...appliedFilters,
                [id]: !appliedFilters?.[id],
              });
            }}
          />
        </Box>
      ))}
    </ul>
  );
};

export default Filters;
