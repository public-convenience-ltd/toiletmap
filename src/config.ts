export const FILTERS_KEY = 'filters';

export type Filters =
  | 'noPayment'
  | 'babyChange'
  | 'accessible'
  | 'allGender'
  | 'radar'
  | 'automatic';

type FilterLabels =
  | 'Free'
  | 'Baby Changing'
  | 'Accessible'
  | 'Gender Neutral'
  | 'Radar Key'
  | 'Automatic';

export type Filter = {
  id: Filters;
  label: FilterLabels;
};

const filters: Array<Filter> = [
  {
    id: 'noPayment',
    label: 'Free',
  },
  {
    id: 'babyChange',
    label: 'Baby Changing',
  },
  {
    id: 'accessible',
    label: 'Accessible',
  },
  {
    id: 'allGender',
    label: 'Gender Neutral',
  },
  {
    id: 'radar',
    label: 'Radar Key',
  },
  {
    id: 'automatic',
    label: 'Automatic',
  },
];

export const alertMessages = {
  created: 'Thank you, toilet added!',
  updated: 'Thank you, details updated!',
  removed: 'Thank you, toilet removed!',
  auth_needed:
    'There was a problem checking your authentication. Please try and sign in again.',
  generic_error: 'Uh oh! We encountered a problem, please try again soon.',
} as const;

const title = 'Toilet Map';

const config = {
  viewport: {
    mobile: 567,
  },
  filters,
  alertMessages,
  initialZoom: 16,
  minZoom: 11,
  maxZoom: 18,
  editMinZoom: 5,
  fallbackLocation: {
    // Trafalgar Square. Because.
    lat: 51.507351,
    lng: -0.127758,
  },
  getSettings(namespace: string) {
    try {
      return JSON.parse(
        (typeof localStorage !== 'undefined' &&
          localStorage.getItem(namespace)) ||
          '{}'
      );
    } catch (e) {
      console.warn('Problem parsing JSON setting from local storage: ', e);
      return null;
    }
  },
  getSetting(namespace: string, key: string, defaultVal = '') {
    const val = this.getSettings(namespace)[key];

    return val === undefined ? defaultVal : val;
  },
  setSetting(namespace: string, key: string, val: string) {
    const settings = { ...this.getSettings(namespace), [key]: val };
    localStorage.setItem(namespace, JSON.stringify(settings));
  },
  setSettings(namespace: string, obj = {}) {
    localStorage.setItem(
      namespace,
      JSON.stringify({
        ...this.getSettings(namespace),
        ...obj,
      })
    );
  },
  getTitle(appendText: string) {
    if (appendText) {
      return `${title}: ${appendText}`;
    }

    return title;
  },
};

export default config;
