import React from 'react';
import { usePlausible } from 'next-plausible';

import Box from './Box';
import Switch from '../design-system/components/Switch';
import Icon from '../design-system/components/Icon';
import { IconProps } from '../design-system/components/Icon/Icon.types';
import config from '../config';
import type { Filters as FilterTypes } from '../config';

const iconMap: Record<FilterTypes, IconProps> = {
  noPayment: { icon: 'sterling-sign' },
  babyChange: { icon: 'baby' },
  accessible: { icon: 'wheelchair-move' },
  allGender: { icon: 'toilet' },
  radar: { icon: 'key' },
  automatic: { icon: 'gear' },
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
            <Icon {...iconMap[id]} size="medium" />
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
