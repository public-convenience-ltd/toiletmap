import L from 'leaflet';

const ICON_DIMENSIONS: [number, number] = [22, 34];
const LARGE_ICON_DIMENSIONS: [number, number] = ICON_DIMENSIONS.map(
  (i) => i * 1.5,
) as [number, number];

const getIconAnchor = (dimensions: [number, number]): [number, number] => [
  dimensions[0] / 2,
  dimensions[1],
];

interface GetSVGHTMLParams {
  isHighlighted?: boolean;
}

const getSVGHTML = ({ isHighlighted = false }: GetSVGHTMLParams): string => {
  return `
    <svg viewBox="-1 -1 21 33" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C4.47632 0 0 4.47529 0 10C0 19.5501 10 32 10 32C10 32 20 19.5501 20 10C20 4.47529 15.5237 0 10 0Z" fill="#ED3D63" stroke="white"/>
      ${
        isHighlighted
          ? '<path d="M10 4L11.7634 7.57295L15.7063 8.1459L12.8532 10.9271L13.5267 14.8541L10 13L6.47329 14.8541L7.14683 10.9271L4.29366 8.1459L8.23664 7.57295L10 4Z" fill="white"/>'
          : '<circle cx="10" cy="10" r="5" fill="white"/>'
      }
    </svg>
  `;
};

interface ToiletMarkerIconParams {
  isHighlighted?: boolean;
  toiletId?: string;
}

interface ToiletMarkerIconOptions extends L.DivIconOptions {
  highlight?: boolean;
  toiletId?: string;
}

class ToiletMarkerDivIcon extends L.DivIcon {
  options: ToiletMarkerIconOptions;

  constructor({ isHighlighted = false, toiletId }: ToiletMarkerIconParams) {
    super();

    // Merge custom options with default DivIcon options
    this.options = {
      ...this.options,
      highlight: isHighlighted,
      toiletId,
      iconSize: isHighlighted ? LARGE_ICON_DIMENSIONS : ICON_DIMENSIONS,
      iconAnchor: getIconAnchor(
        isHighlighted ? LARGE_ICON_DIMENSIONS : ICON_DIMENSIONS,
      ),
      html: `
        <div data-toiletid="${toiletId ?? ''}" class="toilet-marker" ${
          isHighlighted ? 'id="highlighted-loo"' : ''
        }>
          ${getSVGHTML({ isHighlighted })}
        </div>
      `,
    };

    L.Util.setOptions(this, { toiletId, isHighlighted });
  }
}

const ToiletMarkerIcon = (params: ToiletMarkerIconParams): L.DivIcon => {
  return new ToiletMarkerDivIcon(params);
};

export default ToiletMarkerIcon;
