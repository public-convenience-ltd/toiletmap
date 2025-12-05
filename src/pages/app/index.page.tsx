import Head from 'next/head';

import config from '../../config';

import Center from '../../design-system/layout/Center';
import Stack from '../../design-system/layout/Stack';

const AppIndexPage = () => {
  return (
    <>
      <Head>
        <title>{config.getTitle('Our App')}</title>
      </Head>

      <Center text={false} gutter={true} article={true}>
        <Stack space="l">
          <Center text={true} gutter={false} article={false}>
            <h1>Toilet Map App</h1>
          </Center>
          <section>
            <p>
              We are introducing an app for iOS and Android soon. Keep an eye
              out here for more news in the coming days!
            </p>
          </section>
        </Stack>
      </Center>
    </>
  );
};

export default AppIndexPage;
