import dynamic from 'next/dynamic';
import Head from 'next/head';
import PageLayout from '../../components/PageLayout';
import Container from '../../components/Container';
import config from '../../config';
import 'graphql-voyager/dist/voyager.css';

const VoyagerComponent = dynamic(
  () => import('graphql-voyager').then((mod) => mod.Voyager),
  { ssr: false }
);

function introspectionProvider(query) {
  return fetch('/api', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: query }),
  }).then((response) => response.json());
}

const Voyager = () => (
  <PageLayout layoutMode="blog">
    <Head>
      <title>{config.getTitle('Schema Visualisation')}</title>
    </Head>

    <Container>
      <VoyagerComponent
        introspection={introspectionProvider}
        workerURI={'/voyager.worker.js'}
      />
    </Container>
  </PageLayout>
);

export default Voyager;
