import styled from '@emotion/styled';
import {
  compose,
  ColorProps,
  TypographyProps,
  color,
  typography,
  HeightProps,
  height,
} from 'styled-system';

interface ITextProps extends ColorProps, TypographyProps, HeightProps {
  children: React.ReactNode;
}

const Text = styled.div<ITextProps>(compose(color, typography, height));

export type TextProps = typeof Text.defaultProps;

/** @component */
export default Text;
