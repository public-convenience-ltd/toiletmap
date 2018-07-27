import { definitions } from '@neontribe/opening-hours';

export const PREFERENCES_KEY = 'preferences';
export const PENDING_REPORT_KEY = 'pending_loo_report';
export const PENDING_REMOVE_KEY = 'pending_loo_removal';

export default {
  viewport: {
    mobile: 567,
  },
  apiEndpoint: '/api',
  analyticsId:
    process.env === 'production' ? 'UA-52513593-1' : 'UA-111111111-1',
  nearestRadius: 50000, // meters
  nearestListLimit: 5,
  initialZoom: 16,
  minZoom: 12,
  maxZoom: 18,
  allowAddEditLoo: true,
  showBackButtons: false,
  looProps: {
    canHumanize: [
      'accessibleType',
      'attended',
      'babyChange',
      'automatic',
      'radar',
    ],
    definitions: {
      opening: definitions,
      type: [
        {
          name: 'Female',
          value: 'female',
        },
        {
          name: 'Male',
          value: 'male',
        },
        {
          name: 'Female and Male',
          value: 'female and male',
        },
        {
          name: 'Unisex',
          value: 'unisex',
        },
        {
          name: 'Male Urinal',
          value: 'male urinal',
        },
        {
          name: 'Children Only',
          value: 'children only',
        },
        {
          name: 'None',
          value: 'none',
        },
      ],
      access: [
        {
          name: 'Public',
          value: 'public',
        },
        {
          name: 'Non-customers permitted',
          value: 'permissive',
        },
        {
          name: 'Customers only',
          value: 'customers only',
        },
      ],
    },
  },
};
