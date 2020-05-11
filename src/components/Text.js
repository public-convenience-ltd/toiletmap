import styled from '@emotion/styled';
import { compose, color, typography, width } from 'styled-system';
import { createPropTypes } from '@styled-system/prop-types';

const Text = styled.div`
  ${compose(color, typography, width)}
`;

Text.propTypes = {
  ...createPropTypes(color.propNames),
  ...createPropTypes(typography.propNames),
};

export default Text;
