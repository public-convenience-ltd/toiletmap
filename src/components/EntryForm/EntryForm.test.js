import React from 'react';
import { render, fireEvent, act } from '../../utils/test-utils';

import EntryForm from './EntryForm';

const Main = () => <>Main</>;
const Map = () => <>Map</>;

const loo = {
  active: true,
  name: 'Trafalgar Square',
  access: 'PUBLIC',
  type: 'CHILDREN',
  accessibleType: 'FEMALE_AND_MALE',
  opening: 'Mo-Fr 09:00-17:00',
  notes: 'Baby-changing in male and female etc etc',
  fee: '50p',
  attended: true,
  babyChange: true,
  automatic: false,
  radar: null,
  id: '33b36a5e9862bad892e579ad',
  createdAt: '2016-09-14T15:30:57.555Z',
  updatedAt: '2020-05-01T16:57:07.294Z',
  location: {
    lat: 51.50844864450185,
    lng: -0.1285529136657715,
  },
  area: [
    {
      name: 'Westminster City Council',
      type: 'London borough',
    },
  ],
  removalReason: null,
};

const center = {
  lat: 51.50844864450185,
  lng: -0.1285529136657715,
};

const optionsMap = {
  opening: [
    {
      name: '24/7',
      value: '24/7',
    },
    {
      name: 'Business hours, Mon-Sun',
      value: '09:00-17:00',
    },
    {
      name: 'Business hours, Mon-Fri',
      value: 'Mo-Fr 09:00-17:00',
    },
    {
      name: 'Evening only',
      value: '17:00-00:00',
    },
    {
      name: 'Daylight hours only',
      value: '09:00-18:00',
    },
  ],
  type: [
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
  ],
  accessibleType: [
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
  ],
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
};

const questionnaireMap = [
  {
    question: 'Attended?',
    property: 'attended',
  },
  {
    question: 'Baby changing?',
    property: 'babyChange',
  },
  {
    question: 'Automatic?',
    property: 'automatic',
  },
  {
    question: 'Radar key?',
    property: 'radar',
  },
];

it('passes back location data on submit', async () => {
  const onSubmitSpy = jest.fn();

  const { getByText } = render(
    <EntryForm
      main={<Main />}
      map={<Map />}
      loo={loo}
      center={center}
      optionsMap={optionsMap}
      questionnaireMap={questionnaireMap}
      saveLoading={false}
      onSubmit={onSubmitSpy}
    >
      <input type="submit" value="Submit" />
    </EntryForm>
  );

  await act(async () => {
    fireEvent.click(getByText('Submit'));
  });

  await act(async () => {
    expect(onSubmitSpy).toHaveBeenCalledWith({
      location: center,
    });
  });
});
