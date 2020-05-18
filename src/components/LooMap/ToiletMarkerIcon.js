import L from 'leaflet';

const ToiletMarkerIcon = L.DivIcon.extend({
  options: {
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    highlight: false,
    toiletId: null,
    html: '',
  },

  initialize: function (options) {
    this.options = {
      ...this.options,
      html: `
        <div data-testid="toiletMarker:${options.toiletId}">
          <svg viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.47632 0 0 4.47529 0 10C0 19.5501 10 32 10 32C10 32 20 19.5501 20 10C20 4.47529 15.5237 0 10 0Z" fill="#ED3D63" stroke="white"/>
            ${
              options.highlight
                ? '<path d="M10 4L11.7634 7.57295L15.7063 8.1459L12.8532 10.9271L13.5267 14.8541L10 13L6.47329 14.8541L7.14683 10.9271L4.29366 8.1459L8.23664 7.57295L10 4Z" fill="white"/>'
                : '<circle cx="10" cy="10" r="5" fill="white"/>'
            }
          </svg>
        </div>
      `,
    };

    L.Util.setOptions(this, options);
  },
});

export default ToiletMarkerIcon;
