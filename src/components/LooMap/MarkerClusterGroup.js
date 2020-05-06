import L from 'leaflet';
import { MapLayer, withLeaflet } from 'react-leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';

const MarkerClusterGroup = withLeaflet(
  class MarkerClusterGroup extends MapLayer {
    createLeafletElement({ children, leaflet, ...props }) {
      const clusterProps = {};
      const clusterEvents = {};

      // Split props and events
      Object.entries(props).forEach(([propName, prop]) =>
        propName.startsWith('on')
          ? (clusterEvents[propName] = prop)
          : (clusterProps[propName] = prop)
      );

      // Create markerClusterGroup Leaflet element
      const markerClusterGroup = new L.markerClusterGroup(clusterProps);

      this.contextValue = {
        layerContainer: markerClusterGroup,
        map: leaflet.map,
      };

      // Initialize event listeners
      Object.entries(clusterEvents).forEach(([eventAsProp, callback]) => {
        const clusterEvent = `cluster${eventAsProp.substring(2).toLowerCase()}`;
        markerClusterGroup.on(clusterEvent, callback);
      });

      return markerClusterGroup;
    }
  }
);

/** @component */
export default MarkerClusterGroup;
