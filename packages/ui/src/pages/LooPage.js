import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import { actionFindByIdRequest } from '../redux/modules/loos';
import { actionHighlight } from '../redux/modules/mapControls';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import PreferenceIndicators from '../components/PreferenceIndicators';
import NearestLooMap from '../components/NearestLooMap';

import styles from './css/loo-page.module.css';
import layout from '../components/css/layout.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import api from '../api';
import config from '../config';

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

  // Returns HTML representing the loo credibility score
  renderRating() {
    var maxScore = 5;
    var score = Math.ceil((this.props.loo.credibility || 0) / 4);
    var stars = '&#x2605;'.repeat(score) + '&#x2606;'.repeat(maxScore - score);

    return {
      __html: `${score} out of 5<br /><span aria-hidden="true">${stars}</span>`,
    };
  }

  // Wrapper to `api.humanize` which allows mappings between loo property values and the
  // text we want to display
  humanizePropertyName(val) {
    if (this.humanizedPropNames[val]) {
      return this.humanizedPropNames[val];
    }

    return api.humanize(val);
  }

  humanizePropertyValue(val, property) {
    if (config.looProps.definitions[property]) {
      // We may a human readable definition of this property value
      let override = config.looProps.definitions[property].find(
        s => s.value === val
      );
      if (override) {
        return override.name;
      }
    }

    // Second condition is for an irregularity in our dataset; do this until we normalise better
    if (
      config.looProps.canHumanize.includes(property) ||
      (property === 'fee' && val === 'false')
    ) {
      // We can humanize this kind of property to make it more human-readable
      return api.humanize(val);
    }

    // This was likely entered as human-readable, leave it be
    return val;
  }

  renderMain() {
    var loo = this.props.loo;
    var properties = this.getPropertyNames();

    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button
                onClick={this.props.history.goBack}
                className={controls.btn}
              >
                Back
              </button>
            )}

            <a
              href={
                'https://maps.apple.com/?saddr=here&daddr=' +
                [loo.geometry.coordinates[1], loo.geometry.coordinates[0]]
              }
              className={controls.btn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>

            {config.allowAddEditLoo && (
              <Link to={`/loos/${loo._id}/edit`} className={controls.btn}>
                Edit toilet
              </Link>
            )}
          </div>
        </div>

        <h2 className={headings.large}>{loo.properties.name || 'Toilet'}</h2>

        <div className={styles.preferenceIndicators}>
          <PreferenceIndicators loo={loo} iconSize={2.5} />
        </div>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <div className={styles.mobileMap}>{this.renderMap()}</div>
        </MediaQuery>

        <ul className={styles.properties}>
          {properties.map(name => {
            var val = this.humanizePropertyValue(loo.properties[name], name);

            // Filter out useless/unset data
            if (val !== 'Not known' && val !== '') {
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

        <div className={styles.data}>
          <h3 className={styles.dataTitle}>
            Data{' '}
            <span className={styles.dataSubTitle}>
              (technical info for this toilet)
            </span>
          </h3>

          <table className={styles.dataTable}>
            <caption className={helpers.visuallyHidden}>Toilet Data</caption>
            <thead className={helpers.visuallyHidden}>
              <tr>
                <th scope="col">Keys</th>
                <th scope="col">Values</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Credibility:</th>
                <td dangerouslySetInnerHTML={this.renderRating()} />
              </tr>
              <tr>
                <th scope="row">Geohash:</th>
                <td>{loo.geohash}</td>
              </tr>
              <tr>
                <th scope="row">Formats:</th>
                <td>
                  <a
                    href={`${config.apiEndpoint}/loos/${loo._id}?format=json`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    JSON
                  </a>
                </td>
              </tr>
              <tr>
                <th scope="row">Sources:</th>
                <td>
                  {loo.reports.map((report, index) => {
                    var href = `${
                      config.apiEndpoint
                    }/reports/${report}?format=json`;

                    return (
                      <a
                        key={index}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        [{index + 1}]
                      </a>
                    );
                  })}
                </td>
              </tr>
              <tr>
                <th scope="row">Contributors:</th>
                <td>{loo.attributions.join(', ')}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
          preventDragging: true,
          minZoom: config.initialZoom,
        }}
      />
    );
  }

  render() {
    if (!this.props.loo) {
      return (
        <PageLayout
          main={<Loading message={'Fetching Loo Data'} />}
          map={<Loading message={'Fetching Loo Data'} />}
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
