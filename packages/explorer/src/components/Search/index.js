import React, { Component } from 'react';
import { Link, navigate } from '@reach/router';
import classNames from 'classnames';
import _ from 'lodash';
import queryString from 'query-string';
import TimeAgo from 'timeago-react';
import { Query } from 'react-apollo';
import { loader } from 'graphql.macro';

// Local
import { createStyled } from '../../lib/utils.js';
import LooTable from '../table/LooTable';
import LooTablePaginationActions from '../table/LooTablePaginationActions';
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

const SEARCH_QUERY = loader('./search.graphql');
const CONTRIBUTORS = loader('./getContributors.graphql');
const AREAS_QUERY = loader('./getAreas.graphql');

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

const renderTableRows = ({ data }) => {
  const MISSING_MESSAGE = 'Not Recorded';
  return (
    <Styled>
      {({ classes }) => (
        <>
          {data.loos.map(loo => {
            const contributors = loo.reports.reduce((current, next) => {
              current.push(next.contributor);
              return current;
            }, []);
            const { name, type, opening, area } = loo;

            return (
              <React.Fragment key={loo.id}>
                <TableRow className={classes.row}>
                  <TableCell component="th" scope="row">
                    <Link className={classes.link} to={`../loos/${loo.id}`}>
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
                      label={
                        type
                          ? _.startCase(_.toLower(type.replace(/_/g, ' ')))
                          : MISSING_MESSAGE
                      }
                      color={type ? 'primary' : 'secondary'}
                      variant="default"
                      clickable
                    />
                  </TableCell>

                  <TableCell className={classes.textList}>
                    {_.uniq(contributors).map((attr, i) => {
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
                      label={
                        <TimeAgo datetime={loo.updatedAt} /> || MISSING_MESSAGE
                      }
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
      <TableCell>Contributors</TableCell>
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
        count={data.total || data.loos.length || 0}
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
      order: 'NEWEST_FIRST',
      to_date: '',
      from_date: '',
      contributors: '',
      area_name: '',
      page: 1,
      limit: 10,
    };

    const parsedQuery = queryString.parse(this.props.location.search);
    const pageCheck = parseInt(parsedQuery.page)
      ? parsedQuery.page
      : this.searchDefaults.page;
    this.state = {
      expanded: false,
      searchParams: {
        ...this.searchDefaults,
        // Apply values from query string.
        ...parsedQuery,
        // Apply checked page value.
        page: pageCheck,
      },
    };

    // Submit new search with potentially modified search state.
    this.submitSearch();

    this.submitSearch = this.submitSearch.bind(this);
    this.updateSearchParam = this.updateSearchParam.bind(this);
    this.updateSearchField = this.updateSearchField.bind(this);
    this.handleChangePage = this.handleChangePage.bind(this);
    this.handleChangeRowsPerPage = this.handleChangeRowsPerPage.bind(this);
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
      this.setState({
        searchParams: {
          ...this.searchDefaults,
          ...parsedQuery,
        },
      });
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

  /**
   * Takes a date string and returns a date object or, if the string is empty, null
   *
   * @param {string} dateString
   */
  parseDate(dateString) {
    return dateString ? new Date(dateString) : null;
  }

  /**
   * Gets the GraphQL query variables
   */
  get queryVariables() {
    let fromDate = this.parseDate(this.state.searchParams.from_date);
    let toDate = this.parseDate(this.state.searchParams.to_date);

    let variables = {
      rows: parseInt(this.state.searchParams.limit),
      page: parseInt(this.state.searchParams.page),
      text: this.state.searchParams.text,
      order: this.state.searchParams.order,
      areaName: this.state.searchParams.area_name,
      fromDate,
      toDate,
      contributor: this.state.searchParams.contributors,
    };

    return variables;
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
                  <MenuItem value={'NEWEST_FIRST'} key={0}>
                    Newest First
                  </MenuItem>
                  <MenuItem value={'OLDEST_FIRST'} key={1}>
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
                        <Query query={AREAS_QUERY}>
                          {({ loading, error, data }) => {
                            if (error) {
                              console.error(error);
                            }

                            // Suggestions take an array of {label: name} objects, so we need to map
                            // the data to this format
                            let areas = [];
                            if (!loading && data) {
                              areas = data.areas.map(area => {
                                return {
                                  label: area.name,
                                };
                              });
                            }

                            return (
                              <SearchAutocomplete
                                id="area_name-search"
                                onChange={_.partial(
                                  this.updateSearchParam,
                                  'area_name'
                                )}
                                selectedItem={this.state.searchParams.area_name}
                                suggestions={areas}
                                placeholderText="Search Areas"
                                ariaLabel="Clear area input box"
                              />
                            );
                          }}
                        </Query>
                      </FormControl>
                    </Grid>
                    {this.props.auth.checkPermission(
                      'VIEW_CONTRIBUTOR_INFO'
                    ) && (
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <Query query={CONTRIBUTORS}>
                            {({ loading, error, data }) => {
                              if (loading) return null;
                              if (error) {
                                console.error(error);
                                return null;
                              }

                              // Re-map contributors for search autocomplete
                              let contributors = data.contributors.map(
                                contributor => ({ label: contributor.name })
                              );

                              return (
                                <SearchAutocomplete
                                  id="contributor-search"
                                  onChange={_.partial(
                                    this.updateSearchParam,
                                    'contributors'
                                  )}
                                  selectedItem={
                                    this.state.searchParams.contributors
                                  }
                                  suggestions={contributors}
                                  placeholderText="Search Contributors"
                                  ariaLabel="Clear contributor input box"
                                />
                              );
                            }}
                          </Query>
                        </FormControl>
                      </Grid>
                    )}

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
            >
              <SearchIcon className={classes.rightIcon} />
              Search
            </RaisedButton>
          </div>
        </div>
        <Query query={SEARCH_QUERY} variables={this.queryVariables}>
          {({ loading, error, data }) => {
            if (loading) return <h1>Loading...</h1>;
            if (error) return <h1>Error fetching search data: {error}</h1>;

            return (
              <LooTable
                data={data.loos}
                rowRender={renderTableRows}
                colRender={renderTableCol}
                footerRender={renderTableFooter}
                page={Math.max(0, this.state.searchParams.page - 1)}
                rowsPerPage={parseInt(this.state.searchParams.limit)}
                handleChangePage={this.handleChangePage}
                handleChangeRowsPerPage={this.handleChangeRowsPerPage}
              />
            );
          }}
        </Query>
      </div>
    );
  }
}

export default withStyles(styles)(Search);
