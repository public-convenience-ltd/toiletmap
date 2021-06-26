import styled from '@emotion/styled';
import { space, SpaceProps } from 'styled-system';

type ISpacerProps = SpaceProps;

const Spacer = styled.div<ISpacerProps>`
  ${space}
`;

/** @component */
export default Spacer;
