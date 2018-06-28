import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import _ from 'lodash';

import PreferenceIndicators from '../components/PreferenceIndicators';
import SingleLooMap from '../components/map/SingleLooMap';

import styles from './css/loo-page.module.css';
import layout from '../components/css/layout.module.css';
import helpers from '../css/helpers.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import api from '../api';
import config from '../config';

class LooPage extends Component {
  // Provides a mapping between loo properies and the values we want to display
  humanizedValues = {
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

  constructor(props) {
    super(props);

    this.renderRating = this.renderRating.bind(this);
  }

  getPropertyNames() {
    // Apply a sort to match the property order of `this.propertiesSort`
    var sorted = _.intersection(
      this.propertiesSort,
      Object.keys(this.props.loo.properties)
    );

    // Omit proprties found in the blacklist
    return sorted.filter(property => {
      return !this.propertiesBlacklist.includes(property);
    });
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
  humanize(val) {
    if (this.humanizedValues[val]) {
      return this.humanizedValues[val];
    }

    return api.humanize(val);
  }

  render() {
    var loo = this.props.loo;
    var properties = this.getPropertyNames();

    return (
      <div>
        {(this.props.app.canGoBack || config.allowAddEditLoo) && (
          <div>
            <div className={layout.controls}>
              {this.props.app.canGoBack && (
                <button
                  onClick={() => alert('fix me')}
                  className={controls.btn}
                >
                  Back
                </button>
              )}

              {config.allowAddEditLoo && (
                <Link to={`/loos/${loo._id}/edit`} className={controls.btn}>
                  Edit toilet
                </Link>
              )}
            </div>
          </div>
        )}

        <h2 className={headings.large}>{loo.properties.name || 'Toilet'}</h2>

        <div className={styles.preferenceIndicators}>
          <PreferenceIndicators loo={loo} iconSize={2.5} />
        </div>

        <MediaQuery maxWidth={config.viewport.mobile}>
          <SingleLooMap
            loo={loo}
            looMapProps={{
              className: styles.map,
            }}
          />
        </MediaQuery>

        <ul className={styles.properties}>
          {properties.map(name => {
            var val = this.humanize(loo.properties[name]);

            // Filter out useless/unset data
            if (val !== 'Not known' && val !== '') {
              return (
                <li className={styles.property} key={name}>
                  <h3 className={styles.propertyName}>{this.humanize(name)}</h3>
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
}

var mapStateToProps = state => ({
  app: state.app,
});

var mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LooPage);
