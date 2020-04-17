import React, { Component } from 'react';
import propTypes from 'prop-types';
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

const styles = (theme) => ({
  looTile: {
    width: '100%',
    height: 300,
  },
});

class LooTile extends Component {
  constructor(props) {
    super(props);

    this.state = {
      location: [props.lat, props.lng],
    };
  }

  render() {
    const { lat, lng, className, mapProps, classes } = this.props;
    return (
      <div className={classNames(className) || classes.looTile}>
        <Map
          center={[lat, lng]}
          zoomControl={false}
          contributorControl={false}
          dragging={false}
          touchZoom={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoom={12}
          {...mapProps}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            contributor='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={[lat, lng]} />
        </Map>
      </div>
    );
  }
}

LooTile.propTypes = {
  lat: propTypes.number.isRequired,
  lng: propTypes.number.isRequired,
};

export default withStyles(styles)(LooTile);
