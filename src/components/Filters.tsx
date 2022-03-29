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
import config, { Filters } from '../config';

const iconMap = {
  noPayment: faPoundSign,
  babyChange: faBaby,
  accessible: faAccessibleIcon,
  allGender: faToilet,
  radar: faKey,
  automatic: faCog,
};

const Filters: React.FC<{
  appliedFilters: Record<Filters, boolean>;
  onChange: (changedFilters: Record<Filters, boolean>) => void;
}> = ({ appliedFilters, onChange }) => {
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
