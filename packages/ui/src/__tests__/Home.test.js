import React from 'react';
import { shallow } from 'enzyme';
import renderer from 'react-test-renderer';

import { HomePage } from '../components/page/HomePage';

import loos from './fixtures/loos.json';

jest.mock('leaflet');

describe('Map', () => {
  var component;
  var defaultProps;

  var actionFindNearbyRequest = jest.fn();
  var actionHighlight = jest.fn();
  var actionSignoutRequest = jest.fn();

  beforeEach(() => {
    defaultProps = {
      geolocation: {
        position: {
          lat: 1.292708,
          lng: 52.6369559,
        },
      },
      loos: loos,
      auth: {
        authenticated: false,
      },
      app: {
        viewMode: 'list',
      },
      actionFindNearbyRequest: actionFindNearbyRequest,
      actionHighlight: actionHighlight,
      actionSignoutRequest: actionSignoutRequest,
    };

    component = <HomePage {...defaultProps} />;
  });

  // Jest snapshot
  it('renders snapshot', () => {
    var tree = renderer.create(component).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('renders no results', () => {
    var mounted = shallow(<HomePage {...defaultProps} loos={[]} />);

    expect(mounted.contains(<p>No nearby loos found.</p>)).toEqual(true);
  });

  describe('Logout: ', () => {
    it('renders', () => {
      var mounted = shallow(
        <HomePage {...defaultProps} auth={{ authenticated: true }} />
      );

      expect(mounted.find({ onClick: actionSignoutRequest }).length).toBe(1);
    });

    it('hides', () => {
      var mounted = shallow(component);

      expect(mounted.find({ onClick: actionSignoutRequest }).length).toBe(0);
    });
  });
});
