import React, { Component } from 'react';
import settings from '../lib/settings';
import _ from 'lodash';
import deburr from 'lodash/deburr';
import queryString from 'query-string';
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
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import LooTile from './LooTile';
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import { Link, navigate } from '@reach/router';

const styles = {
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
};

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

    var defaults = {
      text: '',
      area_name: '',
      order: 'desc',
    };

    const parsedQuery = queryString.parse(this.props.location.search);
    this.state = {
      searching: false,
      searchParams: {
        ...defaults,
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

  /**
   *
   * Performs a search given the provided query object and attaches results to state.
   *
   * @param {*} q
   */
  async doSearch(q) {
    if (!_.isEmpty(q)) {
      this.setState({ searching: true });
      try {
        const res = await fetch(
          settings.getItem('apiUrl') + '/search?' + queryString.stringify(q)
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
    result.All = _.uniq(_.flatten(_.values(result)))
      .sort()
      .map(x => ({ label: x }));
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
    this.doSearch(omitEmpty);
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
        <Card className={classes.card}>
          <CardContent>
            <FormControl className={classes.formControl}>
              <TextField
                id="text"
                label="Search in all text fields"
                helperText="eg: tescos"
                name="text"
                value={this.state.searchParams.text}
                onChange={_.partial(this.updateSearchField, 'text')}
              />
            </FormControl>
            <FormControl>
              <Downshift
                id="area_name-search"
                onChange={_.partial(this.updateSearchParam, 'area_name')}
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
                              <RemoveCircle />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }),
                    })}
                    {isOpen ? (
                      <Paper className={classes.paper} square>
                        {this.getSuggestions(this.state.areas, inputValue).map(
                          (suggestion, index) =>
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

            <FormControl className={classes.formControl}>
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

            <FormControl>
              <Downshift
                id="attribution-search"
                onChange={_.partial(this.updateSearchParam, 'attributions')}
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
                              <RemoveCircle />
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
            <FormControl className={classes.formControl}>
              <TextField
                id="from_date"
                label="Updated After"
                type="date"
                defaultValue=""
                value={this.state.searchParams.from_date}
                onChange={_.partial(this.updateSearchField, 'from_date')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
              <TextField
                id="to_date"
                label="Updated Before"
                type="date"
                defaultValue=""
                value={this.state.searchParams.to_date}
                onChange={_.partial(this.updateSearchField, 'to_date')}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </FormControl>
            <FormControl className={classes.formControl}>
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
            </FormControl>
          </CardContent>
        </Card>

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
