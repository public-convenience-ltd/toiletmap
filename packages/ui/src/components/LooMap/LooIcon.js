import L from 'leaflet';

import styles from '../css/loo-map.module.css';

import markerIcon from '../../images/marker-icon.png';
import markerIconRetina from '../../images/marker-icon-2x.png';
import markerIconHighlight from '../../images/marker-icon-highlight.png';
import markerIconRetinaHighlight from '../../images/marker-icon-highlight-2x.png';

const LooIcon = L.Icon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    highlight: false,
    looId: null,
  },

  initialize: function (options) {
    if (options.highlight) {
      // Add highlight properties
      this.options = {
        ...this.options,
        iconUrl: markerIconHighlight,
        iconRetinaUrl: markerIconRetinaHighlight,
        className: styles.markerHighlighted,
      };
    } else {
      this.options = {
        ...this.options,
        iconUrl: markerIcon,
        iconRetinaUrl: markerIconRetina,
      };
    }

    L.Util.setOptions(this, options);
  },

  createIcon: function () {
    // do we need to be complex to show an index, or are we just a dumb image
    if (!this.options.label) {
      var img = this._createImg(this._getIconUrl('icon'));
      this._setIconStyles(img, 'icon');
      img.setAttribute('data-testid', 'looMarker:' + this.options.looId);
      return img;
    }

    // make the parent with the image
    var grouper = document.createElement('div');
    grouper.style.background = `url('${this._getIconUrl('icon')}')`;
    grouper.style.backgroundSize = '100% 100%';
    grouper.setAttribute('data-testid', 'looMarker:' + this.options.looId);
    this._setIconStyles(grouper, 'icon');

    // make an index label
    var label = document.createElement('div');
    label.setAttribute('class', styles.index);
    label.innerHTML = this.options.label;
    grouper.appendChild(label);

    return grouper;
  },
});

export default LooIcon;
