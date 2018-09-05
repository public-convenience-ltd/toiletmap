import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import { TableFooter } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

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

const LooTableWrapped = withStyles(styles, { withTheme: true })(LooTable);

const actionsStyles = theme => ({
  root: {
    flexShrink: 0,
    color: theme.palette.text.secondary,
    marginLeft: theme.spacing.unit * 2.5,
  },
});

class TablePaginationActions extends React.Component {
  handleFirstPageButtonClick = event => {
    this.props.onChangePage(event, 0);
  };

  handleBackButtonClick = event => {
    this.props.onChangePage(event, this.props.page - 1);
  };

  handleNextButtonClick = event => {
    this.props.onChangePage(event, this.props.page + 1);
  };

  handleLastPageButtonClick = event => {
    this.props.onChangePage(
      event,
      Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1)
    );
  };

  render() {
    const { classes, count, page, rowsPerPage, theme } = this.props;

    return (
      <div className={classes.root}>
        <IconButton
          onClick={this.handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="First Page"
        >
          {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={this.handleBackButtonClick}
          disabled={page === 0}
          aria-label="Previous Page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Next Page"
        >
          {theme.direction === 'rtl' ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={this.handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="Last Page"
        >
          {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </div>
    );
  }
}

TablePaginationActions.propTypes = {
  classes: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired,
};

const TablePaginationActionsWrapped = withStyles(actionsStyles, {
  withTheme: true,
})(TablePaginationActions);

export { LooTableWrapped as LooTable, TablePaginationActionsWrapped };
