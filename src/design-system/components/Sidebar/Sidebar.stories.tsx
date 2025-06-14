import { Meta } from '@storybook/react';
import Sidebar from './Sidebar';

const meta: Meta<typeof Sidebar> = {
  title: 'Design-System/Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
};

export default meta;

export const Default = () => <Sidebar />;
