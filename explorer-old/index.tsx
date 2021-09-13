import React from 'react';
import Link from 'next/link';
import Router from 'next/router';
import Layout from './Layout';
import Home from './Home';
import HeadlineStats from './HeadlineStats';
import Areas from './Areas';
import Search from './Search';
import Loo from './Loo';
import Voyager from './Voyager';
import Map from './Map';

export default function Explorer() {


  return (
    <Layout>
      <Link exact href={`${Router.pathname}/`}>
        <Home />
      </Link>
      <Link href={`${Router.pathname}/loos/:id`}>
        <Loo />
      </Link>
      <Link href={`${Router.pathname}/statistics`}>
        <HeadlineStats />
      </Link>
      <Link href={`${Router.pathname}/areas`}>
        <Areas />
      </Link>
      <Link href={`${Router.pathname}/search`}>
        <Search />
      </Link>
      <Link href={`${Router.pathname}/voyager`}>
        <Voyager />
      </Link>
      <Link exact href={`${Router.pathname}/map`}>
        <Map />
      </Link>

    </Layout>
  );
}
