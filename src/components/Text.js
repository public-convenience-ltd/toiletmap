import styled from '@emotion/styled';
import { compose, color, typography } from 'styled-system';
import { createPropTypes } from '@styled-system/prop-types';

const Text = styled.div`
  ${compose(color, typography)}
`;

Text.propTypes = {
  ...createPropTypes(color.propNames),
  ...createPropTypes(typography.propNames),
};

export default Text;
