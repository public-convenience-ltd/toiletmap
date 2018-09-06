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
  constructor(props) {
    super(props);

    this.state = {
      page: this.props.page,
      rowsPerPage: this.props.rowsPerPage,
    };
  }

  componentDidUpdate(prevProps) {
    const { page: prevPage, rowsPerPage: prevRowsPerPage } = prevProps;
    const { page, rowsPerPage } = this.props;
    if (prevPage !== page) {
      this.setState({ page: page });
    } else if (prevRowsPerPage !== rowsPerPage) {
      this.setState({ rowsPerPage });
    }
  }

  render() {
    const {
      classes,
      data,
      colRender,
      rowRender,
      footerRender,
      handleChangePage,
      handleChangeRowsPerPage,
    } = this.props;
    const { page, rowsPerPage } = this.state;
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
              handleChangePage: handleChangePage.bind(this),
              handleChangeRowsPerPage: handleChangeRowsPerPage.bind(this),
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
  handleChangePage(event, page) {
    this.setState({ page });
  },
  handleChangeRowsPerPage(event) {
    this.setState({ rowsPerPage: event.target.value });
  },
  rowsPerPage: 10,
  page: 0,
};

export default withStyles(styles, { withTheme: true })(LooTable);
