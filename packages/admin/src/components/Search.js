import React, { Component } from 'react';
import settings from '../lib/settings';
import _ from 'lodash';
import queryString from 'query-string';

import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import GridList from '@material-ui/core/GridList';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
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
};

class Search extends Component {
  constructor(props) {
    super(props);

    var defaults = {
      text: '',
    };

    const parsedQuery = queryString.parse(this.props.location.search);

    this.state = {
      searching: false,
      searchParams: {
        ...defaults,
        ...parsedQuery,
      },
      areas: [],
    };

    this.submit = this.submit.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.fetchAreaData = this.fetchAreaData.bind(this);
    this.updateParam = this.updateParam.bind(this);
    this.updateField = this.updateField.bind(this);
    this.updateSearchParamsFromQuery = this.updateSearchParamsFromQuery.bind(
      this
    );
  }

  async doSearch(q) {
    if (!_.isEmpty(q)) {
      this.setState({ searching: true });
      const res = await fetch(
        settings.getItem('apiUrl') + '/search?' + queryString.stringify(q)
      );
      const results = await res.json();
      this.setState({ results, searching: false });
    }
  }

  async fetchAreaData() {
    //gets list of areas and area Types to use in the area dropdowns
    const searchUrl = settings.getItem('apiUrl') + '/admin_geo/areas';
    const response = await fetch(searchUrl);
    const result = await response.json();

    result.All = _.uniq(_.flatten(_.values(result))).sort();

    this.setState({
      areas: result.All,
    });
  }

  componentDidMount() {
    this.doSearch(this.state.searchParams);
    this.fetchAreaData();
  }

  async submit() {
    const omitEmpty = _.pickBy(this.state.searchParams);
    const query = queryString.stringify(omitEmpty);

    await navigate(`/search?${query}`);

    // Update the search state now we have navigated.
    this.updateSearchParamsFromQuery();

    this.doSearch(omitEmpty);
  }

  updateSearchParamsFromQuery() {
    const parsedQuery = queryString.parse(this.props.location.search);
    this.setState({
      ...this.state,
      searchParams: {
        ...parsedQuery,
      },
    });
  }

  updateField(key, evt) {
    this.updateParam(key, evt.target.value);
  }

  updateParam(key, val) {
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
        <Card>
          <CardContent>
            <TextField
              id="text"
              label="Search in all text fields"
              helperText="eg: tescos"
              name="text"
              value={this.state.searchParams.text}
              onChange={_.partial(this.updateField, 'text')}
            />

            <Select
              value={this.state.searchParams.area_name || ''}
              onChange={_.partial(this.updateField, 'area_name')}
              input={<Input name="area_name" id="area-helper" />}
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              {this.state.areas.map((item, i) => (
                <MenuItem value={item} key={i}>
                  {item}
                </MenuItem>
              ))}
            </Select>

            <Toolbar>
              <Button
                variant="contained"
                color="primary"
                onClick={this.submit}
                disabled={this.state.searching}
              >
                Search
              </Button>
            </Toolbar>
          </CardContent>
        </Card>

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
      </div>
    );
  }
}

export default withStyles(styles)(Search);
