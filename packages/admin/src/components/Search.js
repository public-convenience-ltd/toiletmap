import React, { Component } from 'react';
import settings from '../lib/settings';
import _ from 'lodash';
import queryString from 'query-string';

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
import SearchIcon from '@material-ui/icons/Search';
import MenuItem from '@material-ui/core/MenuItem';
import LooTile from './LooTile';

import { navigate } from '@reach/router';

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

class Search extends Component {
  constructor(props) {
    super(props);

    var defaults = {
      text: '',
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
    this.updateSearchParam = this.updateSearchParam.bind(this);
    this.updateSearchField = this.updateSearchField.bind(this);
  }

  componentDidMount() {
    this.doSearch(this.state.searchParams);
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

    result.All = _.uniq(_.flatten(_.values(result))).sort();

    this.setState({
      areas: result.All,
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
    await navigate(`/search?${query}`);
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

            <FormControl className={classes.formControl}>
              <Select
                id="area_name"
                className={classes.input}
                value={this.state.searchParams.area_name}
                onChange={_.partial(this.updateSearchField, 'area_name')}
                input={<Input name="area_name" id="area_name-helper" />}
              >
                <MenuItem value="" />
                {this.state.areas.map((item, i) => (
                  <MenuItem value={item} key={i + 1}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
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
                  Descending
                </MenuItem>
                <MenuItem value={'asc'} key={1}>
                  Ascending
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                id="from_date"
                label="From"
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
                label="To"
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
                      return <LooTile key={l._id} loo={l} />;
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
