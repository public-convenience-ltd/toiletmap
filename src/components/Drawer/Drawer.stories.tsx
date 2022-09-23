import { faStickyNote } from '@fortawesome/free-solid-svg-icons';
import { Meta } from '@storybook/react';
import times from 'lodash/times';
import React, { useState } from 'react';

import { default as DrawerComponent } from '.';
import Box from '../Box';
import Icon from '../Icon';
import Switch from '../Switch';

export default {
  name: 'Drawer',
  component: DrawerComponent,
} as Meta;

export const Default = (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  return (
    <>
      <Box display="flex" alignItems="center">
        <label htmlFor="toggler">Toggle Drawer</label>
        <Box ml={'3'}>
          <Switch
            name="toggler"
            checked={isDrawerOpen}
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          />
        </Box>
      </Box>
      <DrawerComponent visible={isDrawerOpen} animateFrom={'left'} {...props}>
        <Box width={'10rem'} border="1px solid black">
          <ul>
            {times(5).map((_, i) => (
              <Box
                key={i}
                as="li"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={'3'}
              >
                <Box display="flex" alignItems="center">
                  <Icon icon={faStickyNote} fixedWidth size="lg" />
                  <Box ml={3} id={`option-${i}`}>
                    Option {i}
                  </Box>
                </Box>

                <Switch name={'option-1'} checked={true} />
              </Box>
            ))}
          </ul>
        </Box>
      </DrawerComponent>
    </>
  );
};
