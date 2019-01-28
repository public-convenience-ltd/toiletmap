import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';
import { DateTime } from 'luxon';

import { mappings } from '@toiletmap/api-client';

import config from '../../config';

import Button from '../../design-system/src/components/Button';
import LinkButton from '../../design-system/src/components/LinkButton';
import Group from '../../design-system/src/components/Group';
import Heading from '../../design-system/src/components/Heading';
import VerticalSpacing from '../../design-system/src/components/VerticalSpacing';

import PageLayout from '../../PageLayout';
import Loading from '../../Loading';
import PreferenceIndicators from '../../PreferenceIndicators';
import NearestLooMap from '../../NearestLooMap';

import styles from './LooPage.module.css';

import { actionFindByIdRequest } from '../../redux/modules/loos';
import { actionHighlight } from '../../redux/modules/mapControls';

class LooPage extends Component {
  // Provides a mapping between loo property names and the values we want to display
  humanizedPropNames = {
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
  propertiesSort = [
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
  propertiesBlacklist = [
    'orig',
    'active',
    'area',
    'name',
    'geocoded',
    'geocoding_method',
    'toObject',
  ];

  componentDidMount() {
    if (!this.props.loo) {
      this.props.actionFindByIdRequest(this.props.match.params.id);
    }
    this.props.actionHighlight(this.props.match.params.id);
  }

  componentDidUpdate(prevProps) {
    // Support navigation _between_ loo pages
    if (this.props.match.params.id !== prevProps.match.params.id) {
      if (!this.props.loo) {
        this.props.actionFindByIdRequest(this.props.match.params.id);
      }
      this.props.actionHighlight(this.props.match.params.id);
    }
  }

  componentWillUnmount() {
    // Clear any marker highlighting when navigating away
    this.props.actionHighlight(null);
  }

  getPropertyNames() {
    // All property names in our loo object
    var names = Object.keys(this.props.loo.properties);

    // Pick out contained properties of known order, we'll put them at the front
    var knownOrder = _.intersection(this.propertiesSort, names);

    // Pick out all other properties that are not blacklisted, we'll put them after
    var unknownOrder = _.difference(
      names,
      knownOrder,
      this.propertiesBlacklist
    );
    unknownOrder.sort();

    return knownOrder.concat(unknownOrder);
  }

  // Wrapper to `@toiletmap/api-client.mappings.humanizeAPIValue` which allows mappings between loo property values and the
  // text we want to display
  humanizePropertyName(val) {
    if (this.humanizedPropNames[val]) {
      return this.humanizedPropNames[val];
    }

    return mappings.humanizeAPIValue(val);
  }

  renderMain() {
    var loo = this.props.loo;
    var properties = this.getPropertyNames();

    return (
      <div>
        <Group direction="row">
          {config.showBackButtons && (
            <Button onClick={this.props.history.goBack}>Back</Button>
          )}

          <LinkButton
            to={
              'https://maps.apple.com/?dirflg=w&daddr=' +
              [
                loo.properties.geometry.coordinates[1],
                loo.properties.geometry.coordinates[0],
              ]
            }
          >
            Get Directions
          </LinkButton>

          {config.allowAddEditLoo && (
            <LinkButton to={`/loos/${loo._id}/edit`}>Edit toilet</LinkButton>
          )}
        </Group>
        <VerticalSpacing />

        <Heading headingLevel={2} size="large">
          {loo.properties.name || 'Toilet'}
        </Heading>

        <div className={styles.preferenceIndicators}>
          <PreferenceIndicators loo={loo} iconSize={2.5} />
        </div>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{this.renderMap()}</div>
        </MediaQuery>

        <ul className={styles.properties}>
          {properties.map(name => {
            var val = mappings.humanizePropertyValue(
              loo.properties[name],
              name
            );

            // Filter out useless/unset data
            if (val !== 'Not known' && val !== '' && typeof val !== 'object') {
              return (
                <li className={styles.property} key={name}>
                  <h3 className={styles.propertyName}>
                    {this.humanizePropertyName(name)}
                  </h3>
                  <p className={styles.propertyValue}>{val}</p>
                </li>
              );
            }

            return null;
          })}
        </ul>

        <Heading headingLevel={3} size="small">
          Data
        </Heading>
        <p>
          Last updated:{' '}
          {DateTime.fromISO(loo.updatedAt).toLocaleString(
            DateTime.DATETIME_MED
          )}
        </p>
        <p>
          View more detailed data about this Toilet at{' '}
          <a
            href={`/explorer/loos/${loo._id}`}
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

  renderMap() {
    return (
      <NearestLooMap
        loo={this.props.loo}
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

  render() {
    if (!this.props.loo) {
      return (
        <PageLayout
          main={<Loading message="Fetching Toilet Data" />}
          map={<Loading message="Fetching Toilet Data" />}
        />
      );
    }
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

var mapStateToProps = (state, ownProps) => ({
  app: state.app,
  loo: state.loos.byId[ownProps.match.params.id] || null,
});

var mapDispatchToProps = {
  actionFindByIdRequest,
  actionHighlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LooPage);
