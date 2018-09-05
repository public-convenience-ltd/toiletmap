import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';

const styles = theme => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
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
          {footerRender({
            data,
            rowsPerPage,
            page,
            handleChangePage,
          })}
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
};

LooTable.defaultProps = {
  footerRender() {
    return null;
  },
  handleChangePage(event, page) {
    this.setState({ page });
  },
  rowsPerPage: 10,
  page: 0,
};

export default withStyles(styles)(LooTable);
