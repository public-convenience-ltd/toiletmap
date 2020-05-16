import React from 'react';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import { DateTime } from 'luxon';
import intersection from 'lodash/intersection';
import difference from 'lodash/difference';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import Notification from '../components/Notification';
import LooMap from '../components/LooMap';

import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

import styles from './css/loo-page.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import mappings from '../graphqlMappings';
import config from '../config';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

import gql from 'graphql-tag';

const FIND_LOO_QUERY = loader('./findLooById.graphql');
const GET_USER_DATA = gql`
  {
    userData @client {
      name
    }
  }
`;

function constructCampaignLink(loo, email = '') {
  let loc = loo.location;
  let coords = `${loc.lng},${loc.lat}`;
  let name = loo.name || '';
  let opening = loo.opening || '';
  return `https://docs.google.com/forms/d/e/1FAIpQLScMvkjoE68mR1Z-yyVH7YhdndHCd_k8QwbugwfbqgZGUr_DvQ/viewform?emailAddress=${encodeURIComponent(
    email
  )}&entry.975653982=${encodeURIComponent(
    coords
  )}&entry.688810578=${encodeURIComponent(
    name
  )}&entry.1574991632=${encodeURIComponent(opening)}`;
}

const LooPage = (props) => {
  // Provides a mapping between loo property names and the values we want to display
  const humanizedPropNames = {
    type: 'Facilities',
    accessible: 'Accessible facilities',
    babyChange: 'Baby Changing',
    attended: 'Attended',
    access: 'Who can access?',
    radar: 'Radar key',
    fee: 'Fee',
    removal_reason: 'Removed',
  };

  // Loo property order (top down by property name)
  const propertiesSort = [
    'access',
    'type',
    'accessible',
    'opening',
    'attended',
    'babyChange',
    'automatic',
    'radar',
    'fee',
    'notes',
  ];

  // Collection of properties to not display
  const propertiesBlacklist = [
    'active',
    'area',
    'name',
    'location',
    'toObject',
    'updatedAt',
    'createdAt',
    'removalReason',
    'id',
    '__typename',
  ];

  const { loading, data, error } = useQuery(FIND_LOO_QUERY, {
    variables: {
      id: props.match.params.id,
    },
    returnPartialData: true,
  });

  const [mapPosition, setMapPosition] = useMapPosition();

  const looLocation = (data && data.loo.location) || null;

  // Set the map position to the loo location
  React.useEffect(() => {
    if (looLocation) {
      setMapPosition({ center: looLocation });
    }
  }, [looLocation, setMapPosition]);

  const { data: loos } = useNearbyLoos({
    variables: {
      lat: mapPosition.center.lat,
      lng: mapPosition.center.lng,
      radius: mapPosition.radius,
    },
    skip: !looLocation,
  });

  const { loading: userLoading, data: userData, error: userError } = useQuery(
    GET_USER_DATA
  );

  const isThanksPage = props.match.path === '/loos/:id/thanks';

  function getPropertyNames() {
    // All property names in our loo object
    var names = Object.keys(data.loo);

    // Pick out contained properties of known order, we'll put them at the front
    var knownOrder = intersection(propertiesSort, names);

    // Pick out all other properties that are not blacklisted, we'll put them after
    var unknownOrder = difference(names, knownOrder, propertiesBlacklist);
    unknownOrder.sort();

    return knownOrder.concat(unknownOrder);
  }

  // Wrapper to graphqlMappings which allows mappings between loo property values and the
  // text we want to display
  function humanizePropertyName(val) {
    if (humanizedPropNames[val]) {
      return humanizedPropNames[val];
    }

    return mappings.humanizeAPIValue(val, '');
  }
  const loosToDisplay = loos.map((loo) => {
    if (loo.id === data.loo.id) {
      return {
        ...data.loo,
        isHighlighted: true,
      };
    }

    return loo;
  });

  let mapFragment = null;

  if (looLocation) {
    mapFragment = (
      <LooMap
        loos={loosToDisplay}
        center={mapPosition.center}
        zoom={mapPosition.zoom}
        onViewportChanged={setMapPosition}
      />
    );
  }

  if (loading || error || userLoading || userError || !data.loo) {
    let msg;
    if (error || userError) {
      msg = 'An error occurred. ';
      console.error(error);
    } else {
      msg = 'Fetching toilet data';
    }

    return <PageLayout main={<Loading message={msg} />} map={mapFragment} />;
  }

  const loo = data.loo;
  const properties = getPropertyNames();

  const mainFragment = (
    <div>
      <div className={layout.controls}>
        {config.showBackButtons && (
          <button onClick={props.history.goBack} className={controls.btn}>
            Back
          </button>
        )}

        {loo.active && (
          <>
            <a
              href={
                'https://maps.apple.com/?dirflg=w&daddr=' +
                [loo.location.lat, loo.location.lng]
              }
              className={controls.btn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>

            {config.allowAddEditLoo && (
              <Link to={`/loos/${loo.id}/edit`} className={controls.btn}>
                Edit toilet
              </Link>
            )}
          </>
        )}
      </div>

      {isThanksPage && (
        <>
          <h2 className={headings.large}>Thank You!</h2>
          <p>Thanks for the information you've provided.</p>
          <p>
            We rely on contributions of data like yours to keep the map accurate
            and useful.
          </p>
          <p>Please consider signing up with our sponsor's campaign.</p>
          <a
            className={controls.btnFeatured}
            target="_blank"
            rel="noopener noreferrer"
            href={constructCampaignLink(loo, userData.userData.name)}
          >
            Join the <strong>Use Our Loos</strong> campaign
          </a>
        </>
      )}

      {!loo.active && (
        <Notification>
          <b>This toilet has been removed.</b>
          {loo.removalReason && (
            <div>Removal reason: "{loo.removalReason}"</div>
          )}
        </Notification>
      )}

      <h2 className={headings.large}>{loo.name || 'Toilet'}</h2>

      <MediaQuery maxWidth={config.viewport.mobile}>
        <div className={styles.mobileMap}>{mapFragment}</div>
      </MediaQuery>

      <ul className={styles.properties}>
        {properties.map((name) => {
          var val = mappings.humanizePropertyValue(loo[name], name);

          // Filter out useless/unset data
          if (val !== 'Not known' && val !== '' && typeof val !== 'object') {
            return (
              <li className={styles.property} key={name}>
                <h3 className={styles.propertyName}>
                  {humanizePropertyName(name)}
                </h3>
                <p className={styles.propertyValue}>{val}</p>
              </li>
            );
          }

          return null;
        })}
      </ul>
      <h3 className={headings.small}>Data</h3>
      <p>
        Last updated:{' '}
        {DateTime.fromISO(loo.updatedAt).toLocaleString(DateTime.DATETIME_MED)}
      </p>
      <p>
        View more detailed data about this Toilet at{' '}
        <Link to={`/explorer/loos/${loo.id}`}>Toilet Map Explorer</Link>.
      </p>
    </div>
  );

  return <PageLayout main={mainFragment} map={mapFragment} />;
};

export default LooPage;
