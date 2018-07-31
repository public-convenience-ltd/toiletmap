import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';

import DismissableBox from '../components/DismissableBox';

var title = 'Lorem Ipsum';
var content = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>';

// Jest snapshot
it('renders snapshot', () => {
  var tree = renderer
    .create(<DismissableBox title={title} content={content} />)
    .toJSON();

  expect(tree).toMatchSnapshot();
});

it('persists', () => {
  var component = mount(
    <DismissableBox title={title} content={content} persistKey="persist" />
  );

  // Click close button
  component.find('button').simulate('click');

  // Ensure persistance object is set on localStorage
  expect(localStorage.setItem).toBeCalledWith(
    'dismissed',
    JSON.stringify({ persist: true })
  );
});
