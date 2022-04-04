import { Meta } from '@storybook/react';
import Logo from '.';

export default {
  name: 'Logo',
  component: Logo,
} as Meta;

export const Default = (props) => <Logo {...props}></Logo>;
