import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import styled from '@emotion/styled';
import Container from '../components/Container';
import Button from '../components/Button';
import Text, { TextProps } from '../components/Text';
import Spacer from '../components/Spacer';
import Box, { BoxProps } from '../components/Box';

import config from '../config';

const List = styled.ul`
  list-style: initial;
`;

const ListItem = (props: BoxProps) => (
  <Box as="li" marginTop={2} marginLeft={4} {...props} />
);

const SubHeading = (props: TextProps) => (
  <>
    <Spacer mb={4} />
    <Text {...props} fontSize={3} fontWeight="bold">
      <h2>{props.children}</h2>
    </Text>
    <Spacer mb={3} />
  </>
);

const AboutPage = () => {
  return (
    <Box my={5}>
      <Head>
        <title>{config.getTitle('About')}</title>
      </Head>

      <Container maxWidth={845}>
        <Text fontSize={6} fontWeight="bold" textAlign="center">
          <h1>About the Toilet Map</h1>
        </Text>
        <Spacer mb={5} />
        <p>
          Everyone will, at some point in the day, need to use the toilet. Some
          people will need facilities more than others, and some will need to
          find toilets sooner rather than later.
        </p>
        <p>
          The Great British Public Toilet Map aims to be a complete, up-to-date,
          sustainable source of toilet locations. It&apos;s the UK&apos;s
          largest database of publicly-accessible toilets (see below), with over
          14,000 facilities.
        </p>
        <p>
          The Great British Public Toilet Map is run by Public Convenience, a
          joint venture between researchers Dr Jo-Anne Bichard and Gail Ramster
          (who created the map at the RCA Helen Hamlyn Centre for Design) and
          software development company{' '}
          <Link passHref href="https://www.neontribe.co.uk/" legacyBehavior>
            <Button
              variant="link"
              as="a"
              target="_blank"
              rel="noopener noreferrer"
            >
              Neontribe
            </Button>
          </Link>{' '}
          (who designed and built it).
        </p>
        <p>
          The information comes from the public - anyone can go on the website
          and{' '}
          <Link href="/" passHref legacyBehavior>
            <Button variant="link">add, edit or remove toilets</Button>
          </Link>
          . We also use open data and request information from councils,{' '}
          <Link passHref href="https://www.openstreetmap.org/" legacyBehavior>
            <Button
              variant="link"
              as="a"
              target="_blank"
              rel="noopener noreferrer"
            >
              OpenStreetMap
            </Button>
          </Link>
          , private companies and organisations.
        </p>
        <SubHeading id="contributing">Contributing</SubHeading>
        <p>
          We cover each feature of the map and how you can go about using them
          to add or edit toilets yourself in our Volunteer Help Guide, available
          to download below.
        </p>
        <Spacer mb={2} />
        <Link
          passHref
          href="Toilet.Map.Volunteer.Help.Guide.pdf"
          legacyBehavior
        >
          <Button
            as="a"
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download volunteer help guide
          </Button>
        </Link>
        <Spacer mb={3} />
        <p>
          A handy printable checklist designed to make it easier for you to
          collect data away from the computer for submitting to the map later is
          also available for download.
        </p>
        <Spacer mb={2} />
        <Link passHref href={'/GBPTM.Toilet.Checklist.pdf'} legacyBehavior>
          <Button
            as="a"
            variant="primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download toilet checklist
          </Button>
        </Link>
        <SubHeading>Publicly Accessible Toilets</SubHeading>
        <p>
          The project aims to map all publicly-accessible toilets - that means
          all toilets that the public can access without needing to be a
          customer.
        </p>
        <Spacer mb={3} />
        This includes:
        <List>
          <ListItem>public toilets</ListItem>
          <ListItem>
            toilets in train stations, bus stations, service/petrol stations,
            tube stations, ferry terminals, airports and other transport
            networks
          </ListItem>
          <ListItem>shopping centre toilets</ListItem>
          <ListItem>
            toilets in public buildings, such as town halls, libraries,
            hospitals, museums and leisure centres
          </ListItem>
          <ListItem>
            toilets in other businesses where the business agrees that the
            public can use their toilets without having to buy anything. These
            are often part of Community Toilet Schemes (run by councils) and can
            include shops, cafes, supermarkets, restaurants, hotels and pubs.
          </ListItem>
          <ListItem>
            We try not to show toilets where you need to ask permission to use
            it, such as those that are for customers-only. The exception is
            platform-side toilets at stations. These are only accessible to
            ticket-holders but we feel it is still useful information,
            particularly when many trains don’t have toilets onboard.
          </ListItem>
        </List>
        <Spacer mb={3} />
        <p>
          If you have any problems updating the toilets, or wish to send us
          toilet details or comments, please contact{' '}
          <Link passHref href="mailto:gbtoiletmap@gmail.com" legacyBehavior>
            <Button variant="link" as="a">
              gbtoiletmap@gmail.com
            </Button>
          </Link>
          .
        </p>
        <SubHeading>The Explorer</SubHeading>
        <p>
          <Link passHref href="/explorer" prefetch={false} legacyBehavior>
            <Button variant="link" as="a">
              Visit the Explorer
            </Button>
          </Link>
          &nbsp;to get an overview of the statistics and details related to the
          Toilet Map. These statistics are calculated on-demand, so will be up
          to date, and can help to provide a overview of public toilet coverage
          across the country.
        </p>
      </Container>
    </Box>
  );
};

export default AboutPage;
