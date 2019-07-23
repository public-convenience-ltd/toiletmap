import React, { Component } from 'react';
import _ from 'lodash';
import { Link } from '@reach/router';
import { loader } from 'graphql.macro';
import { Query } from 'react-apollo';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Papa from 'papaparse';

const AREA_STATS = loader('./areaStats.graphql');

const cells = [
  {
    keys: ['area', 'name'],
    name: 'Area Name',
  },
  {
    keys: ['totalLoos'],
    name: 'Loos',
  },
  {
    keys: ['activeLoos'],
    name: 'Active Loos',
  },
  {
    keys: ['publicLoos'],
    name: 'Public Loos',
  },
  {
    keys: ['permissiveLoos'],
    name: 'Permissive Loos',
  },
  {
    keys: ['babyChangeLoos'],
    name: 'Baby Changing',
  },
];

/*
  Get an element of an object/array from a 1-dimensional array of keys
*/
function accessFromKeys(obj, keys) {
  if (keys.length <= 1) return obj[keys[0]];

  // Recurse!
  return accessFromKeys(obj[keys[0]], keys.slice(1));
}

class AreaComparisonStats extends Component {
  constructor(props) {
    super(props);
    this.downloadCSV = this.downloadCSV.bind(this);
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (!_.isEqual(props.location.query, this.props.location.query)) {
      // TODO - what do we do when we have a query string?
    }
  }

  downloadCSV() {
    // TODO: to get the data for this CSV, use a GraphQL query with `withApollo`
    /*
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
    */
  }

  render() {
    return (
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
                return (
                  <TableCell key={'h_' + val.keys.join('_')}>
                    {val.name}
                  </TableCell>
                );
              })}
              <TableCell key={'h_listLink'} />
            </TableRow>
          </TableHead>
          <TableBody>
            <Query query={AREA_STATS}>
              {({ loading, error, data }) => {
                if (loading) return <h1>Loading area stats...</h1>;
                if (error) return <h1>Error fetching area stats: {error}</h1>;

                return data.areaStats.map((area, index) => (
                  <TableRow key={index}>
                    {cells.map(cell => (
                      <TableCell key={cell.keys.join('_') + 'c_' + index}>
                        {accessFromKeys(area, cell.keys)}
                      </TableCell>
                    ))}

                    <TableCell key={'c_listLink_' + index}>
                      <Link to={`../../search?area_name=${area.area.name}`}>
                        view loos
                      </Link>
                    </TableCell>
                  </TableRow>
                ));
              }}
            </Query>
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
    );
  }
}

export default AreaComparisonStats;
