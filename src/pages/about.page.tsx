import React from 'react';
import Head from 'next/head';
import Box, { BoxProps } from '../components/Box';
import { allPages, Page } from 'contentlayer/generated';
import { useMDXComponent } from 'next-contentlayer/hooks';
import { GetStaticProps, InferGetStaticPropsType } from 'next';

import Container from 'src/components/Container';
import Text, { TextProps } from 'src/components/Text';
import Spacer from 'src/components/Spacer';
import Button from 'src/design-system/components/Button';
import Link from 'next/link';
import config from 'src/config';
import styled from '@emotion/styled';

export const getStaticProps = (async () => {
  try {
    const pageData = allPages.find(
      (post) => post._raw.flattenedPath.split('pages/')[1] === 'about',
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
  const MDXContent = useMDXComponent(pageData.body.code, {
    process: { env: {} },
    document: {
      querySelectorAll: () => [],
    },
  });
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('About')}</title>
      </Head>
      <MDXContent
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
