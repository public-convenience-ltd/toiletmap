import Head from 'next/head';

import Button from '../design-system/components/Button';
import Center from '../design-system/layout/Center';
import Stack from '../design-system/layout/Stack';
import VisuallyHidden from '../design-system/utilities/VisuallyHidden';

import config from '../config';
import { InferGetStaticPropsType } from 'next';
import { list } from '@vercel/blob';

export const getStaticProps = async () => {
  try {
    // Fetch backup dir listing.
    const allFiles = (await list({ prefix: 'exports/' })).blobs;

    return {
      props: {
        fileListing: allFiles.map(
          ({ downloadUrl, pathname, size, uploadedAt }) => ({
            downloadUrl,
            pathname,
            size,
            type: pathname.split('.').pop(),
            // Last updated with resolution to the minute
            lastUpdated: new Date(uploadedAt).toLocaleString('en-GB', {
              timeZone: 'Europe/London',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
          }),
        ),
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

const DatasetPage = ({
  fileListing,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const jsonDetails = fileListing.find((file) => file.type === 'json');
  const csvDetails = fileListing.find((file) => file.type === 'csv');

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
            <p>
              We are happy to provide a complete copy of the data behind the
              Toilet Map for free to whoever would like to use it in their
              project.
            </p>
          </section>
          <section>
            <h2 id="download-a-copy">Download a copy</h2>
            <Stack direction="column" space="m">
              <p>
                You can download a copy of our dataset in CSV or JSON format. We
                update the dataset every 24 hours, so you can always get the
                most up-to-date information.
              </p>
              <Stack direction="row" space="s">
                <Button
                  htmlElement="a"
                  variant="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={jsonDetails.downloadUrl}
                >
                  JSON ({(jsonDetails.size / 1000000).toFixed(2)} mb)
                </Button>

                <Button
                  htmlElement="a"
                  variant="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={csvDetails.downloadUrl}
                >
                  CSV ({(csvDetails.size / 1000000).toFixed(2)} mb)
                </Button>
              </Stack>
              <p>
                We last updated our dataset on{' '}
                <strong>{jsonDetails.lastUpdated}</strong>.
              </p>
            </Stack>
          </section>
          <section id="licence" aria-labelledby="licence-title">
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
