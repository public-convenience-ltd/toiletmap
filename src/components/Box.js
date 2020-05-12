import styled from '@emotion/styled';
import {
  compose,
  space,
  color,
  layout,
  position,
  flexbox,
} from 'styled-system';
import { createPropTypes } from '@styled-system/prop-types';

// https://styled-system.com/guides/build-a-box
const Box = styled.div`
  ${compose(space, color, layout, position, flexbox)}

  // ensures the Box can shrink below its minimum content size when used as a flex item
  min-width: 0;
`;

Box.propTypes = {
  ...createPropTypes(space.propNames),
  ...createPropTypes(color.propNames),
  ...createPropTypes(layout.propNames),
  ...createPropTypes(position.propNames),
  ...createPropTypes(flexbox.propNames),
};

export default Box;
