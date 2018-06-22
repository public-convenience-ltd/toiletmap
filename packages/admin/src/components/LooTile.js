import React, { Component } from 'react';
import propTypes from 'prop-types';
import settings from '../lib/settings';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
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
    return (
      <GridListTile style={{ width: '33.3%' }}>
        <Map
          center={this.state.location}
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          touchZoom={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          zoom={12}
        >
          <TileLayer
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          <Marker position={this.state.location} />
        </Map>
        <GridListTileBar title={this.props.loo.properties.name || 'Unnamed'} />
      </GridListTile>
    );
  }
}

LooTile.propTypes = {
  loo: propTypes.object.isRequired,
};

export default LooTile;
