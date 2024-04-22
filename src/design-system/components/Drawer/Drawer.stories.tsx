import { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { default as DrawerComponent } from './Drawer';
import Icon from '../../components/Icon';
import Switch from '../../components/Switch';

export default {
  title: 'Design-System/Drawer',
  component: DrawerComponent,
  tags: ['autodocs'],
} as Meta;

const Default = (props) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <label htmlFor="toggler">Toggle Drawer</label>
        <Switch
          name="toggler"
          checked={isDrawerOpen}
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        />
      </div>
      <DrawerComponent visible={isDrawerOpen} animateFrom={'left'} {...props}>
        <div style={{ width: '10rem', border: '1px solid black' }}>
          <ul style={{ listStyle: 'none', padding: '0.5rem' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <li
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                key={i}
              >
                <Icon icon="note-sticky" size="medium" />
                <div id={`option-${i}`}>Option {i}</div>
                <Switch name={`option-${i}`} checked={true} />
              </li>
            ))}
          </ul>
        </div>
      </DrawerComponent>
    </>
  );
};

export const Primary: StoryObj<typeof DrawerComponent> = {
  render: () => <Default />,
};
