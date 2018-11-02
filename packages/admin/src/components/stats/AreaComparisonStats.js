import React, { Component } from 'react';
import _ from 'lodash';
import api from '@toiletmap/api-client';
import { Link } from '@reach/router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Papa from 'papaparse';

const cells = [
  {
    key: '_id',
    name: 'Area Name',
  },
  {
    key: 'looCount',
    name: 'Loos',
  },
  {
    key: 'activeLooCount',
    name: 'Active Loos',
  },
  {
    key: 'publicLooCount',
    name: 'Public Loos',
  },
  {
    key: 'permissiveLooCount',
    name: 'Permissive Loos',
  },
  {
    key: 'babyChangeCount',
    name: 'Baby Changing',
  },
];

class AreaComparisonStats extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadedInitialData: false,
      refreshing: false,
      data: null,
    };

    this.downloadCSV = this.downloadCSV.bind(this);
  }

  async fetchStats(query) {
    var q = query || this.props.location.query;
    this.setState({
      refreshing: true,
    });
    //Gets stats from the api applying query values
    const result = await api.fetchAreaStatistics(q);
    this.setState({
      data: result,
      refreshing: false,
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

  downloadCSV() {
    console.log('Download a csv');
    var csv = Papa.unparse(this.state.data);
    console.log(csv);
    if (!csv.match(/^data:text\/csv/i)) {
      csv = 'data:text/csv;charset=utf-8,' + csv;
    }
    var data = encodeURI(csv);

    var link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', 'gbptm.csv');
    link.click();
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
        <Table height={'600px'}>
          <TableHead>
            <TableRow>
              {_.map(cells, val => {
                return <TableCell key={'h_' + val.key}>{val.name}</TableCell>;
              })}
              <TableCell key={'h_listLink'} />
            </TableRow>
          </TableHead>
          <TableBody>
            {this.state.data.map((row, index) => (
              <TableRow key={index}>
                {cells.map(cell => {
                  return (
                    <TableCell key={cell.key + 'c_' + index}>
                      {row[cell.key]}
                    </TableCell>
                  );
                })}
                <TableCell key={'c_listLink_' + index}>
                  <Link to={`../../search?area_name=${row._id}`}>
                    view loos
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* <Toolbar>
					<ToolbarGroup />
					<ToolbarGroup lastChild={true}>
						<ToolbarSeparator/>
						<RaisedButton
						  label="Download CSV"
						  labelPosition="before"
						  primary={true}
						  onClick={this.downloadCSV}
						  />
					</ToolbarGroup>
				</Toolbar> */}
      </div>
    ) : (
      <h1>Loading</h1>
    );
  }
}

export default AreaComparisonStats;
