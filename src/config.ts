export const FILTERS_KEY = 'filters';

type Filters =
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

type Filter = {
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

const messages = {
  created: 'Thank you, toilet added!',
  updated: 'Thank you, details updated!',
  removed: 'Thank you, toilet removed!',
};

const title = 'Toilet Map';

const config = {
  viewport: {
    mobile: 567,
  },
  filters,
  messages,
  initialZoom: 16,
  minZoom: 11,
  maxZoom: 18,
  editMinZoom: 16,
  fallbackLocation: {
    // Trafalgar Square. Because.
    lat: 51.507351,
    lng: -0.127758,
  },
  getSettings(namespace: string) {
    return JSON.parse(
      (typeof localStorage !== 'undefined' &&
        localStorage.getItem(namespace)) ||
        '{}'
    );
  },
  getSetting(namespace: string, key: string, defaultVal = '') {
    const val = this.getSettings(namespace)[key];

    return val === undefined ? defaultVal : val;
  },
  setSetting(namespace: string, key: string, val: string) {
    var settings = this.getSettings(namespace);
    settings[key] = val;
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
