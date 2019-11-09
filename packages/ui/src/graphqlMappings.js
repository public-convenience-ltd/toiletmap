import { definitions } from '@toiletmap/opening-hours';

const facilitiesMappings = [
  {
    name: 'Female',
    value: 'FEMALE',
  },
  {
    name: 'Male',
    value: 'MALE',
  },
  {
    name: 'Female and Male',
    value: 'FEMALE_AND_MALE',
  },
  {
    name: 'Unisex',
    value: 'UNISEX',
  },
  {
    name: 'Male Urinal',
    value: 'MALE_URINAL',
  },
  {
    name: 'Children Only',
    value: 'CHILDREN',
  },
  {
    name: 'None',
    value: 'NONE',
  },
];

export default {
  looProps: {
    canHumanize: ['attended', 'babyChange', 'automatic', 'radar', 'fee'],
    definitions: {
      opening: definitions,
      type: facilitiesMappings,
      accessibleType: facilitiesMappings,
      access: [
        {
          name: 'Public',
          value: 'PUBLIC',
        },
        {
          name: 'Non-customers permitted',
          value: 'PERMISSIVE',
        },
        {
          name: 'Customers only',
          value: 'CUSTOMERS_ONLY',
        },
        {
          name: 'Private',
          value: 'PRIVATE',
        },
      ],
    },
  },
  humanizePropertyValue(val, property) {
    if (this.looProps.definitions[property]) {
      // We may use a human readable definition of this property value
      let override = this.looProps.definitions[property].find(
        s => s.value === val
      );
      if (override) {
        return override.name;
      }
    }

    if (this.looProps.canHumanize.includes(property)) {
      // We can humanize this kind of property to make it more human-readable
      return this.humanizeAPIValue(val, property);
    }

    // This was likely entered as human-readable, leave it be
    return val;
  },
  humanizeAPIValue(val, property) {
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

    console.log(property, val);
    // Pricing - use weak type coercian to interpret values like '0'
    // eslint-disable-next-line eqeqeq
    if (property === 'fee' && val == 0 && val !== '') {
      val = 'Free';
    }

    return val;
  },
};
