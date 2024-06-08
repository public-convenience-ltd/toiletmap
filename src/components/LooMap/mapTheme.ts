import {
  CenteredTextSymbolizer,
  CircleSymbolizer,
  GroupSymbolizer,
  Justify,
  LineSymbolizer,
  OffsetTextSymbolizer,
  PaintRule,
  TextPlacements,
  labelRules as baseLabelRules,
  paintRules as basePaintRules,
  type JsonValue,
  type LabelRule,
} from 'protomaps-leaflet';

type Theme = Parameters<typeof basePaintRules>[0];

/**
 * Adapted from [`light`](https://github.com/protomaps/protomaps-leaflet/blob/fc1b260bcbfe37aede11c866a4ea39e23b5ad099/src/default_style/themes.ts#L91)
 */
export const mapTheme = {
  background: '#eee',
  earth: '#efefef',
  park_a: '#cfddd5',
  park_b: '#bbf3cc',
  hospital: '#e4dad9',
  industrial: '#d1dde1',
  school: '#e4ded7',
  wood_a: '#bbf3cc',
  wood_b: '#bbf3cc',
  pedestrian: '#fff2d5',
  scrub_a: '#cedcd7',
  scrub_b: '#bbf3cc',
  glacier: '#e7e7e7',
  sand: '#e2e0d7',
  beach: '#e8e4d0',
  aerodrome: '#dadbdf',
  runway: '#e9e9ed',
  water: '#80deea',
  pier: '#e0e0e0',
  zoo: '#c6dcdc',
  military: '#dcdcdc',

  tunnel_other_casing: '#e0e0e0',
  tunnel_minor_casing: '#e0e0e0',
  tunnel_link_casing: '#e0e0e0',
  tunnel_medium_casing: '#e0e0e0',
  tunnel_major_casing: '#e0e0e0',
  tunnel_highway_casing: '#e0e0e0',
  tunnel_other: '#d5d5d5',
  tunnel_minor: '#d5d5d5',
  tunnel_link: '#d5d5d5',
  tunnel_medium: '#d5d5d5',
  tunnel_major: '#d5d5d5',
  tunnel_highway: '#d5d5d5',

  transit_pier: '#e0e0e0',
  buildings: '#ccd',

  minor_service_casing: '#e0e0e0',
  minor_casing: '#e0e0e0',
  link_casing: '#e0e0e0',
  medium_casing: '#e0e0e0',
  major_casing_late: '#e0e0e0',
  highway_casing_late: '#e0e0e0',
  other: '#ebebeb',
  minor_service: '#ebebeb',
  minor_a: '#ebebeb',
  minor_b: '#bbc',
  link: '#bbc',
  medium: '#f5f5f5',
  major_casing_early: '#e0e0e0',
  major: '#bbc',
  highway_casing_early: '#e0e0e0',
  highway: '#bbc',

  railway: '#a7b1b3',
  boundaries: '#adadad',
  waterway_label: '#ffffff',

  bridges_other_casing: '#e0e0e0',
  bridges_minor_casing: '#e0e0e0',
  bridges_link_casing: '#e0e0e0',
  bridges_medium_casing: '#e0e0e0',
  bridges_major_casing: '#e0e0e0',
  bridges_highway_casing: '#e0e0e0',
  bridges_other: '#ebebeb',
  bridges_minor: '#ffffff',
  bridges_link: '#ffffff',
  bridges_medium: '#f0eded',
  bridges_major: '#f5f5f5',
  bridges_highway: '#ffffff',

  roads_label_minor: '#669',
  roads_label_minor_halo: '#e6e6e6',
  roads_label_major: '#556',
  roads_label_major_halo: '#eee',
  ocean_label: '#7a7a7a',
  peak_label: '#5c5c5c',
  subplace_label: '#7a7a7a',
  subplace_label_halo: '#fff',
  city_circle: '#c2c2c2',
  city_circle_stroke: '#7a7a7a',
  city_label: '#474747',
  city_label_halo: '#e9e9f3',
  state_label: '#999999',
  state_label_halo: '#cccccc',
  country_label: '#858585',
} satisfies Theme;

const font = 'Open Sans, sans-serif';

export const paintRules: PaintRule[] = [
  ...basePaintRules(mapTheme),
  {
    dataLayer: 'roads',
    symbolizer: new LineSymbolizer({
      color: '#bbc',
    }),
    filter: (z, f) => {
      const kind = getString(f.props, 'pmap:kind');
      return kind === 'park';
    },
  },
];

export const labelRules: LabelRule[] = [
  {
    // railway stations
    dataLayer: 'pois',
    symbolizer: new GroupSymbolizer([
      new CircleSymbolizer({
        fill: '#0a165e',
        stroke: '#f4f4f4',
        radius: 6,
        width: 1,
      }),
      new CircleSymbolizer({
        fill: '#f4f4f4',
        radius: 3,
      }),
      new OffsetTextSymbolizer({
        labelProps: ['name', 'railway'],
        fill: '#0a165e',
        stroke: '#f4f4f4',
        width: 1.5,
        lineHeight: 1,
        font: `500 14px ${font}`,
        offsetX: 8,
        placements: [TextPlacements.E],
        justify: Justify.Left,
      }),
    ]),
    filter: (z, { props }) => !!props['railway'],
  },
  ...baseLabelRules(mapTheme).slice(0, -2), // remove the default “places_locality” rule
  {
    dataLayer: 'places',
    minzoom: 9,
    symbolizer: new CenteredTextSymbolizer({
      labelProps: ['name'],
      fill: mapTheme.city_label,
      stroke: mapTheme.city_label_halo,
      width: 2,
      textTransform: (z) => (z > 12 ? 'uppercase' : undefined),
      letterSpacing: (z) => (z > 12 ? 1 : undefined),
      lineHeight: 1.5,
      font: (z, f) => {
        if (!f) return `400 12px ${font}`;
        const minZoom = getNumber(f.props, 'pmap:min_zoom');
        let weight = 400;
        if (minZoom && minZoom <= 5) {
          weight = 600;
        }
        let size = 12;
        const popRank = getNumber(f.props, 'pmap:population_rank');
        if (popRank && popRank > 9) {
          size = 16;
        }
        return `${weight} ${size}px ${font}`;
      },
    }),
    sort: (a, b) => {
      const aRank = getNumber(a, 'pmap:population_rank');
      const bRank = getNumber(b, 'pmap:population_rank');
      return aRank - bRank;
    },
    filter: (z, { props }) => {
      return props['pmap:kind'] === 'locality';
    },
  },
  {
    dataLayer: 'pois',
    symbolizer: new GroupSymbolizer([
      new CircleSymbolizer({
        fill: '#0a165e',
        stroke: '#f4f4f4',
      }),
      new OffsetTextSymbolizer({
        labelProps: ['name'],
        fill: '#0a165e',
        stroke: '#f4f4f4',
        width: 1,
        lineHeight: 0.875,
        font: `400 12px ${font}`,
        offsetY: 4,
        placements: [TextPlacements.S],
        justify: Justify.Center,
      }),
    ]),
    filter: (_, { props }) =>
      [
        'attraction',
        'landmark',
        'memorial',
        'social_facility',
        'supermarket',
      ].includes(getString(props, 'pmap:kind')),
  },
  {
    dataLayer: 'pois',
    symbolizer: new CenteredTextSymbolizer({
      labelProps: ['name'],
      fill: '#669',
      stroke: '#eee',
      width: 2,
      lineHeight: 1,
      font: `bold 12px ${font}`,
    }),
    filter: (z, { props }) => {
      if (z < 18) return false;
      return [
        'aerodrome',
        'amusement_ride',
        'animal',
        'art',
        'artwork',
        'atm',
        'attraction',
        'atv',
        'bakery',
        'beauty',
        'bench',
        'bicycle_rental',
        'books',
        'bureau_de_change',
        'bus_stop',
        'butcher',
        'cafe',
        'car',
        'carousel',
        'cemetery',
        'chalet',
        'childcare',
        'clinic',
        'clothes',
        'college',
        'computer',
        'convenience',
        'dentist',
        'doctors',
        'drinking_water',
        'emergency_phone',
        'fashion',
        'firepit',
        'florist',
        'fuel',
        'garden_centre',
        'gift',
        'greengrocer',
        'grocery',
        'hairdresser',
        'hanami',
        'hospital',
        'hostel',
        'hotel',
        'information',
        'karaoke',
        'library',
        'lottery',
        'marina',
        'military',
        'money_transfer',
        'national_park',
        'newsagent',
        'optician',
        'park',
        'parking',
        'pitch',
        'playground',
        'post_box',
        'post_office',
        'recycling',
        'roller_coaster',
        'sanitary_dump_station',
        'school',
        'shelter',
        'ship_chandler',
        'social_facility',
        'stadium',
        'studio',
        'supermarket',
        'swimming_area',
        'taxi',
        'telephone',
        'tobacco',
        'townhall',
        'trail_riding_station',
        'university',
        'viewpoint',
        'waste_basket',
        'waste_disposal',
        'water_point',
        'watering_place',
      ].includes(getString(props, 'pmap:kind'));
    },
  },
];

function getString(props: Record<string, JsonValue>, key: string): string {
  const val = props[key];
  return typeof val === 'string' ? val : '';
}

function getNumber(props: Record<string, JsonValue>, key: string): number {
  const val = props[key];
  return typeof val === 'number' ? val : 0;
}
