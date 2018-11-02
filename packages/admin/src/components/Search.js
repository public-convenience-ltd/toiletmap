import React, { Component } from 'react';
import { Link, navigate } from '@reach/router';
import classNames from 'classnames';
import _ from 'lodash';
import queryString from 'query-string';
import timeago from 'timeago.js';

// Local
import api from '@toiletmap/api-client';
import { createStyled } from '../lib/utils.js';
import LooTable from './table/LooTable';
import LooTablePaginationActions from './table/LooTablePaginationActions';
import SearchAutocomplete from './SearchAutocomplete';

// MUI Core
import RaisedButton from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Chip from '@material-ui/core/Chip';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Avatar from '@material-ui/core/Avatar';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

// MUI Icons
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SearchIcon from '@material-ui/icons/Search';
import PeopleIcon from '@material-ui/icons/People';
import NameIcon from '@material-ui/icons/TextFields';
import CityIcon from '@material-ui/icons/LocationCity';
import ClockIcon from '@material-ui/icons/AccessTime';

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

const Styled = createStyled(theme => ({
  textList: {
    whiteSpace: 'pre-line',
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
    height: '5em',
  },
  link: {
    textDecoration: 'none',
  },
  chip: {
    marginTop: theme.spacing.unit * 0.2,
    marginBottom: theme.spacing.unit * 0.2,
    marginLeft: theme.spacing.unit * 0.2,
  },
  chipDetail: {
    verticalAlign: 'bottom',
    marginTop: theme.spacing.unit * 0.2,
    marginBottom: theme.spacing.unit * 0.2,
    marginLeft: theme.spacing.unit * 0.2,
  },
}));

const renderTableRows = props => {
  const MISSING_MESSAGE = 'Not Recorded';
  const { data } = props;
  return (
    <Styled>
      {({ classes }) => (
        <>
          {data.docs.map(loo => {
            const { contributors } = loo;
            const { name, type, opening, area } = loo.properties;
            return (
              <React.Fragment key={loo._id}>
                <TableRow className={classes.row}>
                  <TableCell component="th" scope="row">
                    <Link className={classes.link} to={`../loos/${loo._id}`}>
                      <Chip
                        avatar={
                          <Avatar>
                            <NameIcon />
                          </Avatar>
                        }
                        className={classes.chip}
                        label={name || MISSING_MESSAGE}
                        color={name ? 'primary' : 'secondary'}
                        variant="default"
                        clickable
                      />
                    </Link>
                  </TableCell>
                  <TableCell>
                    {area.map(val => {
                      return (
                        <React.Fragment key={val.name}>
                          <Chip
                            className={classes.chip}
                            avatar={
                              <Avatar>
                                <CityIcon />
                              </Avatar>
                            }
                            label={val.name}
                            color={val.name ? 'primary' : 'secondary'}
                            variant="default"
                            onClick={e => {
                              navigate(`search?area_name=${val.name}`);
                            }}
                            clickable
                          />
                          <Chip
                            className={classes.chipDetail}
                            label={val.type}
                            color={val.type ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                        </React.Fragment>
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      className={classes.chip}
                      avatar={
                        <Avatar>
                          <PeopleIcon />
                        </Avatar>
                      }
                      label={type || MISSING_MESSAGE}
                      color={type ? 'primary' : 'secondary'}
                      variant="default"
                      clickable
                    />
                  </TableCell>
                  <TableCell className={classes.textList}>
                    {contributors.map((attr, i) => {
                      return (
                        <Chip
                          key={attr + i}
                          className={classes.chip}
                          avatar={
                            <Avatar>
                              <PeopleIcon />
                            </Avatar>
                          }
                          label={attr || MISSING_MESSAGE}
                          color={attr ? 'primary' : 'secondary'}
                          variant="default"
                          onClick={event => {
                            navigate(`search?contributors=${attr}`);
                          }}
                          clickable
                        />
                      );
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      avatar={
                        <Avatar>
                          <ClockIcon />
                        </Avatar>
                      }
                      label={timeago().format(loo.updatedAt) || MISSING_MESSAGE}
                      color={loo.updatedAt ? 'primary' : 'secondary'}
                      variant="default"
                      onClick={event => {
                        const dateUpdated = new Date(loo.updatedAt);
                        const year = dateUpdated.getFullYear();
                        const month = (
                          '0' +
                          (dateUpdated.getMonth() + 1)
                        ).slice(-2);
                        const day = ('0' + dateUpdated.getDate()).slice(-2);
                        const updateString = `${year}-${month}-${day}`;
                        navigate(`search?from_date=${updateString}`);
                      }}
                      clickable
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      className={classes.chipDetail}
                      label={opening || MISSING_MESSAGE}
                      color={opening ? 'primary' : 'secondary'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </>
      )}
    </Styled>
  );
};

const renderTableCol = () => {
  return (
    <TableRow>
      <TableCell>Name</TableCell>
      <TableCell>Area</TableCell>
      <TableCell>Type</TableCell>
      <TableCell>contributors</TableCell>
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
        count={data.total || data.docs.count || 0}
        rowsPerPage={rowsPerPage}
        page={parseInt(page, 10)}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
        ActionsComponent={LooTablePaginationActions}
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
      contributors: '',
      area_name: '',
      page: 1,
      limit: 5,
    };

    const parsedQuery = queryString.parse(this.props.location.search);
    const pageCheck = parseInt(parsedQuery.page)
      ? parsedQuery.page
      : this.searchDefaults.page;
    this.state = {
      searching: false,
      expanded: false,
      searchParams: {
        ...this.searchDefaults,
        // Apply values from query string.
        ...parsedQuery,
        // Apply checked page value.
        page: pageCheck,
      },
      areas: [],
      contributors: [],
    };

    // Submit new search with potentially modified search state.
    this.submitSearch();

    this.submitSearch = this.submitSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.fetchAreaData = this.fetchAreaData.bind(this);
    this.fetchContributorData = this.fetchContributorData.bind(this);
    this.updateSearchParam = this.updateSearchParam.bind(this);
    this.updateSearchField = this.updateSearchField.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
  }

  /**
   * Fetches essential data upon loading the search route.
   */
  componentDidMount() {
    this.doSearch(this.state.searchParams);
    this.fetchContributorData();
    this.fetchAreaData();
  }

  /**
   *
   * Ensures that, if the search query changes the state is updated and a new search executed.
   *
   * @param {*} prevProps
   */
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
        this.doSearch.bind(this)
      );
    }
  }

  /**
   * Getter for the search query string - strips empty fields.
   */
  get queryString() {
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
    await navigate(`search?${this.queryString}`);
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
        const results = await api.searchLoos(_.pickBy(q));
        this.setState({ results });
      } catch (err) {
        console.error(err);
      } finally {
        this.setState({ searching: false });
      }
    }
  }

  /**
   * Pagination page change handler.
   */
  async handleChangePage(event, page) {
    await this.setState(prevState => ({
      searchParams: {
        ...prevState.searchParams,
        page: page + 1,
      },
    }));
    this.submitSearch();
  }

  /**
   *
   * Pagination rows change handler.
   *
   * @param {*} event
   */
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
    const result = await api.fetchAreaData();
    result.All = _.uniq(_.flatten(_.values(result))).map(x => ({ label: x }));
    this.setState({
      areas: result.All,
    });
  }

  /**
   * Fetches a list of contributors and attaches to state.
   */
  async fetchContributorData() {
    const result = await api.fetchContributors();
    const contributors = Object.keys(result).map(x => ({ label: x }));
    this.setState({
      contributors: contributors,
    });
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
      'contributors',
      'from_date',
      'to_date',
    ];
    return (
      advancedParams.some(
        advancedParam => this.state.searchParams[advancedParam]
      ) || this.state.expanded
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
              <ExpansionPanel expanded={this.advancedSearch}>
                <ExpansionPanelSummary
                  onClick={e =>
                    this.setState({ expanded: !this.state.expanded })
                  }
                  expandIcon={<ExpandMoreIcon />}
                >
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
                          id="contributor-search"
                          onChange={_.partial(
                            this.updateSearchParam,
                            'contributors'
                          )}
                          selectedItem={this.state.searchParams.contributors}
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
              page={Math.max(0, this.state.searchParams.page - 1)}
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
