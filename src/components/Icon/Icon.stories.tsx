import { faCalendarTimes } from '@fortawesome/free-solid-svg-icons';
import { Meta } from '@storybook/react';
import Icon from '.';

export default {
  name: 'Icon',
  component: Icon,
  args: {
    icon: faCalendarTimes,
  },
} as Meta;

export const Default = (props) => <Icon {...props}></Icon>;
