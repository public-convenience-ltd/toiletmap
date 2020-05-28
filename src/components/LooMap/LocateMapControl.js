import React from 'react';
import L from 'leaflet';
import 'leaflet.locatecontrol';
import { MapControl, withLeaflet } from 'react-leaflet';
import { ClassNames } from '@emotion/core';

class LocateMapControl extends MapControl {
  createLeafletElement() {
    return L.control.locate({
      drawCircle: true,
      follow: true,
      keepCurrentZoomLevel: true,
      icon: this.props.className,
      iconLoading: this.props.className,
      showPopup: false,
      position: 'bottomright',
      onLocationError: Function.prototype,
      onLocationOutsideMapBounds: Function.prototype,
    });
  }
}

const LeafletControl = withLeaflet(LocateMapControl);

export default () => (
  <ClassNames>
    {({ css }) => (
      <LeafletControl
        className={css`
          display: block;
          height: 35px;
          width: 35px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E %3Cg fill='none' fill-rule='evenodd'%3E %3Cpath stroke='%230A165F' stroke-linecap='square' stroke-width='2' d='M20.5 10.5L20.5 5.5M11.5 19.5L6.5 19.5M20.5 29.5L20.5 33.5'/%3E %3Cg transform='translate(11 11)'%3E %3Ccircle cx='9' cy='9' r='8' fill='%23FFF' stroke='%230BB5FB' stroke-width='2'/%3E %3Ccircle cx='9' cy='9' r='4' fill='%230BB5FB'/%3E %3C/g%3E %3Cpath stroke='%230A165F' stroke-linecap='square' stroke-width='2' d='M29.5 19.5L33.5 19.5'/%3E %3C/g%3E %3C/svg%3E");
        `}
      />
    )}
  </ClassNames>
);
