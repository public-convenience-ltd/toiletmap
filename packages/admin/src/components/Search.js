import React, { Component } from 'react';
import settings from '../lib/settings';
import _ from 'lodash';
import queryString from 'query-string';
import classNames from 'classnames';
import { createStyled } from '../lib/utils.js';
import { withStyles } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import RaisedButton from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import { LooTable, TablePaginationActionsWrapped } from './LooTable';
import SearchAutocomplete from './SearchAutocomplete';

import { navigate, Link } from '@reach/router';

const styles = theme => ({
  gridRoot: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  gridList: {
    width: '100%',
    height: 500,
  },
  card: {
    margin: '1em',
  },
  input: {
    minWidth: '10em',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  searchForm: {
    marginTop: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    padding: theme.spacing.unit * 2,
    [theme.breakpoints.up(600 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 6,
      marginBottom: theme.spacing.unit * 6,
      padding: theme.spacing.unit * 3,
    },
  },
  button: {
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit,
  },
});

const Styled = createStyled({
  textList: {
    whiteSpace: 'pre-line',
  },
});

const renderTableRows = props => {
  const { data } = props;
  return (
    <>
      {data.docs.map(loo => {
        const { attributions } = loo;
        const { name, type, opening } = loo.properties;
        return (
          <TableRow key={loo._id}>
            <TableCell>
              <Link to={`../loos/${loo._id}`}>
                {name || 'No Name Recorded'}
              </Link>
            </TableCell>
            <TableCell>
              {loo.properties.area.map(val => {
                return (
                  <React.Fragment key={val._id}>
                    {val.name} / {val.type}
                  </React.Fragment>
                );
              })}
            </TableCell>
            <TableCell>{type}</TableCell>
            <Styled>
              {({ classes }) => (
                <TableCell className={classes.textList}>
                  {attributions.join('\n')}
                </TableCell>
              )}
            </Styled>
            <TableCell>{loo.updatedAt}</TableCell>
            <TableCell>{opening}</TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

const renderTableCol = () => {
  return (
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Area</TableCell>
      <TableCell>Type</TableCell>
      <TableCell>Attributions</TableCell>
      <TableCell>Date Updated</TableCell>
      <TableCell>Opening</TableCell>
    </TableRow>
  );
};

const renderTableFooter = props => {
  const {
    data,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
  } = props;
  return (
    <TableRow>
      <TablePagination
        colSpan={6}
        count={data.total || data.docs.count}
        rowsPerPage={rowsPerPage}
        page={parseInt(page, 10)}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActionsWrapped}
      />
    </TableRow>
  );
};

class Search extends Component {
  constructor(props) {
    super(props);

    this.searchDefaults = {
      text: '',
      order: 'desc',
      to_date: '',
      from_date: '',
      attributions: '',
      area_name: '',
      page: '0',
      limit: 5,
    };

    const parsedQuery = queryString.parse(this.props.location.search);
    this.state = {
      searching: false,
      searchParams: {
        ...this.searchDefaults,
        // Apply values from query string.
        ...parsedQuery,
      },
      areas: [],
      contributors: [],
    };

    this.submitSearch = this.submitSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.fetchAreaData = this.fetchAreaData.bind(this);
    this.fetchContributorData = this.fetchContributorData.bind(this);
    this.updateSearchParam = this.updateSearchParam.bind(this);
    this.updateSearchField = this.updateSearchField.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
    this.getQueryString = this.getQueryString.bind(this);
  }

  componentDidMount() {
    this.doSearch(this.state.searchParams);
    this.fetchContributorData();
    this.fetchAreaData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      const parsedQuery = queryString.parse(this.props.location.search);
      this.setState(
        {
          searchParams: {
            ...this.searchDefaults,
            ...parsedQuery,
          },
        },
        this.doSearch.bind(this, {
          ...this.state.searchParams,
          page: this.state.searchParams.page + 1,
        })
      );
    }
  }

  /**
   *
   * Performs a search given the provided query object and attaches results to state.
   *
   * @param {*} q
   */
  async doSearch(q = this.state.searchParams) {
    if (!_.isEmpty(q)) {
      this.setState({ searching: true });
      try {
        const res = await fetch(
          settings.getItem('apiUrl') +
            '/search?' +
            queryString.stringify(_.pickBy(q))
        );
        const results = await res.json();
        this.setState({ results });
      } catch (err) {
        console.error(err);
      } finally {
        this.setState({ searching: false });
      }
    }
  }

  async handleChangePage(event, page) {
    await this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        page: page,
      },
    }));
    this.submitSearch();
  }

  async handleChangeRowsPerPage(event) {
    await this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        limit: event.target.value,
      },
    }));
    this.submitSearch();
  }

  /**
   * Retreives a flattened list of Areas and Area Types and attaches to state.
   */
  async fetchAreaData() {
    const searchUrl = settings.getItem('apiUrl') + '/admin_geo/areas';
    const response = await fetch(searchUrl);
    const result = await response.json();
    result.All = _.uniq(_.flatten(_.values(result))).map(x => ({ label: x }));
    this.setState({
      areas: result.All,
    });
  }

  /**
   * Fetches a list of contributors and attaches to state.
   */
  async fetchContributorData() {
    const searchUrl = settings.getItem('apiUrl') + '/statistics/contributors';
    const response = await fetch(searchUrl);
    const result = await response.json();
    const contributors = Object.keys(result).map(x => ({ label: x }));
    this.setState({
      contributors: contributors,
    });
  }

  getQueryString() {
    const omitEmpty = _.pickBy(this.state.searchParams);

    // If everything is empty, ensure that we at least specify the `text` param.
    if (_.isEmpty(omitEmpty)) {
      omitEmpty.text = '';
    }

    const query = queryString.stringify(omitEmpty);
    return query;
  }

  /**
   * Navigates to updated query string and submits a search to the API.
   *
   * Omits any empty search parameters from the search.
   */
  async submitSearch() {
    const query = this.getQueryString();
    await navigate(`search?${query}`);
  }

  /**
   *
   * Helper to update specific fields with value of event.
   *
   * @param {*} key
   * @param {*} evt
   */
  updateSearchField(key, evt) {
    this.updateSearchParam(key, evt.target.value);
  }

  /**
   *
   * Update an individual entry in the search state.
   *
   * @param {*} key
   * @param {*} val
   */
  updateSearchParam(key, val) {
    var searchParams = {
      ...this.state.searchParams,
      [key]: val,
    };

    this.setState({
      searchParams,
    });
  }

  /**
   * Determines whether the user has conducted an advanced search.
   */
  get advancedSearch() {
    const advancedParams = [
      'area_name',
      'attributions',
      'from_date',
      'to_date',
    ];
    return advancedParams.some(
      advancedParam => this.state.searchParams[advancedParam]
    );
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={classNames(classes.paper, classes.searchForm)}>
          <Grid container spacing={24}>
            <Grid item xs={12} sm={7} md={9}>
              <FormControl className={classes.formControl} fullWidth>
                <TextField
                  id="text"
                  label="Search in all text fields"
                  name="text"
                  value={this.state.searchParams.text}
                  onChange={_.partial(this.updateSearchField, 'text')}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={5} md={3}>
              <FormControl className={classes.formControl} fullWidth>
                <InputLabel htmlFor="order">Search Order</InputLabel>
                <Select
                  id="order"
                  className={classes.input}
                  value={this.state.searchParams.order}
                  onChange={_.partial(this.updateSearchField, 'order')}
                  input={<Input name="order" id="order-helper" />}
                >
                  <MenuItem value={'desc'} key={0}>
                    Newest First
                  </MenuItem>
                  <MenuItem value={'asc'} key={1}>
                    Oldest First
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <ExpansionPanel defaultExpanded={this.advancedSearch}>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className={classes.heading}>
                    Advanced Options
                  </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                  <Grid container spacing={24}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <SearchAutocomplete
                          id="area_name-search"
                          onChange={_.partial(
                            this.updateSearchParam,
                            'area_name'
                          )}
                          selectedItem={this.state.searchParams.area_name}
                          suggestions={this.state.areas}
                          placeholderText="Search Areas"
                          ariaLabel="Clear area input box"
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <SearchAutocomplete
                          id="attribution-search"
                          onChange={_.partial(
                            this.updateSearchParam,
                            'attributions'
                          )}
                          selectedItem={this.state.searchParams.attributions}
                          suggestions={this.state.contributors}
                          placeholderText="Search Contributors"
                          ariaLabel="Clear contributor input box"
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl className={classes.formControl} fullWidth>
                        <TextField
                          id="from_date"
                          label="Updated After"
                          type="date"
                          value={this.state.searchParams.from_date}
                          onChange={_.partial(
                            this.updateSearchField,
                            'from_date'
                          )}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl className={classes.formControl} fullWidth>
                        <TextField
                          id="to_date"
                          label="Updated Before"
                          type="date"
                          value={this.state.searchParams.to_date}
                          onChange={_.partial(
                            this.updateSearchField,
                            'to_date'
                          )}
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </FormControl>
                    </Grid>
                  </Grid>
                </ExpansionPanelDetails>
              </ExpansionPanel>
            </Grid>
          </Grid>
          <div className={classes.buttons}>
            <RaisedButton
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={this.submitSearch}
              disabled={this.state.searching}
            >
              <SearchIcon className={classes.rightIcon} />
              Search
            </RaisedButton>
          </div>
        </div>

        {this.state.results &&
          this.state.results.docs && (
            <LooTable
              data={this.state.results}
              rowRender={renderTableRows}
              colRender={renderTableCol}
              footerRender={renderTableFooter}
              page={this.state.searchParams.page}
              rowsPerPage={parseInt(this.state.searchParams.limit)}
              handleChangePage={this.handleChangePage}
              handleChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
          )}
      </div>
    );
  }
}

export default withStyles(styles)(Search);
