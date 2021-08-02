import { GetServerSideProps, GetServerSidePropsContext, GetStaticProps, GetStaticPropsContext, InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React from 'react';

import HomePage from '.';

const MapPage = ({lat, lng}): InferGetServerSidePropsType<typeof getServerSideProps> => {

  return (
    <HomePage
      initialPosition={{
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      }}
    />
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {

  return {
    props: {
      lat: context?.query['lat'],
      lng: context?.query['lng'],
    },
  }
}

export default MapPage;
