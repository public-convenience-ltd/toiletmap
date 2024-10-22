import Head from 'next/head';
import Link from 'next/link';

import Container from '../components/Container';
import Text from '../components/Text';
import Spacer from '../components/Spacer';
import Box from '../components/Box';

import config from '../config';

const PrivacyPage = () => {
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('Privacy Policy')}</title>

        {/* Added meta description for SEO improvement as part of issue #1736 */}

        <meta
          name="description" 
          content="Learn about how we protect your privacy while using The Great British Public Toilet Map. Find details on our data practices, cookies, and GDPR compliance."
        />
      </Head>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>Privacy Policy</h1>
        </Text>
        <Spacer mb={5} />

        <Text fontSize={3} fontWeight="bold">
          <h2>Visitors to the site</h2>
        </Text>
        <Spacer mb={3} />

        <p>
          The Great British Public Toilet Map uses a cookieless approach to
          gather anonymous data such as which pages are viewed, what time the
          visit occurred, and which site referred the visitor to the web page
          etc.
        </p>
        <p>
          Public Convenience Ltd also notes and saves information such as time
          of day, browser type and content requested. That information is used
          to provide more relevant services to users.
        </p>
        <p>
          We will not associate any data gathered from this site through
          navigation and with any personally identifying information from any
          source. We may also log Internet Protocol (IP) address (but nothing
          that directly identifies visitors) in order to receive and send the
          required information over the internet.
        </p>

        <Spacer mb={4} />
        <Text fontSize={3} fontWeight="bold">
          <h2>Contributors to the site</h2>
        </Text>
        <Spacer mb={3} />
        <p>
          Contributors to The Great British Public Toilet Map website are asked
          to sign-in via the Auth0 platform using their email address. This
          helps us to share data on the quantity and spread of contributions to
          the site which helps show how the community value the project, to
          improve our interfaces for our users, to protect our dataset from
          misuse and to recognise contributions from a user if that user is
          adding unsuitable content, whether intentionally or inadvertently.
        </p>
        <p>
          A full list of a contributor’s activities will only be accessible to
          Public Convenience Ltd for moderating the dataset.
        </p>
        <p>
          The content of feedback submitted via the site feedback mechanism will
          be reviewed by a human and may be used to improve the service. It may pass
          through third party services in legislative regions with different privacy
          protections before it reaches us.
        </p>
        <p>
          Should you choose to provide an email address with your feedback it will
          be stored against your comments and Public Convenience Ltd. may choose
          to contact you to follow up on the feedback you gave. There is no
          obligation to respond to or engage in a dialogue stemming from such
          contact.
        </p>
        <p>
          A contributor’s full email address will never be disclosed or shared
          and is only visible to Public Convenience Ltd.
        </p>

        <Spacer mb={4} />

        <p>
          If you&apos;d like to know what we&apos;ve stored about you, or ask us
          to forget you, or to let us know about something you&apos;d like
          changed please drop us a line at{' '}
          <Link
            href="mailto:gbtoiletmap@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            gbtoiletmap@gmail.com
          </Link>
          . If you&apos;d like to exercise any of your rights under the GDPR
          that&apos;s the address to use.
        </p>
      </Container>
    </Box>
  );
};

export default PrivacyPage;
