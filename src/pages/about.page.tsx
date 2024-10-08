import React from 'react';

import { MDXContent } from '@content-collections/mdx/react';
import styled from '@emotion/styled';
import { allPages, Page } from 'content-collections';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Container from '../components/Container';
import Spacer from '../components/Spacer';
import Text, { TextProps } from '..//components/Text';
import config from '../config';
import Button from '../design-system/components/Button';
import Box, { BoxProps } from '../components/Box';

export const getStaticProps = (async () => {
  try {
    const pageData = allPages.find(
      (post) => post._meta.fileName === 'about.mdx',
    );

    return {
      props: {
        pageData,
      },
    };
  } catch {
    //
  }
}) satisfies GetStaticProps<{
  pageData?: Page;
}>;

const List = styled.ul`
  list-style: initial;
`;

const ListItem = (props: BoxProps) => (
  <Box as="li" marginTop={2} marginLeft={4} {...props} />
);

const SubHeading = (props: TextProps) => (
  <>
    <Spacer mb={4} />
    <Text {...props} fontSize={3} fontWeight="bold">
      <h2>{props.children}</h2>
    </Text>
    <Spacer mb={3} />
  </>
);

const AboutPage = ({
  pageData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('About')}</title>
      </Head>

      <MDXContent
        code={pageData.mdx}
        components={{
          Box: Box,
          Container: Container,
          Text: Text,
          Spacer: Spacer,
          Button: Button,
          Link: Link,
          List: List,
          SubHeading: SubHeading,
          ListItem: ListItem,
        }}
      />
    </Box>
  );
};

export default AboutPage;
