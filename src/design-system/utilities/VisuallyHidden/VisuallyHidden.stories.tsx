import { Meta, StoryObj } from '@storybook/react';

import VisuallyHidden from './VisuallyHidden';
import Button from '../../components/Button';
import Icon from '../../components/Icon';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'Design-System/Utilities/VisuallyHidden',
  component: VisuallyHidden,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Used to hide content visually but keep it accessible to screen readers. Often used in combination with other components like Buttons.',
      },
    },
  },
};

export default meta;

export const ExampleWithIconButton: StoryObj<typeof VisuallyHidden> = {
  render: () => {
    return (
      <Button variant="secondary" htmlElement="button">
        <Icon icon="xmark" size="small" />
        <VisuallyHidden as="span">Visually Hidden Text</VisuallyHidden>
      </Button>
    );
  },
};
