import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo } from 'react';

import add from 'date-fns/add';
import getISODay from 'date-fns/getISODay';
import lightFormat from 'date-fns/lightFormat';
import parseISO from 'date-fns/parseISO';
import { usePlausible } from 'next-plausible';

import { getFeatures } from '../../../lib/features';
import { WEEKDAYS, getTimeRangeLabel } from '../../../lib/openingTimes';
import {
  Loo,
  useSubmitVerificationReportMutationMutation,
} from '../../../api-client/graphql';

import { useMapState } from '../../../components/MapState';
import Badge from '../Badge';
import Button from '../Button';
import Center from '../../layout/Center';
import Icon from '../Icon';
import Stack from '../../layout/Stack';

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

  return <span>{distance}</span>;
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

  const titleFragment = (
    <div className="toilet-details-panel__heading">
      <h2>
        <span>{data.name || 'Unnamed Toilet'}</span>
      </h2>
      {mapState.geolocation && (
        <p>
          <DistanceTo from={mapState.geolocation} to={data.location} />
        </p>
      )}
    </div>
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
      <>
        <p>Is this information correct?</p>
        <div className="toilet-details-panel__verification-buttons">
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
          <p>
            No?
            <Button
              htmlElement="a"
              href={editUrl}
              variant="secondary"
              data-testid="edit-button"
            >
              <Icon icon="pen-to-square" size="small" />
              <span>Edit</span>
            </Button>
          </p>
        </div>
        <p>
          Last {verifiedOrUpdated}:{' '}
          <Link href={`/explorer/loos/${data.id}`} prefetch={false}>
            {lightFormat(verifiedOrUpdatedDate, 'dd/MM/yyyy, hh:mm aa')}
          </Link>
        </p>
      </>
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
      <section className="toilet-details-panel" data-testid="toilet-details">
        <Center text={false} gutter={true} article={false}>
          <Stack>
            {showCloseButton && (
              <Button
                variant="secondary"
                htmlElement="button"
                onClick={() => setIsExpanded(false)}
                aria-expanded="true"
                ref={closeButtonRef}
              >
                <Icon icon="xmark" size="medium" />
                <span>Close</span>
              </Button>
            )}

            <div className="toilet-details-panel__container">
              <div id="toilet-details-heading">
                <Stack>
                  {children}
                  {titleFragment}
                  {data?.active === false && (
                    <Badge>Removal reason: {data?.removalReason}</Badge>
                  )}
                  {getDirectionsFragment}
                  {lastVerifiedFragment}
                </Stack>
              </div>

              <div>
                <h3>Features</h3>
                <ul className="toilet-details-panel__list">
                  {features.map((feature) => (
                    <li
                      className="toilet-details-panel__list-item"
                      key={feature.label}
                    >
                      <span className="toilet-details-panel__feature-label">
                        {feature.icon}
                        {feature.label}
                      </span>
                      {feature.valueIcon}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {data.noPayment === false && (
                  <>
                    <h3>Fee</h3>
                    <p>{data.paymentDetails || 'Unknown'}</p>
                  </>
                )}
                {Boolean(data.notes) && (
                  <>
                    <h3>Notes</h3>
                    <p>
                      {data.notes.split('\n').map((string, i) => (
                        <span key={i}>{string}</span>
                      ))}
                    </p>
                  </>
                )}
              </div>

              <div>
                <h3>
                  <Icon icon="clock" />
                  <span>Opening Hours</span>
                </h3>

                <ul className="toilet-details-panel__list">
                  {openingTimes.map((timeRange: unknown[], i) => (
                    <li
                      className={`toilet-details-panel__list-item toilet-details-panel__list-item--${i === todayWeekdayIndex - 1 ? 'ice' : 'white'}`}
                      key={i}
                    >
                      <span>{WEEKDAYS[i]}</span>
                      <span>{getTimeRangeLabel(timeRange)}</span>
                    </li>
                  ))}
                </ul>
                <p className="toilet-details-panel__opening-hours-warning">
                  Hours may vary with national holidays or seasonal changes. If
                  you know these hours to be out of date please{' '}
                  <Link href={editUrl} data-testid="edit-link">
                    edit this toilet
                  </Link>
                  .
                </p>
                <Link
                  className="toilet-details-panel__back-to-top"
                  href="#toilet-details-heading"
                >
                  Back to top
                </Link>
              </div>
            </div>
          </Stack>
        </Center>
      </section>
    );
  }

  return (
    <section
      className="toilet-details-panel toilet-details-panel--collapsed"
      data-testid="toilet-details"
    >
      <Center text={false} gutter={true} article={false}>
        <div className="toilet-details-panel__collapsed-title">
          {titleFragment}
          {data?.active === false && (
            <Badge>Removal reason: {data?.removalReason}</Badge>
          )}
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
        </div>

        <div className="toilet-details-panel__actions">
          {getDirectionsFragment}
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
        </div>
      </Center>
    </section>
  );
};

export default ToiletDetailsPanel;
