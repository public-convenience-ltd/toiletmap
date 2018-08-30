import React, { Component } from 'react';
import { navigate, Location } from '@reach/router';
import _ from 'lodash';
import settings from '../lib/settings';
import moment from 'moment';

import QueryScoper from './stats/QueryScoper';

const historyStarts = moment('2015-01-23');
const historyEnds = moment().add(1, 'days');

class Statistics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadedInitialData: false,
      refreshing: false,
      counters: null,
      proportions: null,
      contributors: null,
      areaData: {},
      areaTypeList: [],
      areaList: [],
      minDate: historyStarts,
      maxDate: historyEnds,
    };

    this.updateQuery = this.updateQuery.bind(this);
  }

  componentDidMount() {
    //gets list of areas and area Types to use in the area dropdowns
    var searchUrl = settings.getItem('apiUrl') + '/admin_geo/areas';
    fetch(searchUrl)
      .then(response => {
        return response.json();
      })
      .then(result => {
        result.All = _.uniq(_.flatten(_.values(result))).sort();
        _.each(result, v => v.unshift('All'));
        this.setState({
          areaData: result,
          areaTypeList: _.keys(result).sort(),
          areaList: result.All,
          loadedInitialData: true,
        });
      });
  }

  updateQuery(query) {
    navigate(this.props.location.pathname, {
      state: {
        query: query,
      },
    });
  }

  render() {
    return this.state.loadedInitialData ? (
      <div>
        <Location>
          {({ location }) =>
            location.state && (
              <QueryScoper
                start={location.state.start}
                end={location.state.end}
                minDate={this.state.minDate}
                maxDate={this.state.maxDate}
                areaType={location.state.areaType}
                areaTypeList={this.state.areaTypeList}
                area={location.state.area}
                areaData={location.state.areaData}
                onChange={this.updateQuery}
              />
            )
          }
        </Location>
        {this.props.children}
      </div>
    ) : (
      <h1>Loading</h1>
    );
  }
}

export default Statistics;
