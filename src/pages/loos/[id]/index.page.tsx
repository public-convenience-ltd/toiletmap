import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Box from '../../../components/Box';
import VisuallyHidden from '../../../design-system/utilities/VisuallyHidden';
import { useMapState } from '../../../components/MapState';
import config from '../../../config';
import { withApollo } from '../../../api-client/withApollo';
import { GetServerSideProps } from 'next';
import { ssrFindLooById } from '../../../api-client/page';
import { useRouter } from 'next/router';
import ToiletDetailsPanel from '../../../components/ToiletDetailsPanel';
import Notification from '../../../components/Notification';
import NotFound from '../../404.page';
import { css } from '@emotion/react';
import { FindLooByIdQuery } from '../../../api-client/graphql';
import { ApolloError } from '@apollo/client';
import dynamic from 'next/dynamic';

const SIDEBAR_BOTTOM_MARGIN = 32;

const Sidebar = dynamic(() => import('../../../components/Sidebar/Sidebar'));

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

      <Box
        position="absolute"
        zIndex={1}
        top={0}
        left={[0, 3]}
        right={0}
        m={3}
        maxWidth={326}
        maxHeight={`calc(100% - 0px - ${SIDEBAR_BOTTOM_MARGIN}px)`} // TODO:fix this for mobile viewports (extra vertical scroll area)
        // center on small viewports
        mx={['auto', 0]}
      >
        <Sidebar />
      </Box>

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
