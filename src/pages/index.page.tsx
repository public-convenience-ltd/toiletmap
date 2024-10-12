import React from 'react';
import Head from 'next/head';
import Box from '../components/Box';
import Sidebar from '../components/Sidebar/Sidebar';
import VisuallyHidden from '../components/VisuallyHidden';
import { useMapState } from '../components/MapState';
import { withApollo } from '../api-client/withApollo';
import { useEffect } from 'react';

import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { allPages, Page } from 'content-collections';

export const getStaticProps = (async () => {
  try {
    const pageData =
      allPages.find((post) => post._meta.fileName === 'home.mdx') ?? null;

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

const SIDEBAR_BOTTOM_MARGIN = 32;

const HomePage = ({
  pageData,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [, setMapState] = useMapState();

  useEffect(() => {
    setMapState({ focus: undefined, searchLocation: undefined });
  }, [setMapState]);

  return (
    <>
      <Head>
        <title>{pageData.title}</title>
      </Head>

      <VisuallyHidden>
        <h1>{pageData.title}</h1>
      </VisuallyHidden>

      <Box
        position="absolute"
        zIndex={1}
        top={0}
        left={[0, 3]}
        right={0}
        m={3}
        maxWidth={326}
        maxHeight={`calc(100% - 0px - ${SIDEBAR_BOTTOM_MARGIN}px)`}
        // center on small viewports
        mx={['auto', 0]}
      >
        <Sidebar />
      </Box>
    </>
  );
};

export default withApollo(HomePage);
