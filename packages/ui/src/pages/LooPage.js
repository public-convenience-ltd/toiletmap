import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MediaQuery from 'react-responsive';
import _ from 'lodash';
import { DateTime } from 'luxon';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
// import PreferenceIndicators from '../components/PreferenceIndicators';
import NearestLooMap from '../components/NearestLooMap';

import styles from './css/loo-page.module.css';
import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import mappings from '../graphqlMappings';
import config from '../config';

import { loader } from 'graphql.macro';
import { useQuery } from '@apollo/client';

const FIND_LOO_QUERY = loader('./findLooById.graphql');

const LooPage = function LooPage(props) {
  // Provides a mapping between loo property names and the values we want to display
  const humanizedPropNames = {
    type: 'Facilities',
    accessibleType: 'Accessible facilities',
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
    'accessibleType',
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
    'id',
    '__typename',
  ];

  const [currentLoo, setCurrentLoo] = useState();

  let looId = props.match.params.id;
  const { queryLoading, queryError } = useQuery(FIND_LOO_QUERY, {
    variables: {
      id: looId,
    },
    onCompleted: data => {
      console.log('completed,', data.loo);
      setCurrentLoo(data.loo);
    },
  });

  function getPropertyNames() {
    // All property names in our loo object
    var names = Object.keys(currentLoo);

    // Pick out contained properties of known order, we'll put them at the front
    var knownOrder = _.intersection(propertiesSort, names);

    // Pick out all other properties that are not blacklisted, we'll put them after
    var unknownOrder = _.difference(names, knownOrder, propertiesBlacklist);
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

  function renderMain() {
    var loo = currentLoo;
    var properties = getPropertyNames();

    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button onClick={props.history.goBack} className={controls.btn}>
                Back
              </button>
            )}

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
          </div>
        </div>

        <h2 className={headings.large}>{loo.name || 'Toilet'}</h2>

        <div className={styles.preferenceIndicators}>
          {
            '' /* <PreferenceIndicators loo={loo} iconSize={2.5} /> TODO fix this */
          }
        </div>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{renderMap()}</div>
        </MediaQuery>

        <ul className={styles.properties}>
          {properties.map(name => {
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
          {DateTime.fromISO(loo.updatedAt).toLocaleString(
            DateTime.DATETIME_MED
          )}
        </p>
        <p>
          View more detailed data about this Toilet at{' '}
          <a
            href={`/explorer/loos/${loo.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Toilet Map Explorer
          </a>
          .
        </p>
      </div>
    );
  }

  function renderMap() {
    // TODO currentLoo
    return (
      <NearestLooMap
        loo={currentLoo /* TODO fix */}
        mapProps={{
          showLocation: false,
          showSearchControl: false,
          showLocateControl: false,
          showCenter: false,
          countLimit: null,
        }}
      />
    );
  }

  if (queryLoading || queryError || !currentLoo) {
    let msg;
    if (queryError) {
      msg = 'An error occurred. ';
      console.error(queryError);
    } else {
      msg = 'Fetching toilet data';
    }

    return (
      <PageLayout
        main={<Loading message={msg} />}
        map={<Loading message={msg} />}
      />
    );
  }
  return (
    <PageLayout
      main={renderMain()}
      map={<Loading message={'TODO'} /> /*renderMap()*/}
    />
  );
};

export default LooPage;
