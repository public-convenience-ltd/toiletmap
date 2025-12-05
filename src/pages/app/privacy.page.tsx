import Head from 'next/head';
import Link from 'next/link';

import config from '../../config';

import Center from '../../design-system/layout/Center';
import Stack from '../../design-system/layout/Stack';

const AppPrivacyPage = () => {
  return (
    <>
      <Head>
        <title>{config.getTitle('App Privacy Policy')}</title>
      </Head>

      <Center text={false} gutter={true} article={true}>
        <Stack space="l">
          <Center text={true} gutter={false} article={false}>
            <Stack space="2xs">
              <h1>Privacy Policy - Toilet Map</h1>
              <p>Last updated: 5 December 2025</p>
            </Stack>
          </Center>

          <section>
            <Stack space="s">
              <p>
                Toilet Map (the "App", "we", "us", or "our") is committed to
                protecting your privacy. This App Privacy Policy explains how we
                collect, use, and protect personal information when you use our
                Android application.
              </p>
              <p>
                By using Toilet Map, you agree to the collection and use of
                information in accordance with this policy.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>1. Information We Collect</h2>
              <div>
                <Stack space="xs">
                  <h3>1.1 Location Information</h3>
                  <p>
                    The App requests access to your device's location (GPS and
                    network-based) to show nearby toilet facilities.
                  </p>
                  <p>
                    Your location is{' '}
                    <strong>
                      used only to make a request to our API server
                    </strong>{' '}
                    to fetch relevant nearby toilet data. We{' '}
                    <strong>do not store or log</strong> your precise location
                    on our servers, and the data is <strong>not shared</strong>{' '}
                    with any third party except the service providers described
                    below.
                  </p>
                </Stack>
              </div>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>2. How We Use Your Information</h2>
              <p>
                We use the information we collect for the following purposes:
              </p>
              <ul>
                <li>To provide location-based toilet information</li>
                <li>To improve and maintain app functionality</li>
                <li>To ensure server performance and security</li>
                <li>To diagnose technical issues</li>
              </ul>
              <p>
                We do <strong>not</strong> sell or rent your personal data.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>3. How We Share Your Information</h2>
              <p>
                We share device location with trusted third parties only as
                necessary to support app functionality:
              </p>
              <ul>
                <li>
                  <strong>Our API hosting providers</strong> at{' '}
                  <Link
                    href="https://www.toiletmap.org.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.toiletmap.org.uk
                  </Link>{' '}
                  to deliver nearby toilet data
                </li>
                <li>
                  <Link
                    href="https://www.openstreetmap.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://www.openstreetmap.org
                  </Link>{' '}
                  to display the location of those toilets on a map
                </li>
              </ul>
              <p>
                Your precise location is <strong>never shared</strong> with
                advertisers or unrelated third parties.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>4. Permissions Used</h2>
              <p>The App requests the following Android permissions:</p>
              <p>
                <strong>
                  Location (ACCESS_FINE_LOCATION / ACCESS_COARSE_LOCATION):
                </strong>
                &nbsp;Required to determine your position and retrieve nearby
                toilet information.
              </p>
              <p>No other personal data permissions are requested.</p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>5. Data Retention</h2>
              <p>
                We <strong>do not store</strong> any personal information
                generated by the use of the App.
              </p>
              <p>
                We <strong>do not store</strong> your precise location on our
                servers.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>6. Children's Privacy</h2>
              <p>
                Toilet Map is not directed at children under 13. We do not
                knowingly collect personal data from children.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>7. Security</h2>
              <p>
                We take reasonable measures to protect your data, including
                secure communication with our API and controlled access to
                backend systems. However, no method of data transmission or
                storage is 100% secure.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>8. Your Choices</h2>
              <p>
                You may disable location access at any time through your device
                settings. (Note: the App will not function properly without
                location access.)
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>9. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. The latest
                version will always be available within the App or on our
                website. Continued use after updates constitutes acceptance of
                the new policy.
              </p>
            </Stack>
          </section>

          <section>
            <Stack space="s">
              <h2>10. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or your
                data, please contact us.
              </p>
              <p>
                <strong>Email:</strong>{' '}
                <Link href="mailto:gbtoiletmap@gmail.com">
                  gbtoiletmap@gmail.com
                </Link>
              </p>
              <p>
                <strong>Organization/Developer Name:</strong> Public Convenience
                Ltd
              </p>
            </Stack>
          </section>
        </Stack>
      </Center>
    </>
  );
};

export default AppPrivacyPage;
