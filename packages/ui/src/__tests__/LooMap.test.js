import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import {
  LooMap,
  GeolocationMapControl,
  LocateMapControl,
} from '../components/map/LooMap';

import loos from './fixtures/loos.json';

jest.mock('leaflet');

describe('LooMap', () => {
  var defaultProps = {
    loos,
    initialPosition: {
      lat: 1.292708,
      lng: 52.6369559,
    },
  };

  // Jest snapshot
  it('renders snapshot', () => {
    var tree = renderer.create(<LooMap {...defaultProps} />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  // Todo: Test mounted component to ensure `leafletElement` properties are set correctly.

  describe('Controls: ', () => {
    it('render', () => {
      var component = shallow(
        <LooMap
          {...defaultProps}
          showSearchControl={true}
          showLocateControl={true}
        />
      );

      expect(component.find(GeolocationMapControl).length).toBe(1);
      expect(component.find(LocateMapControl).length).toBe(1);
    });

    it('hide', () => {
      var component = shallow(
        <LooMap
          {...defaultProps}
          showSearchControl={false}
          showLocateControl={false}
        />
      );

      expect(component.find(GeolocationMapControl).length).toBe(0);
      expect(component.find(LocateMapControl).length).toBe(0);
    });
  });
});
