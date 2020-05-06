import L from 'leaflet';

import styles from '../css/loo-map.module.css';

const LooIcon = L.DivIcon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    highlight: false,
    looId: null,
    html: '',
  },

  initialize: function (options) {
    this.options = {
      ...this.options,
      className: options.highlight ? styles.markerHighlighted : '',
      html: `
        <div data-testid="looMarker:${options.looId}">
          ${
            options.label
              ? `<div class="${styles.markerLabel}">${options.label}</div>`
              : ''
          }
          <svg viewBox="0 0 337 478" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <path 
              fill="#000000" 
              fill-rule="nonzero" 
              d="M168.556,0 C75.816,0.106 0.662,75.26 0.556,168 C0.556,258.056 155.62,460.32 162.22,468.88 L168.556,477.112 L174.892,468.88 C181.492,460.32 336.556,258.056 336.556,168 C336.45,75.26 261.296,0.106 168.556,0 Z" 
            />
          </svg>
        </div>
      `,
    };

    L.Util.setOptions(this, options);
  },
});

/** @component */
export default LooIcon;
