import { Meta } from '@storybook/react';
import Footer from './Footer';

const meta: Meta<typeof Footer> = {
  title: 'Design-System/Components/Footer',
  component: Footer,
  tags: ['autodocs'],
};

export default meta;

export const Default = () => <Footer />;
