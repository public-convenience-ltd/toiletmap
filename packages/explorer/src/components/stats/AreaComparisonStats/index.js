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

const AREA_STATS = loader('./areaStats.graphql');

const cells = [
  {
    key: 'area.name',
    name: 'Area Name',
  },
  {
    key: 'totalLoos',
    name: 'Loos',
  },
  {
    key: 'activeLoos',
    name: 'Active Loos',
  },
  {
    key: 'publicLoos',
    name: 'Public Loos',
  },
  {
    key: 'permissiveLoos',
    name: 'Permissive Loos',
  },
  {
    key: 'babyChangeLoos',
    name: 'Baby Changing',
  },
];

class AreaComparisonStats extends Component {
  UNSAFE_componentWillReceiveProps(props) {
    if (!_.isEqual(props.location.query, this.props.location.query)) {
      // TODO - what do we do when we have a query string?
    }
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
                return <TableCell key={'h_' + val.key}>{val.name}</TableCell>;
              })}
              <TableCell key={'h_listLink'} />
            </TableRow>
          </TableHead>
          <TableBody>
            <Query query={AREA_STATS}>
              {({ loading, error, data }) => {
                if (loading) {
                  return (
                    <TableRow>
                      <TableCell>
                        <h5>Loading area stats...</h5>
                      </TableCell>
                    </TableRow>
                  );
                }

                if (error) {
                  return (
                    <TableRow>
                      <TableCell>
                        <h5>Error fetching area stats: {error}</h5>
                      </TableCell>
                    </TableRow>
                  );
                }

                return data.areaStats.map((area, index) => (
                  <TableRow key={index}>
                    {cells.map(cell => (
                      <TableCell key={cell.key + 'c_' + index}>
                        {_.get(area, cell.key)}
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
      </div>
    );
  }
}

export default AreaComparisonStats;
