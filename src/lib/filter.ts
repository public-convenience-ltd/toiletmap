import { Loo } from '../@types/resolvers-types';

export type Filters =
  | 'noPayment'
  | 'babyChange'
  | 'accessible'
  | 'allGender'
  | 'radar'
  | 'automatic';

export type Filter = {
  id: Filters;
  label: string;
};

export enum FILTER_TYPE {
  NO_PAYMENT = 0b00000001,
  ALL_GENDER = 0b00000010,
  AUTOMATIC = 0b00000100,
  ACCESSIBLE = 0b00001000,
  BABY_CHNG = 0b00010000,
  RADAR = 0b00100000,
}

export const genLooFilterBitmask = (loo: Loo) => {
  const {
    noPayment = 0,
    allGender = 0,
    automatic = 0,
    accessible = 0,
    babyChange = 0,
    radar = 0,
  } = loo;

  const noPaymentValue = noPayment ? FILTER_TYPE.NO_PAYMENT : 0;
  const allGenderValue = allGender ? FILTER_TYPE.ALL_GENDER : 0;
  const automaticValue = automatic ? FILTER_TYPE.AUTOMATIC : 0;
  const accessibleValue = accessible ? FILTER_TYPE.ACCESSIBLE : 0;
  const babyChangeValue = babyChange ? FILTER_TYPE.BABY_CHNG : 0;
  const radarValue = radar ? FILTER_TYPE.RADAR : 0;

  return (
    noPaymentValue |
    allGenderValue |
    automaticValue |
    accessibleValue |
    babyChangeValue |
    radarValue
  );
};

export const getAppliedFiltersAsFilterTypes = (filters: Filter[]) => {
  return filters.reduce((p, c) => {
    switch (c.id) {
      case 'accessible':
        p.push(FILTER_TYPE.ACCESSIBLE);
        break;
      case 'allGender':
        p.push(FILTER_TYPE.ALL_GENDER);
        break;
      case 'automatic':
        p.push(FILTER_TYPE.AUTOMATIC);
        break;
      case 'babyChange':
        p.push(FILTER_TYPE.BABY_CHNG);
        break;
      case 'noPayment':
        p.push(FILTER_TYPE.NO_PAYMENT);
        break;
      case 'radar':
        p.push(FILTER_TYPE.RADAR);
        break;
    }
    return p;
  }, [] as Array<FILTER_TYPE>);
};

