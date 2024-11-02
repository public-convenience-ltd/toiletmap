import { css } from '@emotion/react';
import styled from '@emotion/styled';
import add from 'date-fns/add';
import getISODay from 'date-fns/getISODay';
import lightFormat from 'date-fns/lightFormat';
import parseISO from 'date-fns/parseISO';
import { usePlausible } from 'next-plausible';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Loo,
  useSubmitVerificationReportMutationMutation,
} from '../api-client/graphql';
import Badge from '../design-system/components/Badge';
import Button from '../design-system/components/Button';
import Icon from '../design-system/components/Icon';
import { getFeatures } from '../lib/features';
import { WEEKDAYS, getTimeRangeLabel } from '../lib/openingTimes';
import Box from './Box';
import { useMapState } from './MapState';
import { Media } from './Media';
import Spacer from './Spacer';
import Text from './Text';

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

function round(value: number, precision = 0) {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

const DistanceTo = ({ from, to }) => {
  const fromLatLng = global.L.latLng(from.lat, from.lng);

  const toLatLng = global.L.latLng(to.lat, to.lng);
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

interface ToiletDetailsPanelProps {
  data: Loo;
  startExpanded?: boolean;
  showCloseButton?: boolean;
  children?: React.ReactNode;
}

const ToiletDetailsPanel: React.FC<ToiletDetailsPanelProps> = ({
  data,
  startExpanded = false,
  showCloseButton = true,
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
        verificationReportState.error,
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
    [isExpanded, navigateAway],
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
        <span id="toilet-details-heading">{data.name || 'Unnamed Toilet'}</span>
      </Text>
      {mapState.geolocation && (
        <Box ml={5}>
          <DistanceTo from={mapState.geolocation} to={data.location} />
        </Box>
      )}
    </Box>
  );

  const getDirectionsFragment = (
    <Button
      variant="primary"
      htmlElement="a"
      rel="noopener noreferrer"
      href={`https://maps.apple.com/?dirflg=w&daddr=${[
        data.location.lat,
        data.location.lng,
      ]}`}
    >
      <Icon icon="diamond-turn-right" size="medium" />
      <span>Directions</span>
    </Button>
  );

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

  const features = useMemo(() => getFeatures(data), [data]);

  const lastVerifiedFragment = useMemo(
    () => (
      <Box>
        <Text fontWeight="bold">
          <span>Is this information correct?</span>
        </Text>
        <Spacer mb={2} />
        <Box display="flex" alignItems="center">
          <Button
            variant="primary"
            htmlElement="button"
            type="button"
            onClick={() => {
              plausible('Verification Report');
              submitVerificationReportMutation({
                variables: { id: data.id },
                notifyOnNetworkStatusChange: true,
              });
            }}
            disabled={verificationReportState.loading === true}
          >
            <span>Yes</span>
            {verificationReportState.loading === true && (
              <Icon spin={true} icon="spinner" />
            )}
          </Button>
          <Spacer mr={4} />
          <Box display="flex" alignItems="center">
            No?
            <Spacer mr={2} />
            <Button
              htmlElement="a"
              href={editUrl}
              variant="secondary"
              data-testid="edit-button"
            >
              <Icon icon="pen-to-square" size="small" />
              <span>Edit</span>
            </Button>
          </Box>
        </Box>
        <Spacer mb={[0, 2]} />
        Last {verifiedOrUpdated}:{' '}
        <Link href={`/explorer/loos/${data.id}`} prefetch={false}>
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
    ],
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
        {showCloseButton && (
          <Media greaterThanOrEqual="md">
            <Box position="absolute" top={30} right={30}>
              <button
                type="button"
                aria-label="Close toilet details"
                onClick={() => setIsExpanded(false)}
                aria-expanded="true"
                ref={closeButtonRef}
              >
                <Icon icon="circle-xmark" size="large" />
              </button>
            </Box>
          </Media>
        )}
        {showCloseButton && (
          <Media lessThan="md">
            <Box display="flex" justifyContent="center" paddingTop={2}>
              <Box
                as="button"
                // @ts-expect-error -- Generic box component can't handle these props
                type="button"
                aria-label="Close toilet details"
                onClick={() => setIsExpanded(false)}
                aria-expanded="true"
                padding={2}
                ref={closeButtonRef}
              >
                <Icon icon="chevron-down" size="medium" />
              </Box>
            </Box>
          </Media>
        )}

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
              <Spacer mb={3} />
              {data?.active === false && (
                <Badge>Removal reason: {data?.removalReason}</Badge>
              )}
              <Spacer mb={3} />
              {getDirectionsFragment}
              <Media greaterThanOrEqual="md">
                <Spacer mb={4} />
                {lastVerifiedFragment}
              </Media>
            </Box>

            <Box width={['100%', '50%', '25%']} padding={3}>
              <Text fontWeight="bold">
                <span>Features</span>
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
                    <span>Notes</span>
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
                <Icon icon="clock" />
                <Spacer mr={2} />
                <Text fontWeight="bold">
                  <span>Opening Hours</span>
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
                <Link href={editUrl} data-testid="edit-link">
                  edit this toilet
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
                <Link href="#toilet-details-heading">Back to top</Link>
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
          {data?.active === false && (
            <Badge>Removal reason: {data?.removalReason}</Badge>
          )}
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
            htmlElement="button"
            type="button"
            variant="secondary"
            onClick={() => setIsExpanded(true)}
            aria-expanded="false"
            data-testid="details-button"
          >
            <Icon icon="list" size="small" />
            <span>Details</span>
          </Button>
          <Spacer mr={2} />
          <Button
            variant="secondary"
            htmlElement="button"
            type="button"
            onClick={navigateAway}
            aria-expanded="false"
            data-testid="close-button"
          >
            <Icon icon="xmark" size="small" />
            <span>Close</span>
          </Button>
        </Box>
      </Grid>
    </Box>
  );
};

export default ToiletDetailsPanel;
