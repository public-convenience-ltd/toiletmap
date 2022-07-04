import React, { useCallback, useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { css } from '@emotion/react';
import { faClock, faEdit } from '@fortawesome/free-regular-svg-icons';
import {
  faDirections,
  faList,
  faTimes,
  faCheck,
  faPoundSign,
  faBaby,
  faToilet,
  faMale,
  faFemale,
  faChild,
  faKey,
  faCog,
  faQuestion,
  faChevronDown,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons';
import lightFormat from 'date-fns/lightFormat';
import getISODay from 'date-fns/getISODay';
import parseISO from 'date-fns/parseISO';
import add from 'date-fns/add';
import Link from 'next/link';

import Box from './Box';
import Button from './Button';
import Text from './Text';
import Spacer from './Spacer';
import Icon from './Icon';
import { Media } from './Media';
// Suppress Opening Hours Heading during COVID-19
import { WEEKDAYS, isClosed } from '../lib/openingTimes';
import { useMapState } from './MapState';
import type L from 'leaflet';
import { useRouter } from 'next/router';
import { useSubmitVerificationReportMutationMutation } from '../api-client/graphql';
import { usePlausible } from 'next-plausible';

const Grid = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  margin: -${({ theme }) => theme.space[3]}px;
`;

const UnstyledList = styled.ul`
  list-style: none;
`;

function getTimeRangeLabel(range: unknown[]) {
  if (isClosed(range)) {
    return 'Closed';
  }

  if (range && range.length === 2) {
    if (range[0] === range[1]) {
      return '24 Hours';
    }

    return range.join(' - ');
  }

  return 'Unknown';
}

// Suppress Opening Hours heading during COVID-19
// function getIsOpenLabel(openingTimes = [], dateTime = new Date()) {
//   const isOpen = getIsOpen(openingTimes, dateTime);

//   if (isOpen === null) {
//     return 'Unknown';
//   }

//   return isOpen ? 'Open now' : 'Closed';
// }

function round(value: number, precision = 0) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

const DistanceTo = ({ from, to }) => {
  const fromLatLng = L.latLng(from.lat, from.lng);

  const toLatLng = L.latLng(to.lat, to.lng);
  const metersToLoo = fromLatLng.distanceTo(toLatLng);

  const distance =
    metersToLoo < 1000
      ? `${round(metersToLoo, 0)}m`
      : `${round(metersToLoo / 1000, 1)}km`;

  return (
    <Text as="span" fontSize="3" fontWeight="bold">
      {distance}
    </Text>
  );
};

const ToiletDetailsPanel = ({
  data,
  // onDimensionsChange,
  startExpanded = false,
  children,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(startExpanded);

  const router = useRouter();

  const [submitVerificationReportMutation, verificationReportState] =
    useSubmitVerificationReportMutationMutation();

  useEffect(() => {
    if (verificationReportState.error) {
      console.error(
        'There was a problem submitting the verification report.',
        verificationReportState.error
      );
    }
  }, [verificationReportState.error]);

  const [mapState, setMapState] = useMapState();

  // programmatically set focus on close button when panel expands
  const closeButtonRef = React.useRef(null);
  React.useEffect(() => {
    if (isExpanded && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isExpanded]);

  const navigateAway = useCallback(() => {
    setMapState({ searchLocation: undefined, focus: undefined });
    router.push('/');
  }, [router, setMapState]);

  const escapeKeyHandler = React.useCallback(
    (event) => {
      if (event.key === 'Escape') {
        if (isExpanded) {
          setIsExpanded(false);
        } else {
          navigateAway();
        }
      }
    },
    [isExpanded, navigateAway]
  );

  React.useEffect(() => {
    document.addEventListener('keydown', escapeKeyHandler, false);

    return () => {
      document.removeEventListener('keydown', escapeKeyHandler, false);
    };
  }, [escapeKeyHandler]);

  // TODO (Feb 2022): use a different method for this as the useComponentSize hook doesn't play well with SSR
  // call onDimensionsChange whenever the dimensions of the container change
  const containerRef = React.useRef(null);
  // const size = useComponentSize(containerRef);
  // React.useEffect(() => {
  //   onDimensionsChange(size);
  // }, [size, onDimensionsChange]);

  const titleFragment = (
    <Box display="flex" justifyContent="space-between">
      <Text fontWeight="bold" fontSize={[3, 4]} lineHeight={1.2}>
        <h2 id="toilet-details-heading">{data.name || 'Unnamed Toilet'}</h2>
      </Text>
      {mapState.geolocation && (
        <Box ml={5}>
          <DistanceTo from={mapState.geolocation} to={data.location} />
        </Box>
      )}
    </Box>
  );

  const getDirectionsFragment = (
    <Link
      passHref
      href={`https://maps.apple.com/?dirflg=w&daddr=${[
        data.location.lat,
        data.location.lng,
      ]}`}
    >
      <Button
        variant="primary"
        as="a"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Box mr="2">
          <Icon icon={faDirections} />
        </Box>
        Directions
      </Button>
    </Link>
  );

  const getFeatureValueIcon = (value) => {
    if (value === null) {
      return (
        <Box title="Unknown">
          <Icon icon={faQuestion} color="tertiary" />
        </Box>
      );
    }

    return value ? (
      <Box title="Available">
        <Icon icon={faCheck} />
      </Box>
    ) : (
      <Box title="Unavailable">
        <Icon icon={faTimes} color="tertiary" />
      </Box>
    );
  };

  const features = [
    {
      icon: <Icon icon={faFemale} />,
      label: 'Women',
      valueIcon: getFeatureValueIcon(data.women),
    },
    {
      icon: <Icon icon={faMale} />,
      label: 'Men',
      valueIcon: getFeatureValueIcon(data.men),
    },
    {
      icon: <Icon icon={faAccessibleIcon} />,
      label: 'Accessible',
      valueIcon: getFeatureValueIcon(data.accessible),
    },
    ...(data.accessible
      ? [
          {
            icon: <Icon icon={faKey} />,
            label: 'RADAR Key',
            valueIcon: getFeatureValueIcon(data.radar),
          },
        ]
      : []),
    {
      icon: <Icon icon={faToilet} />,
      label: 'Gender Neutral',
      valueIcon: getFeatureValueIcon(data.allGender),
    },
    {
      icon: <Icon icon={faChild} />,
      label: 'Children',
      valueIcon: getFeatureValueIcon(data.children),
    },
    {
      icon: <Icon icon={faBaby} />,
      label: 'Baby Changing',
      valueIcon: getFeatureValueIcon(data.babyChange),
    },
    {
      icon: <Icon icon={faToilet} />,
      label: 'Urinal Only',
      valueIcon: getFeatureValueIcon(data.urinalOnly),
    },
    {
      icon: <Icon icon={faCog} />,
      label: 'Automatic',
      valueIcon: getFeatureValueIcon(data.automatic),
    },
    {
      icon: <Icon icon={faPoundSign} />,
      label: 'Free',
      valueIcon: getFeatureValueIcon(data.noPayment),
    },
  ];

  const openingTimes = data.openingTimes || WEEKDAYS.map(() => null);

  const todayWeekdayIndex = getISODay(new Date());

  const editUrl = `/loos/${data.id}/edit`;

  const updatedAt = parseISO(data.updatedAt);
  let verifiedOrUpdatedDate = updatedAt;
  let verifiedOrUpdated = 'updated';
  if (data.verifiedAt) {
    const verifiedAt = parseISO(data.verifiedAt);
    // Add a minute for the comparison to account for the fact that verification causes updatedAt to update :-(
    if (updatedAt < add(verifiedAt, { minutes: 1 })) {
      verifiedOrUpdatedDate = verifiedAt;
      verifiedOrUpdated = 'verified';
    }
  }

  const plausible = usePlausible();

  const lastVerifiedFragment = useMemo(
    () => (
      <Box>
        <Text fontWeight="bold">
          <h2>Is this information correct?</h2>
        </Text>
        <Spacer mb={2} />
        <Box display="flex" alignItems="center">
          <Button
            variant="primary"
            onClick={() => {
              plausible('Verification Report');
              submitVerificationReportMutation({
                variables: { id: data.id },
                notifyOnNetworkStatusChange: true,
              });
            }}
            disabled={verificationReportState.loading === true}
          >
            Yes
            {verificationReportState.loading === true && (
              <Box ml="2">
                <Icon spin={true} icon={faSpinner} />
              </Box>
            )}
          </Button>
          <Spacer mr={4} />
          <Box display="flex" alignItems="center">
            No?
            <Spacer mr={2} />
            <Link passHref href={editUrl}>
              <Button as="a" variant="secondary" data-testid="edit-button">
                <Box mr={2}>
                  <Icon icon={faEdit} />
                </Box>
                Edit
              </Button>
            </Link>
          </Box>
        </Box>
        <Spacer mb={[0, 2]} />
        Last {verifiedOrUpdated}:{' '}
        <Link href={`/explorer/loos/${data.id}`}>
          {lightFormat(verifiedOrUpdatedDate, 'dd/MM/yyyy, hh:mm aa')}
        </Link>
      </Box>
    ),
    [
      data.id,
      editUrl,
      plausible,
      submitVerificationReportMutation,
      verificationReportState.loading,
      verifiedOrUpdated,
      verifiedOrUpdatedDate,
    ]
  );

  if (isExpanded) {
    return (
      <Box
        width="100%"
        color="primary"
        bg="white"
        borderTopLeftRadius={[3, 4]}
        borderTopRightRadius={[3, 4]}
        as="section"
        aria-labelledby="toilet-details-heading"
        data-testid="toilet-details"
        ref={containerRef}
      >
        <Media greaterThanOrEqual="md">
          <Box position="absolute" top={30} right={30}>
            <button
              type="button"
              aria-label="Close toilet details"
              onClick={() => setIsExpanded(false)}
              aria-expanded="true"
              ref={closeButtonRef}
            >
              <Box
                height={26}
                width={26}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius={13}
                borderColor="primary"
                borderWidth={1}
                borderStyle="solid"
              >
                <Icon icon={faTimes} />
              </Box>
            </button>
          </Box>
        </Media>

        <Media lessThan="md">
          <Box display="flex" justifyContent="center" paddingTop={2}>
            <Box
              as="button"
              type="button"
              aria-label="Close toilet details"
              onClick={() => setIsExpanded(false)}
              aria-expanded="true"
              padding={2}
              ref={closeButtonRef}
            >
              <Icon icon={faChevronDown} />
            </Box>
          </Box>
        </Media>

        <Box
          maxHeight={[325, 400]}
          overflow="auto"
          padding={[3, 4]}
          paddingTop={[0, 4]}
          paddingRight={[4, 5]}
          css={css`
            scroll-behavior: smooth;
          `}
        >
          <Grid>
            <Box
              width={['100%', '50%', '25%']}
              padding={3}
              id="#toilet-details-heading"
            >
              {titleFragment}
              <Spacer mb={2} />
              {getDirectionsFragment}
              <Media greaterThanOrEqual="md">
                <Spacer mb={4} />
                {lastVerifiedFragment}
              </Media>
            </Box>

            <Box width={['100%', '50%', '25%']} padding={3}>
              <Text fontWeight="bold">
                <h3>Features</h3>
              </Text>
              <Spacer mb={2} />
              <UnstyledList>
                {features.map((feature) => (
                  <Box
                    as="li"
                    key={feature.label}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1}
                  >
                    <Box display="flex" alignItems="center">
                      <Box width="20px" display="flex" justifyContent="center">
                        {feature.icon}
                      </Box>
                      <Spacer mr={2} />
                      {feature.label}
                    </Box>
                    {feature.valueIcon}
                  </Box>
                ))}
              </UnstyledList>
            </Box>

            <Box width={['100%', '50%', '25%']} padding={3}>
              {data.noPayment === false && (
                <>
                  <Text fontWeight="bold">
                    <h3>Fee</h3>
                  </Text>
                  <Spacer mb={2} />
                  {data.paymentDetails || 'Unknown'}
                  <Spacer mb={3} />
                </>
              )}
              {Boolean(data.notes) && (
                <>
                  <Text fontWeight="bold">
                    <h3>Notes</h3>
                  </Text>
                  <Spacer mb={2} />
                  <div>
                    {data.notes.split('\n').map((string, i) => (
                      <div key={i}>{string}</div>
                    ))}
                  </div>
                </>
              )}
            </Box>

            <Box width={['100%', '50%', '25%']} padding={3}>
              <Box display="flex" alignItems="center">
                <Icon icon={faClock} />
                <Spacer mr={2} />
                <Text fontWeight="bold">
                  <h2>Opening Hours</h2>
                </Text>
              </Box>
              <Spacer mb={[0, 2]} />
              <UnstyledList>
                {openingTimes.map((timeRange: unknown[], i) => (
                  <Box
                    as="li"
                    display="flex"
                    justifyContent="space-between"
                    key={i}
                    padding={1}
                    bg={i === todayWeekdayIndex - 1 ? 'ice' : 'white'}
                  >
                    <span>{WEEKDAYS[i]}</span>
                    <span>{getTimeRangeLabel(timeRange)}</span>
                  </Box>
                ))}
              </UnstyledList>
              <Spacer mb={2} />
              <Text fontSize={1} color="grey">
                Hours may vary with national holidays or seasonal changes. If
                you know these hours to be out of date please{' '}
                <Link passHref href={editUrl}>
                  <Button as="a" variant="link" data-testid="edit-link">
                    edit this toilet
                  </Button>
                </Link>
                .
              </Text>

              <Media lessThan="md">
                <Spacer mb={4} />
                {lastVerifiedFragment}
              </Media>
            </Box>

            <Media lessThan="md">
              <Box
                display="flex"
                justifyContent="center"
                width="100%"
                padding={2}
                marginBottom={2}
              >
                <Button as="a" variant="link" href="#toilet-details-heading">
                  Back to top
                </Button>
              </Box>
            </Media>
          </Grid>

          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      width="100%"
      color="primary"
      bg="white"
      minHeight={100}
      borderTopLeftRadius={[3, 4]}
      borderTopRightRadius={[3, 4]}
      padding={[3, 4]}
      as="section"
      aria-labelledby="toilet-details-heading"
      data-testid="toilet-details"
      ref={containerRef}
    >
      <Grid>
        <Box width={['100%', '50%', '25%']} padding={[3, 4]}>
          {titleFragment}
          <Spacer mb={2} />
        </Box>

        <Box width={['100%', '50%', '25%']} padding={[3, 4]}>
          {/* Supress opening hours heading during COVID-19
          <Box display="flex" alignItems="center">
            <Icon icon={faClock} />
            <Spacer mr={2} />
            <Text fontWeight="bold">
              <h3>Opening Hours</h3>
            </Text>
          </Box>
          <Spacer mb={[0, 2]} />
          {getIsOpenLabel(openingTimes)} */}
        </Box>

        <Box
          width={['100%', '50%']}
          padding={3}
          display="flex"
          justifyContent={['flex-start', 'flex-start', 'flex-end']}
          alignItems="center"
        >
          {getDirectionsFragment}
          <Spacer mr={2} />
          <Button
            variant="secondary"
            icon={<Icon icon={faList} />}
            onClick={() => setIsExpanded(true)}
            aria-expanded="false"
            data-testid="details-button"
          >
            Details
          </Button>
          <Spacer mr={2} />
          <Button
            variant="secondary"
            icon={<Icon icon={faList} />}
            onClick={navigateAway}
            aria-expanded="false"
            data-testid="close-button"
          >
            Close
          </Button>
        </Box>
      </Grid>
    </Box>
  );
};

export default ToiletDetailsPanel;
