import { Meta, StoryObj } from '@storybook/react';
import Link from 'next/link';

import Center from './Center';

const meta: Meta<typeof Center> = {
  title: 'Design-System/Layout/Center',
  component: Center,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Center> = {
  render: () => {
    return (
      <Center text={false} gutter={true}>
        <h1>Center layout</h1>
        <p>
          The Center layout is a layout inspired by the Center component from{' '}
          <Link href="https://every-layout.dev/layouts/center/">
            Every Layout
          </Link>
          . It provides a way to center content horizontally within the
          available space, while offering conditional controls for text
          alignment and gutter padding. It’s used to constrain content width and
          add spacing within the main layout.
        </p>
      </Center>
    );
  },
};

export const WithCenteredText: StoryObj<typeof Center> = {
  render: () => {
    return (
      <Center text={true} gutter={true}>
        <h1>Center layout</h1>
        <p>
          The Center layout is a layout inspired by the Center component from{' '}
          <Link href="https://every-layout.dev/layouts/center/">
            Every Layout
          </Link>
          . It provides a way to center content horizontally within the
          available space, while offering conditional controls for text
          alignment and gutter padding. It’s used to constrain content width and
          add spacing within the main layout.
        </p>
      </Center>
    );
  },
};

export const WithoutGutter: StoryObj<typeof Center> = {
  render: () => {
    return (
      <Center text={false} gutter={false}>
        <h1>Center layout</h1>
        <p>
          The Center layout is a layout inspired by the Center component from{' '}
          <Link href="https://every-layout.dev/layouts/center/">
            Every Layout
          </Link>
          . It provides a way to center content horizontally within the
          available space, while offering conditional controls for text
          alignment and gutter padding. It’s used to constrain content width and
          add spacing within the main layout.
        </p>
      </Center>
    );
  },
};
