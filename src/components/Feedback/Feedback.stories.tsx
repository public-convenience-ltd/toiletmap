import { Meta } from '@storybook/react';
import { ThemeProvider, createTheme } from '@mui/material';
import Feedback from './Feedback';
import theme from '../../theme';

export default {
  name: 'Feedback',
  component: Feedback,
  decorators: [
    (Story) => {
      return (
        <ThemeProvider
          // @ts-expect-error -- Expected
          theme={createTheme(theme)}
        >
          <Story />
        </ThemeProvider>
      );
    },
  ],
} as Meta;

export const Default = () => <Feedback />;
