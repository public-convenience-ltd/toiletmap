import styled from '@emotion/styled';
import {
  compose,
  space,
  color,
  layout,
  flexbox,
  position,
  border,
} from 'styled-system';
import { createPropTypes } from '@styled-system/prop-types';

// https://styled-system.com/guides/build-a-box
const Box = styled.div`
  ${compose(space, color, layout, flexbox, position, border)}

  // ensures the Box can shrink below its minimum content size when used as a flex item
  min-width: 0;
`;

Box.propTypes = {
  ...createPropTypes(space.propNames),
  ...createPropTypes(color.propNames),
  ...createPropTypes(layout.propNames),
  ...createPropTypes(position.propNames),
  ...createPropTypes(flexbox.propNames),
  ...createPropTypes(position.propNames),
  ...createPropTypes(border.propNames),
};

export default Box;
