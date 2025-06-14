import { Meta } from '@storybook/react';
import Header from '.';

const meta: Meta<typeof Header> = {
  title: 'Design-System/Components/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;

export const Default = (props) => (
  <Header {...props}>
    <p>Header menu content</p>
  </Header>
);
