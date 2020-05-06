import L from 'leaflet';
import 'leaflet.locatecontrol';
import { MapControl, withLeaflet } from 'react-leaflet';

import styles from '../css/loo-map.module.css';

class LocateMapControl extends MapControl {
  createLeafletElement() {
    var control = L.control.locate({
      drawCircle: true,
      follow: true,
      keepCurrentZoomLevel: true,
      icon: styles.locate,
      iconLoading: styles.locate,
      showPopup: false,
      onLocationError: Function.prototype,
      onLocationOutsideMapBounds: Function.prototype,
    });

    return control;
  }
}

/** @component */
export default withLeaflet(LocateMapControl);
