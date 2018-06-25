import React, { Component } from 'react';
import Papa from 'papaparse';
import OSPoint from 'ospoint';
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
import LinearProgress from 'material-ui/LinearProgress';
import SelectField from 'material-ui/SelectField';
import TextField from 'material-ui/TextField';
import MenuItem from 'material-ui/MenuItem';

const defaultDataURI =
  'http://aggregator.opendata.esd.org.uk/api/schemaData?schema=http%3a%2f%2fschemas.opendata.esd.org.uk%2fPublicToilets&page=1';
const toTriState = function(val) {
  if (val === true) {
    return 'true';
  }
  if (val === false) {
    return 'false';
  }
  if (_.isString(val)) {
    if (_.includes(['yes', 'true'], val.toLowerCase())) {
      return 'true';
    }
    if (_.includes(['no', 'false'], val.toLowerCase())) {
      return 'false';
    }
  }
  return 'Not Known';
};
const toLCString = function(val) {
  if (!val) {
    return null;
  }
  return val.toString().toLowerCase();
};
const toFee = function(val) {
  if (val === 0) {
    return 'Free';
  }
  if (!val) {
    return null;
  }
  return '£' + val.toString();
};

const propertyMap = {
  babychange: ['babyChange', toTriState],
  familytoilet: ['familyToilet', toTriState],
  changingplace: ['changingPlace', toTriState],
  automaticpublicconvenience: ['automatic', toTriState],
  fulltimestaffing: ['attended', toTriState],
  accessiblecategory: ['accessibleType', toLCString],
  category: ['type', toLCString],
  radarkeyneeded: ['radar', toTriState],
  chargeamount: ['fee', toFee],
  openinghours: ['notes'],
  infourl: ['infoUrl'],
  reporttel: ['reportPhone'],
  reportemail: ['reportEmail'],
  postcode: ['postcode'],
  managedby: ['operator'],
  streetaddress: ['streetAddress', _.capitalize],
};

const extractGeometry = function(source) {
  var coords;
  if (source.coordinatereferencesystem.toLowerCase() === 'osgb36') {
    // NO! Not National Grid
    var point = new OSPoint(source.geoy.toString(), source.geox.toString());
    var wgs84 = point.toWGS84();
    coords = [wgs84.latitude, wgs84.longitude];
  } else {
    coords = [source.geox, source.geoy];
  }
  // Simple check for transposed coords
  if (coords[0] > coords[1]) {
    // probably someone got this the wrong way round - unless this is being used to import data from
    // the southern hemisphere
    coords.reverse();
  }
  return {
    type: 'Point',
    coordinates: coords,
  };
};

class LgaImporter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      throttle: 2000,
      limit: 10,
      running: false,
      total: null,
      completed: null,
      sourceData: null,
      dataURI: props.dataURI || defaultDataURI,
      token: settings.getItem('apiToken') || '',
    };

    this.start = this.start.bind(this);
    this.setSourceData = this.setSourceData.bind(this);
    this.processData = this.processData.bind(this);
    this.submitReport = this.submitReport.bind(this);
    this.setLimit = this.setLimit.bind(this);
    this.transformItem = this.transformItem.bind(this);
  }

  start() {
    this.setState({ running: true });
    this.processData(this.state.sourceData);
  }

  setSourceData(evt) {
    var file = evt.target.files[0];
    Papa.parse(file, {
      skipEmptyLines: true,
      preview: this.state.limit,
      dynamicTyping: true,
      header: true,
      complete: data => {
        this.setState({ sourceData: data });
        console.log(data);
      },
      error: error => {
        this.setState({ sourceError: error });
        console.log(error);
      },
    });
  }

  transformItem(source) {
    var p = new Promise((resolve, reject) => {
      var geometry = extractGeometry(source);

      var properties = _.transform(
        source,
        function(result, value, key, obj) {
          if (propertyMap[key]) {
            let [newKey, transformer] = propertyMap[key];
            result[newKey] = transformer ? transformer(value) : value;
          }
        },
        {}
      );

      resolve({
        attribution: source.organisationlabel,
        origin:
          'http://aggregator.opendata.esd.org.uk/api/schemaData?schema=http%3a%2f%2fschemas.opendata.esd.org.uk%2fPublicToilets&page=1',
        type: 'Feature',
        geometry,
        properties,
      });
    });
    return p;
  }

  processData(data) {
    let items = data.data;
    if (this.state.limit) {
      items = _.sampleSize(items, this.state.limit);
    }
    this.setState({
      total: items.length,
      completed: 0,
    });
    let intervalTimer = setInterval(() => {
      if (items.length) {
        let item = items.shift();
        this.transformItem(item)
          .then(report => {
            return this.submitReport(report);
          })
          .then(() => {
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
          items: null,
          intervalTimer: null,
        });
      }
    }, this.state.throttle);

    this.setState({
      items,
      intervalTimer,
    });
  }

  submitReport(data) {
    var headers = new Headers();
    headers.append('Authorization', 'Bearer ' + this.state.token);
    headers.append('Content-Type', 'application/json');
    var url = settings.getItem('apiUrl') + '/admin/ingest';
    var request = new Request(url, {
      headers: headers,
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(data),
    });
    return fetch(request).catch(error => {
      console.log(error, data);
    });
  }

  setLimit = (event, index, value) => {
    this.setState({
      limit: value,
    });
  };

  setToken = (event, value) => {
    this.setState({ token: value });
  };

  render() {
    return (
      <Card>
        <CardHeader
          title="LGA Importer"
          subtitle="Import Loo data from the Local Government Association"
        />

        <CardText>
          This tool will collect and parse a csv of data from the LGA and
          create/update LooReports accordingly
        </CardText>

        <CardText>
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
            <em>
              Restrict the number of reports to ingest in this invocation.
            </em>
          </p>
        </CardText>

        <CardText>
          <TextField
            onChange={this.setToken}
            value={this.state.token}
            floatingLabelText="API Token"
            hintText="Ask Neontribe for a token"
          />
          <p>
            <em>
              This alters the database and requires authorization via an API
              token
            </em>
          </p>
        </CardText>

        <CardText>
          <input type="file" id="csv" onChange={this.setSourceData} />
          <p>
            <em>
              Supply a CSV file such as the one you can obtain from the{' '}
              <a
                href={this.state.dataURI}
                target="_blank"
                rel="noopener noreferrer"
              >
                Local Government Association
              </a>
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
              !this.state.total && <ToolbarTitle text="Fetching Source Data" />}
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
              disabled={
                this.state.running ||
                !this.state.sourceData ||
                !this.state.token
              }
            />
          </ToolbarGroup>
        </Toolbar>
      </Card>
    );
  }
}

export default LgaImporter;
