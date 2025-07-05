import Head from 'next/head';
import Button from '../design-system/components/Button';
import Center from '../design-system/layout/Center';
import Stack from '../design-system/layout/Stack';
import VisuallyHidden from '../design-system/utilities/VisuallyHidden';
import config from '../config';
import { InferGetStaticPropsType } from 'next';
import { list } from '@vercel/blob';

// Revalidate once every 1 hour
export const revalidate = 3600;

export const getStaticProps = async () => {
  const hasToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  let blobs = [];

  if (hasToken) {
    blobs = (await list({ prefix: 'exports/' })).blobs;
  }

  const fileListing = blobs.map(
    ({ downloadUrl, pathname, size, uploadedAt }) => ({
      downloadUrl,
      pathname,
      size,
      type: pathname.split('.').pop(),
      lastUpdated: new Date(uploadedAt).toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }),
  );

  return {
    props: {
      hasToken,
      fileListing,
    },
    revalidate,
  };
};

const DatasetPage = ({
  hasToken,
  fileListing,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const jsonDetails = fileListing.find((f) => f.type === 'json');
  const csvDetails = fileListing.find((f) => f.type === 'csv');

  return (
    <>
      <Head>
        <title>{config.getTitle('Our Data')}</title>
      </Head>

      <Center text={false} gutter={true} article={true}>
        <Stack space="l">
          <Center text={true} gutter={false} article={false}>
            <h1>Toilet Data</h1>
          </Center>

          <section>
            <h2 id="download-a-copy">Download a copy</h2>
            <Stack direction="column" space="m">
              {hasToken && jsonDetails && csvDetails ? (
                <>
                  <Stack direction="row" space="s">
                    <Button
                      htmlElement="a"
                      variant="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={jsonDetails.downloadUrl}
                    >
                      JSON ({(jsonDetails.size / 1e6).toFixed(2)} mb)
                    </Button>
                    <Button
                      htmlElement="a"
                      variant="primary"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={csvDetails.downloadUrl}
                    >
                      CSV ({(csvDetails.size / 1e6).toFixed(2)} mb)
                    </Button>
                  </Stack>
                  <p>
                    Last updated on <strong>{jsonDetails.lastUpdated}</strong>.
                  </p>
                </>
              ) : (
                <p style={{ fontStyle: 'italic' }}>
                  ⚠️ Data downloads aren’t available in this environment. To
                  view the latest files, please set{' '}
                  <code>VERCEL_BLOB_TOKEN</code> and rebuild.
                </p>
              )}
            </Stack>
          </section>

          <section id="licence" aria-labelledby="licence-info">
            <Stack direction="column" space="m">
              <h2 id="licence-info">Licence Information</h2>

              <p>
                The <strong>Toilet Map</strong> dataset is open data released
                under the{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  rel="license noopener noreferrer"
                  target="_blank"
                >
                  Creative Commons Attribution 4.0
                  International&nbsp;(CC&nbsp;BY&nbsp;4.0)
                </a>{' '}
                licence.
              </p>

              <h3 id="licence-summary">In short</h3>
              <section className="table-wrapper">
                <table id="licence-summary">
                  <VisuallyHidden as="caption">
                    Summary of your rights and responsibilities
                  </VisuallyHidden>

                  <thead>
                    <tr>
                      <th scope="col">You may</th>
                      <th scope="col">You must</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>
                        Copy, share and redistribute the data in any medium or
                        format.
                      </td>
                      <td>
                        Give clear credit: “Contains data from the Toilet Map ©
                        2025 –
                        <abbr title="Creative Commons Attribution 4.0 International">
                          CC BY 4.0
                        </abbr>
                        ” — preferably linking to this page or the licence.
                      </td>
                    </tr>

                    <tr>
                      <td>
                        Adapt it, mash it up, sell it, or even print it on a
                        T-shirt.
                      </td>
                      <td>State if you’ve changed the data.</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </Stack>
          </section>
        </Stack>
      </Center>
    </>
  );
};

export default DatasetPage;
