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

    this.state = {
      searching: false,
      searchParams: {
        ...defaults,
        ...(props.location.state && props.location.state.query),
      },
      areas: [],
    };

    this.submit = this.submit.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.fetchAreaData = this.fetchAreaData.bind(this);
    this.updateParam = this.updateParam.bind(this);
    this.updateField = this.updateField.bind(this);
    this.paginate = this.paginate.bind(this);
  }

  doSearch(query) {
    var q =
      query || (this.props.location.state && this.props.location.state.query);
    if (!_.isEmpty(q)) {
      this.setState({ searching: true });
      fetch(settings.getItem('apiUrl') + '/search?' + queryString.stringify(q))
        .then(response => {
          return response.json();
        })
        .then(results => {
          this.setState({
            results,
            searching: false,
          });
        });
    }
  }

  fetchAreaData() {
    //gets list of areas and area Types to use in the area dropdowns
    var searchUrl = settings.getItem('apiUrl') + '/admin_geo/areas';
    fetch(searchUrl)
      .then(response => {
        return response.json();
      })
      .then(result => {
        result.All = _.uniq(_.flatten(_.values(result))).sort();
        _.each(result, v => v.unshift('All'));
        this.setState({
          areas: result.All,
        });
      });
  }

  componentDidMount() {
    this.doSearch();
    this.fetchAreaData();
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (
      !_.isEqual(props.location.state.query, this.props.location.state.query)
    ) {
      this.doSearch(props.location.state.query);
    }
  }

  submit() {
    navigate(this.props.location.pathname, {
      state: {
        query: {
          text: this.state.searchParams.text,
        },
      },
    });
  }

  updateField(key, evt) {
    this.updateParam(key, evt.target.value);
  }

  updateParam(key, val) {
    var searchParams = Object.assign({}, this.state.searchParams, {
      [key]: val,
    });
    if (!val || val === 'All') {
      delete searchParams[key];
    }
    this.setState({
      searchParams,
    });
  }

  paginate(inc) {
    var searchParams = Object.assign({}, this.state.searchParams);
    searchParams.page = (parseInt(searchParams.page, 10) + inc).toString();
    this.setState({ searchParams });
    navigate(this.props.location.pathname, {
      state: {
        query: searchParams,
      },
    });
  }

  render() {
    const { classes } = this.props;
    // var advancedOpen = _.without(_.keys(this.state.searchParams), 'text', 'limit', 'page').length > 0;
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

            <Toolbar>
              {/* <ToolbarGroup>
                          {this.state.results &&
                              <div>
                                  <FlatButton label="previous" disabled={this.state.results.page === '1'} onTouchTap={_.partial(this.paginate, -1)}/>
                                  <ToolbarTitle text={`Page ${this.state.results.page} of ${this.state.results.pages}`} />
                                  <FlatButton label="next" disabled={this.state.results.page === this.state.results.pages.toString()} onTouchTap={_.partial(this.paginate, 1)}/>
                              </div>
                          }

                      </ToolbarGroup> */}

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

          {/* <CardHeader actAsExpander={true} showExpandableButton={true} title="Advanced Options"/>
                  <CardText expandable={true}>
                      <div style={{width: '15%', display: 'inline-block'}}>
                          <Toggle
                              onToggle={_.partial(this.updateField, 'active')}
                              toggled={!!this.state.searchParams.active}
                              label="Active" labelPosition="right"/>
                      </div>
                      <div style={{width: '15%', display: 'inline-block'}}>
                          <Toggle
                              onToggle={_.partial(this.updateField, 'babyChange')}
                              toggled={!!this.state.searchParams.babyChange}
                              label="Baby Changing" labelPosition="right"/>
                      </div>
                      <div style={{width: '15%', display: 'inline-block'}}>
                          <Toggle
                              onToggle={_.partial(this.updateField, 'radar')}
                              toggled={!!this.state.searchParams.radar}
                              label="Radar Key" labelPosition="right"/>
                      </div>
                      <div style={{width: '15%', display: 'inline-block'}}>
                          <Toggle
                              onToggle={_.partial(this.updateField, 'emptylist_area')}
                              toggled={!!this.state.searchParams.emptylist_area}
                              label="Missing Area info" labelPosition="right"/>
                      </div>
                  </CardText> */}

          {/* <CardText expandable={true}>
                      <AutoComplete
                          id="area"
                          floatingLabelText="Administrative Area"
                          hintText="eg: North Norfolk District Council"
                          openOnFocus={true}
                          filter={AutoComplete.fuzzyFilter}
                          dataSource={this.state.areas}
                          onNewRequest={_.partial(this.updateParam, 'area_name')}
                          searchText={this.state.searchParams.area_name || ''}
                        />
                    <span>&nbsp;</span>
                    <TextField
                          floatingLabelText="Search in name field"
                          hintText="eg: tesco"
                          name="text_notes"
                          value={this.state.searchParams.text_name || ''}
                          onChange={_.partial(this.updateField, 'text_name')}/>
                    <span>&nbsp;</span>
                    <TextField
                          floatingLabelText="Search in notes field"
                          hintText="eg: collapsing"
                          name="text_notes"
                          value={this.state.searchParams.text_notes || ''}
                          onChange={_.partial(this.updateField, 'text_notes')}/>
                  </CardText> */}
        </Card>

        {this.state.results &&
          this.state.results.docs && (
            <div className={classes.gridRoot}>
              <GridList className={classes.gridList} cellHeight={180}>
                {this.state.results.docs.map(l => {
                  return <LooTile key={l._id} loo={l} />;
                  //return (<h3>{l._id}</h3>);
                })}
              </GridList>
              {/* <Card>
                          <Toolbar>
                              <ToolbarGroup>
                                  <div>
                                      <FlatButton label="previous" disabled={this.state.results.page === '1'} onTouchTap={_.partial(this.paginate, -1)}/>
                                      <ToolbarTitle text={`Page ${this.state.results.page} of ${this.state.results.pages}`} />
                                      <FlatButton label="next" disabled={this.state.results.page === this.state.results.pages.toString()} onTouchTap={_.partial(this.paginate, 1)}/>
                                  </div>
                              </ToolbarGroup>
                          </Toolbar>
                        </Card> */}
            </div>
          )}
      </div>
    );
  }
}

export default withStyles(styles)(Search);
