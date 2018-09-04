import React, { Component } from 'react';
import settings from '../lib/settings';
import _ from 'lodash';
import deburr from 'lodash/deburr';
import queryString from 'query-string';
import classNames from 'classnames';
import Downshift from 'downshift';
import { withStyles } from '@material-ui/core/styles';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import GridList from '@material-ui/core/GridList';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import RaisedButton from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Typography from '@material-ui/core/Typography';
import LooTile from './LooTile';
import CloseOutlined from '@material-ui/icons/CloseOutlined';
import { Link, navigate } from '@reach/router';

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

function renderInput(inputProps) {
  const { InputProps, classes, ref, ...other } = inputProps;

  return (
    <TextField
      InputProps={{
        inputRef: ref,
        classes: {
          root: classes.inputRoot,
        },
        ...InputProps,
      }}
      {...other}
    />
  );
}

function renderSuggestion({
  suggestion,
  index,
  itemProps,
  highlightedIndex,
  selectedItem,
}) {
  const isHighlighted = highlightedIndex === index;
  const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

  return (
    <MenuItem
      {...itemProps}
      key={suggestion.label}
      selected={isHighlighted}
      component="div"
      style={{
        fontWeight: isSelected ? 500 : 400,
      }}
    >
      {suggestion.label}
    </MenuItem>
  );
}

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
    };

    this.submit = this.submit.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.fetchAreaData = this.fetchAreaData.bind(this);
    this.fetchContributorData = this.fetchContributorData.bind(this);
    this.updateSearchParam = this.updateSearchParam.bind(this);
    this.updateSearchField = this.updateSearchField.bind(this);
    this.getSuggestions = this.getSuggestions.bind(this);
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
        this.doSearch.bind(this)
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

  /**
   * Navigates to updated query string and submits a search to the API.
   *
   * Omits any empty search paramaters from the search.
   */
  async submit() {
    const omitEmpty = _.pickBy(this.state.searchParams);

    // If everything is empty, ensure that we at least specify the `text` param.
    if (_.isEmpty(omitEmpty)) {
      omitEmpty.text = '';
    }

    const query = queryString.stringify(omitEmpty);
    await navigate(`search?${query}`);
    this.doSearch();
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

  /**
   *
   * Returns an array of suggestions based upon an input string and provided array.
   *
   * @param {*} data
   * @param {*} value
   */
  getSuggestions(data, value) {
    const inputValue = deburr(value.trim()).toLowerCase();
    const inputLength = inputValue.length;
    let count = 0;

    return inputLength === 0
      ? []
      : data.filter(suggestion => {
          const keep =
            count < 5 &&
            suggestion.label.slice(0, inputLength).toLowerCase() === inputValue;

          if (keep) {
            count += 1;
          }

          return keep;
        });
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Paper className={classNames(classes.paper, classes.searchForm)}>
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
                        <Downshift
                          id="area_name-search"
                          onChange={_.partial(
                            this.updateSearchParam,
                            'area_name'
                          )}
                          selectedItem={this.state.searchParams.area_name}
                        >
                          {({
                            getInputProps,
                            getItemProps,
                            isOpen,
                            inputValue,
                            selectedItem,
                            highlightedIndex,
                            clearSelection,
                          }) => (
                            <div className={classes.container}>
                              {renderInput({
                                fullWidth: true,
                                classes,
                                InputProps: getInputProps({
                                  placeholder: 'Search Areas',
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="Clear area input box"
                                        onClick={clearSelection}
                                      >
                                        <CloseOutlined />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }),
                              })}
                              {isOpen ? (
                                <Paper className={classes.paper} square>
                                  {this.getSuggestions(
                                    this.state.areas,
                                    inputValue
                                  ).map((suggestion, index) =>
                                    renderSuggestion({
                                      suggestion,
                                      index,
                                      itemProps: getItemProps({
                                        item: suggestion.label,
                                      }),
                                      highlightedIndex,
                                      selectedItem,
                                    })
                                  )}
                                </Paper>
                              ) : null}
                            </div>
                          )}
                        </Downshift>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <Downshift
                          id="attribution-search"
                          onChange={_.partial(
                            this.updateSearchParam,
                            'attributions'
                          )}
                          selectedItem={this.state.searchParams.attributions}
                        >
                          {({
                            getInputProps,
                            getItemProps,
                            isOpen,
                            inputValue,
                            selectedItem,
                            highlightedIndex,
                            clearSelection,
                          }) => (
                            <div className={classes.container}>
                              {renderInput({
                                fullWidth: true,
                                classes,
                                InputProps: getInputProps({
                                  placeholder: 'Search Contributors',
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <IconButton
                                        aria-label="Clear contributor input box"
                                        onClick={clearSelection}
                                      >
                                        <CloseOutlined />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }),
                              })}
                              {isOpen ? (
                                <Paper className={classes.paper} square>
                                  {this.getSuggestions(
                                    this.state.contributors,
                                    inputValue
                                  ).map((suggestion, index) =>
                                    renderSuggestion({
                                      suggestion,
                                      index,
                                      itemProps: getItemProps({
                                        item: suggestion.label,
                                      }),
                                      highlightedIndex,
                                      selectedItem,
                                    })
                                  )}
                                </Paper>
                              ) : null}
                            </div>
                          )}
                        </Downshift>
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
              onClick={this.submit}
              disabled={this.state.searching}
            >
              <SearchIcon className={classes.rightIcon} />
              Search
            </RaisedButton>
          </div>
        </Paper>

        <Card className={classes.card}>
          <CardContent>
            {this.state.results &&
              this.state.results.docs && (
                <div className={classes.gridRoot}>
                  <GridList className={classes.gridList} cellHeight={180}>
                    {this.state.results.docs.map(l => {
                      return (
                        <GridListTile key={l._id} style={{ width: '33.3%' }}>
                          <LooTile loo={l} />
                          <Link to={`../loos/${l._id}`}>
                            <GridListTileBar
                              title={l.properties.name || 'Unnamed'}
                            />
                          </Link>
                        </GridListTile>
                      );
                    })}
                  </GridList>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

export default withStyles(styles)(Search);
