import { Meta } from '@storybook/react';
import Header from '.';

export default {
  name: 'Header',
  component: Header,
} as Meta;

export const Default = (props) => (
  <Header {...props}>
    <p>Header menu content</p>
  </Header>
);
