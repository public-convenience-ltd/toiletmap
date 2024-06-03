import type { JsonValue, paintRules } from 'protomaps-leaflet';

type Theme = Parameters<typeof paintRules>[0];

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

  roads_label_minor: '#778',
  roads_label_minor_halo: '#e0e0e0',
  roads_label_major: '#556',
  roads_label_major_halo: '#fff',
  ocean_label: '#7a7a7a',
  peak_label: '#5c5c5c',
  subplace_label: '#7a7a7a',
  subplace_label_halo: '#fff',
  city_circle: '#c2c2c2',
  city_circle_stroke: '#7a7a7a',
  city_label: '#474747',
  city_label_halo: '#fff',
  state_label: '#999999',
  state_label_halo: '#cccccc',
  country_label: '#858585',
} satisfies Theme;

export function getString(
  props: Record<string, JsonValue>,
  key: string,
): string {
  const val = props[key];
  return typeof val === 'string' ? val : '';
}

export function getNumber(
  props: Record<string, JsonValue>,
  key: string,
): number {
  const val = props[key];
  return typeof val === 'number' ? val : 0;
}
