import React, { Component } from 'react';
import propTypes from 'prop-types';
import settings from '../lib/settings';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import { Map, Marker, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

const styles = theme => ({
  looTile: {
    width: '100%',
    height: 300,
  },
});

class LooTile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      link: settings.getItem('apiUrl') + '/loos/' + props.loo._id,
      location: [
        props.loo.geometry.coordinates[1],
        props.loo.geometry.coordinates[0],
      ],
    };
  }

  render() {
    const { className, mapProps, classes } = this.props;
    return (
      <div className={classNames(className) || classes.looTile}>
        <Map
          center={this.state.location}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          touchZoom={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoom={12}
          {...mapProps}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <Marker position={this.state.location} />
        </Map>
      </div>
    );
  }
}

LooTile.propTypes = {
  loo: propTypes.object.isRequired,
};

export default withStyles(styles)(LooTile);
