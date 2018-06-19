import React from 'react';
import renderer from 'react-test-renderer';

import Header from '../components/Header';
import Footer from '../components/Footer';

describe('Layout', () => {
  // Jest snapshot
  it('renders Header', () => {
    var tree = renderer.create(<Header />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  // Jest snapshot
  it('renders Footer', () => {
    var tree = renderer.create(<Footer />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
