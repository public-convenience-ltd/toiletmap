import Link from 'next/link';
import Head from 'next/head';

import Button from '../design-system/components/Button';
import Center from '../design-system/layout/Center';
import Stack from '../design-system/layout/Stack';

import config from '../config';

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>{config.getTitle('About')}</title>
      </Head>

      <Center text={false} gutter={true} article={true}>
        <Stack space="l">
          <Center text={true} gutter={false} article={false}>
            <h1>About the Toilet Map</h1>
          </Center>
          <section>
            <p>
              Everyone will, at some point in the day, need to use the toilet.
              Some people will need facilities more than others, and some will
              need to find toilets sooner rather than later.
            </p>
            <p>
              The Toilet Map aims to be a complete, up-to-date, sustainable
              source of toilet locations. It&apos;s the UK&apos;s largest
              database of publicly-accessible toilets (see below), with over
              14,000 facilities.
            </p>
            <p>
              The Toilet Map is run by Public Convenience, a joint venture
              between researchers Dr Jo-Anne Bichard and Gail Ramster (who
              created the map at the RCA Helen Hamlyn Centre for Design) and
              software development company{' '}
              <Link
                href="https://www.neontribe.co.uk/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Neontribe
              </Link>{' '}
              (who designed and built it).
            </p>
            <p>
              The information comes from the public - anyone can go on the
              website and <Link href="/">add, edit or remove toilets</Link>. We
              also use open data and request information from councils,{' '}
              <Link
                href="https://www.openstreetmap.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenStreetMap
              </Link>
              , private companies and organisations.
            </p>
          </section>
          <section>
            <h2 id="contributing">Contributing</h2>
            <p>
              We cover each feature of the map and how you can go about using
              them to add or edit toilets yourself in our Volunteer Help Guide,
              available to download below.
            </p>
            <p>
              <Button
                htmlElement="a"
                variant="primary"
                target="_blank"
                rel="noopener noreferrer"
                href="Toilet.Map.Volunteer.Help.Guide.pdf"
              >
                Download volunteer help guide
              </Button>
            </p>

            <p>
              A handy printable checklist designed to make it easier for you to
              collect data away from the computer for submitting to the map
              later is also available for download.
            </p>

            <p>
              <Button
                htmlElement="a"
                variant="primary"
                href={'/GBPTM.Toilet.Checklist.pdf'}
                target="_blank"
                rel="noopener noreferrer"
              >
                Download toilet checklist
              </Button>
            </p>
          </section>
          <section>
            <h2 id="publicly-accessible-toilets">
              Publicly Accessible Toilets
            </h2>
            <p>
              The project aims to map all publicly-accessible toilets - that
              means all toilets that the public can access without needing to be
              a customer.
            </p>
            <p>This includes: </p>
            <ul>
              <li>public toilets</li>
              <li>
                toilets in train stations, bus stations, service/petrol
                stations, tube stations, ferry terminals, airports and other
                transport networks
              </li>
              <li>shopping centre toilets</li>
              <li>
                toilets in public buildings, such as town halls, libraries,
                hospitals, museums and leisure centres
              </li>
              <li>
                toilets in other businesses where the business agrees that the
                public can use their toilets without having to buy anything.
                These are often part of Community Toilet Schemes (run by
                councils) and can include shops, cafes, supermarkets,
                restaurants, hotels and pubs.
              </li>
              <li>
                We try not to show toilets where you need to ask permission to
                use it, such as those that are for customers-only. The exception
                is platform-side toilets at stations. These are only accessible
                to ticket-holders but we feel it is still useful information,
                particularly when many trains don’t have toilets onboard.
              </li>
            </ul>
            <p>
              If you have any problems updating the toilets, or wish to send us
              toilet details or comments, please contact{' '}
              <Link href="mailto:gbtoiletmap@gmail.com">
                gbtoiletmap@gmail.com
              </Link>
              .
            </p>
          </section>
          <section>
            <h2 id="the-explorer">The Explorer</h2>
            <p>
              <Link href="/explorer" prefetch={false}>
                Visit the Explorer
              </Link>
              &nbsp;to get an overview of the statistics and details related to
              the Toilet Map. These statistics are calculated on-demand, so will
              be up to date, and can help to provide a overview of public toilet
              coverage across the country.
            </p>
          </section>
        </Stack>
      </Center>
    </>
  );
};

export default AboutPage;
