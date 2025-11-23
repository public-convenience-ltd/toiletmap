import { ApolloError } from '@apollo/client';
import { css } from '@emotion/react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { withApollo } from '../../../api-client/withApollo';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';

import { FindLooByIdQuery } from '../../../api-client/graphql';
import { ssrFindLooById } from '../../../api-client/page';
import { useMapState } from '../../../components/MapState';
import Box from '../../../components/Box';
import config from '../../../config';
import MapOverlay from '../../../design-system/components/MapOverlay';
import NotFound from '../../404.page';
import Notification from '../../../components/Notification';
import ToiletDetailsPanel from '../../../design-system/components/ToiletDetailsPanel/ToiletDetailsPanel';
import VisuallyHidden from '../../../design-system/utilities/VisuallyHidden';

const Sidebar = dynamic(
  () => import('../../../design-system/components/Sidebar/Sidebar'),
);

type CustomLooByIdComp = React.FC<{
  data?: FindLooByIdQuery;
  error?: ApolloError;
  notFound?: boolean;
}>;

const LooPage: CustomLooByIdComp = (props) => {
  const [mapState, setMapState] = useMapState();

  const router = useRouter();
  const { message } = router.query;

  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    setFirstLoad(false);
  }, []);

  const looCentre = props?.data?.loo;
  useEffect(
    function setInitialMapCentre() {
      if (
        looCentre &&
        firstLoad &&
        mapState?.locationServices?.isActive !== true
      ) {
        setMapState({ center: looCentre?.location, focus: looCentre });
      }
    },
    [
      firstLoad,
      looCentre,
      mapState?.locationServices?.isActive,
      message,
      router.isReady,
      setMapState,
    ],
  );

  const pageTitle = config.getTitle('Home');

  if (props?.notFound) {
    return (
      <>
        <Head>
          <title>{pageTitle}</title>
        </Head>

        <Box display="flex" height="40vh">
          <Box
            my={4}
            mx="auto"
            css={css`
              max-width: 360px; /* fallback */
              max-width: fit-content;
            `}
          >
            <NotFound>
              <Box
                my={4}
                mx="auto"
                css={css`
                  max-width: 360px; /* fallback */
                  max-width: fit-content;
                `}
              >
                <Notification allowClose>
                  Error fetching toilet data
                </Notification>
              </Box>
            </NotFound>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <VisuallyHidden as="div">
        <h1>{pageTitle}</h1>
      </VisuallyHidden>

      <MapOverlay>
        <Sidebar />
      </MapOverlay>

      {props?.data?.loo && (
        <Box position="absolute" left={0} bottom={0} width="100%" zIndex={100}>
          <ToiletDetailsPanel data={props?.data?.loo} startExpanded={true}>
            {config.alertMessages[message as string] && (
              <Box
                position="absolute"
                left={0}
                right={0}
                bottom={0}
                display="flex"
                justifyContent="center"
                p={4}
                pt={1}
                pb={[4, 3, 4]}
                bg={['white', 'white', 'transparent']}
              >
                <Notification allowClose>
                  {config.alertMessages[message as string]}
                </Notification>
              </Box>
            )}
          </ToiletDetailsPanel>
        </Box>
      )}
    </>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  try {
    const res = await ssrFindLooById.getServerPage(
      {
        variables: { id: params.id as string },
        fetchPolicy: 'no-cache',
      },
      { req },
    );

    if (res.props.error && !res.props.data) {
      return {
        props: {
          notFound: true,
        },
      };
    }
    return {
      props: {
        data: res.props.data,
      },
    };
  } catch {
    return {
      props: {
        notFound: true,
      },
    };
  }
};

export const getStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export default withApollo(LooPage);
