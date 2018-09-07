import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import { TableFooter } from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
    marginTop: theme.spacing.unit * 3,
  },
  table: {
    minWidth: 500,
  },
  actionStyles: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class LooTable extends Component {
  render() {
    const {
      classes,
      data,
      colRender,
      rowRender,
      footerRender,
      rowsPerPage,
      page,
      handleChangePage,
      handleChangeRowsPerPage,
    } = this.props;

    return (
      <div className={classes.root}>
        <Table className={classes.table}>
          <TableHead>{colRender()}</TableHead>
          <TableBody>
            {rowRender({
              data,
            })}
          </TableBody>
          <TableFooter>
            {footerRender({
              data,
              rowsPerPage,
              page,
              handleChangePage: handleChangePage,
              handleChangeRowsPerPage: handleChangeRowsPerPage,
            })}
          </TableFooter>
        </Table>
      </div>
    );
  }
}

LooTable.propTypes = {
  classes: PropTypes.object.isRequired,
  data: PropTypes.shape({
    docs: PropTypes.array.isRequired,
  }),
  rowRender: PropTypes.func.isRequired,
  colRender: PropTypes.func.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

LooTable.defaultProps = {
  footerRender() {
    return null;
  },
  rowsPerPage: 10,
  page: 0,
};

export default withStyles(styles, { withTheme: true })(LooTable);
