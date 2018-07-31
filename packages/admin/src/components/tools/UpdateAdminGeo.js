import React, { Component } from 'react';
import settings from '../../lib/settings';
import _ from 'lodash';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
  ToolbarTitle,
} from 'material-ui/Toolbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import LinearProgress from 'material-ui/LinearProgress';
import Toggle from 'material-ui/Toggle';

class UpdateAdminGeo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      throttle: 2000,
      limit: 10,
      force: false,
      running: false,
      total: null,
      completed: null,
    };

    this.fetchIndex = this.fetchIndex.bind(this);
    this.processList = this.processList.bind(this);
  }

  start = () => {
    this.setState({
      running: true,
    });
    this.fetchIndex().then(this.processList);
  };

  fetchIndex() {
    var url = settings.getItem('apiUrl') + '/loos';
    if (this.state.force) {
      url += '?missing=properties.area';
    }
    return fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        return _.map(json.features, '_id');
      });
  }

  processList(data) {
    let looList = data;
    if (this.state.limit) {
      looList = _.sampleSize(looList, this.state.limit);
    }
    this.setState({
      total: looList.length,
      completed: 0,
    });
    let intervalTimer = setInterval(() => {
      if (looList.length) {
        let looId = looList.shift();
        this.processLoo(looId).then(() => {
          this.setState({
            completed: this.state.completed + 1,
          });
        });
      } else {
        clearInterval(intervalTimer);
        this.setState({
          running: false,
          total: null,
          completed: null,
          looList: null,
          intervalTimer: null,
        });
      }
    }, this.state.throttle);

    this.setState({
      looList,
      intervalTimer,
    });
  }

  processLoo(looId) {
    let url = settings.getItem('apiUrl');
    url += `/loos/${looId}/updateArea`;
    return fetch(url);
  }

  setLimit = (event, index, value) => {
    this.setState({
      limit: value,
    });
  };

  setForce = (event, value) => {
    console.log(value);
    this.setState({
      force: value,
    });
  };

  render() {
    return (
      <Card>
        <CardHeader
          title="Administrative Geography Recalculator"
          subtitle="Useful if boundaries change"
        />

        <CardText>
          This tool will collect a list of all of the loos without known area
          information and work through them, sending their coordinates to the
          MapIt service to discover which UK administrative regions apply to
          them.
        </CardText>

        <CardText>
          <div style={{ width: '10%' }}>
            <Toggle
              onToggle={this.setForce}
              label="Force update"
              labelPosition="right"
            />
          </div>
          <em>
            Overwite any existing area information with newly fetched values.
          </em>

          <div>
            <SelectField
              value={this.state.limit}
              onChange={this.setLimit}
              floatingLabelText="Limit updates"
              floatingLabelFixed={true}
            >
              <MenuItem value={10} primaryText="10" />
              <MenuItem value={100} primaryText="100" />
              <MenuItem value={1000} primaryText="1000" />
              <MenuItem value={2000} primaryText="2000" />
              <MenuItem value={200000} primaryText="No Limit" />
            </SelectField>
          </div>

          <p>
            <em>Restrict the number of loos to update in this invocation.</em>
          </p>
          <p>
            <strong>WARNING</strong>
            <em>
              {' '}
              a full run can take many hours and might irritate mysociety, who
              maintain the MapIt service.
            </em>
          </p>
        </CardText>
        {this.state.running &&
          !this.state.total && <LinearProgress mode="indeterminate" />}
        {this.state.running &&
          this.state.total && (
            <LinearProgress
              mode="determinate"
              max={this.state.total}
              min={0}
              value={this.state.completed}
            />
          )}
        <Toolbar>
          <ToolbarGroup />
          <ToolbarGroup lastChild={true}>
            {this.state.running &&
              !this.state.total && <ToolbarTitle text="Fetching worklist" />}
            {this.state.running &&
              this.state.total && (
                <ToolbarTitle
                  text={`Completed: ${this.state.completed}/${
                    this.state.total
                  }`}
                />
              )}
            <ToolbarSeparator />
            <RaisedButton
              label="Start"
              labelPosition="before"
              primary={true}
              onClick={this.start}
              disabled={this.state.running}
            />
          </ToolbarGroup>
        </Toolbar>
      </Card>
    );
  }
}

export default UpdateAdminGeo;
