import styled from '@emotion/styled';
import { space, SpaceProps } from 'styled-system';
import { createPropTypes } from '@styled-system/prop-types';

interface ISpacerProps extends SpaceProps {}

const Spacer = styled.div<ISpacerProps>`
  ${space}
`;

/** @component */
export default Spacer;
