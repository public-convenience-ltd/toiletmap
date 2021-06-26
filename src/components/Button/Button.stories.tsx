import { Meta } from '@storybook/react';
import { default as ButtonComponent } from '.';

export default {
  name: 'Button',
  component: ButtonComponent,
} as Meta;

export const Default = (props) => (
  <ButtonComponent variant="primary" {...props}>
    Click me!
  </ButtonComponent>
);

export const Secondary = (props) => (
  <ButtonComponent variant="secondary" {...props}>
    Click me!
  </ButtonComponent>
);

export const Tertiary = (props) => (
  <ButtonComponent variant="tertiary" {...props}>
    Click me!
  </ButtonComponent>
);
