import React from 'react';
import { shallow } from 'enzyme';
// import renderer from 'react-test-renderer';

import LooListItem from '../components/LooListItem';
import LooMap from '../components/map/LooMap';
import PreferenceIndicators from '../components/PreferenceIndicators';

import loos from './fixtures/loos.json';

jest.mock('leaflet');

describe('LooListItem', () => {
  var component;
  var loo = loos[0];

  beforeEach(() => {
    component = <LooListItem loo={loo} />;
  });

  // Causing test fail where `LooListItem` renders `LooMap` which is Redux-aware
  // Jest snapshot
  // it('renders snapshot', () => {
  //  var tree = renderer.create(component).toJSON();

  //  expect(tree).toMatchSnapshot();
  // });

  it('renders correctly', () => {
    var mounted = shallow(component);

    expect(mounted.find(LooMap).length).toBe(1);
    expect(mounted.find(PreferenceIndicators).length).toBe(1);
    expect(
      mounted.containsMatchingElement(<div>{Math.round(loo.distance)}m</div>)
    ).toEqual(true);
  });
});
