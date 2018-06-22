import React, { Component } from 'react';
import _ from 'lodash';
import settings from '../../lib/settings';
import queryString from 'query-string';
import moment from 'moment';

//import RefreshIndicator from 'material-ui/RefreshIndicator';

import Counter from './Counter';
import CrowdIcon from '@material-ui/icons/GroupAdd';
import LooIcon from '@material-ui/icons/Wc';
import RemoveIcon from '@material-ui/icons/Delete';
import ImportIcon from '@material-ui/icons/CloudDownload';
import StatIcon from '@material-ui/icons/Assessment';
import RefreshIcon from '@material-ui/icons/Refresh';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ListSubheader from '@material-ui/core/ListSubheader';
import { Doughnut } from 'react-chartjs-2';

const RED = '#FF6384';
const GREEN = '#36A2EB';
const YELLOW = '#FFCE56';
const H_RED = '#FF6384';
const H_GREEN = '#36A2EB';
const H_YELLOW = '#FFCE56';

function makeDoughnutData(labels, data) {
  return {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor: [GREEN, RED, YELLOW],
        hoverBackgroundColor: [H_GREEN, H_RED, H_YELLOW],
      },
    ],
  };
}

class HeadlineStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadedInitialData: false,
      refreshing: false,
      counters: null,
      proportions: null,
    };
  }

  fetchStats(query) {
    var q = query || this.props.location.query;
    this.setState({
      refreshing: true,
    });
    //Gets stats from the api applying query values
    var countersUrl =
      settings.getItem('apiUrl') +
      '/statistics/counters?' +
      queryString.stringify(q);
    var counters = fetch(countersUrl)
      .then(response => {
        return response.json();
      })
      .then(result => {
        this.setState({
          counters: result,
        });
      });

    var proportionsUrl =
      settings.getItem('apiUrl') +
      '/statistics/proportions?' +
      queryString.stringify(q);
    var proportions = fetch(proportionsUrl)
      .then(response => {
        return response.json();
      })
      .then(result => {
        this.setState({
          proportions: result,
        });
      });

    return Promise.all([counters, proportions]).then(() => {
      this.setState({
        refreshing: false,
      });
    });
  }

  componentDidMount() {
    // Rerieve stats for the initial query
    this.fetchStats().then(() => {
      this.setState({
        loadedInitialData: true,
      });
    });
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (!_.isEqual(props.location.query, this.props.location.query)) {
      this.fetchStats(props.location.query);
    }
  }

  render() {
    return this.state.loadedInitialData ? (
      <div>
        <div
          style={{
            width: '100%',
            marginLeft: 'auto',
            marginRight: 'auto',
            textAlign: 'center',
          }}
        >
          <span style={{ position: 'relative' }}>
            {/* <RefreshIndicator size={150} top={20} left={0} status={this.state.refreshing ? 'loading' : 'hide'}/> */}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexFlow: 'row wrap',
            justifyContent: 'space-around',
            padding: '0.5px',
          }}
        >
          <Counter
            value={this.state.counters['Active Toilets Added']}
            icon={<LooIcon />}
            label="Active Loos"
          />
          <Counter
            value={this.state.counters['Inactive/Removed Toilets']}
            icon={<RemoveIcon />}
            label="Removed Loos"
          />
          <Counter
            value={this.state.counters['Total Loo Reports Recorded']}
            icon={<StatIcon />}
            label="Total Reports"
          />
          <Counter
            value={this.state.counters['Total Reports via Web UI/API']}
            icon={<CrowdIcon />}
            label="User Reports"
          />
          <Counter
            value={this.state.counters['Reports from Data Collections']}
            icon={<ImportIcon />}
            label="Imported Reports"
          />
          <Counter
            value={this.state.counters['Loos with Multiple Reports']}
            icon={<RefreshIcon />}
            label="Multiple Reports"
          />
          <Counter
            value={this.state.counters['Removal Reports Submitted']}
            icon={<RemoveIcon />}
            label="Removal Reports"
          />
        </div>

        <GridList cols={2} cellHeight={200} padding={1}>
          <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
            <ListSubheader component="div">
              <h2>Headline Counts</h2>
              {`${moment(this.props.location.query.start).format(
                'ddd, MMM Do YYYY'
              )} to ${moment(this.props.location.query.end).format(
                'ddd, MMM Do YYYY'
              )} in ${this.props.location.query.area ||
                this.props.location.query.areaType}`}
            </ListSubheader>
          </GridListTile>
          <GridListTile rows={2} cols={1}>
            <Doughnut
              height={150}
              data={makeDoughnutData(
                ['public', 'restricted', 'unknown'],
                this.state.proportions['Public Loos']
              )}
            />
            <GridListTileBar
              titlePosition="bottom"
              title="Public Loos"
              subtitle="Loos marked for public use"
            />
          </GridListTile>
          <GridListTile rows={2} cols={1}>
            <Doughnut
              height={150}
              data={makeDoughnutData(
                ['open', 'closed'],
                this.state.proportions['Active Loos']
              )}
            />
            <GridListTileBar
              titlePosition="bottom"
              title="Closed Loos"
              subtitle="Loos marked as closed"
            />
          </GridListTile>
          <GridListTile rows={2} cols={1}>
            <Doughnut
              height={150}
              data={makeDoughnutData(
                ['acessible', 'inaccessible', 'unknown'],
                this.state.proportions['Accessible Loos']
              )}
            />
            <GridListTileBar
              titlePosition="bottom"
              title="Accessible Loos"
              subtitle="Loos marked as accessible"
            />
          </GridListTile>
          <GridListTile rows={2} cols={1}>
            <Doughnut
              height={150}
              data={makeDoughnutData(
                ['yes', 'no', 'unknown'],
                this.state.proportions['Baby Changing']
              )}
            />
            <GridListTileBar
              titlePosition="bottom"
              title="Baby Changing"
              subtitle="Loos with baby changing facilities"
            />
          </GridListTile>
        </GridList>
      </div>
    ) : (
      <h1>Loading</h1>
    );
  }
}

export default HeadlineStats;
