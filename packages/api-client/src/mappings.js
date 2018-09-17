import { definitions } from '@neontribe/opening-hours';

export default {
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
  humanizePropertyValue(val, property) {
    if (this.looProps.definitions[property]) {
      // We may a human readable definition of this property value
      let override = this.looProps.definitions[property].find(
        s => s.value === val
      );
      if (override) {
        return override.name;
      }
    }

    // Second condition is for an irregularity in our dataset; do this until we normalise better
    if (
      this.looProps.canHumanize.includes(property) ||
      (property === 'fee' && val === 'false')
    ) {
      // We can humanize this kind of property to make it more human-readable
      return this.humanizeAPIValue(val);
    }

    // This was likely entered as human-readable, leave it be
    return val;
  },
  humanizeAPIValue(val) {
    // Unknown
    if (val === undefined || val === null) {
      return 'Not known';
    }

    // Capitalise
    if (typeof val === 'string') {
      val = val
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
    }

    // Readable boolean
    if (
      typeof val === 'boolean' ||
      (typeof val === 'string' &&
        ['true', 'false'].indexOf(val.toLowerCase()) !== -1)
    ) {
      val = JSON.parse((val + '').toLowerCase()) ? 'Yes' : 'No';
    }

    // Pricing
    if (val === '0.00') {
      val = 'Free';
    }

    return val;
  },
};
