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
  children?: React.ReactNode;
}

const TextWrapper = styled.div<ITextProps>(compose(color, typography, height));

// const Text: React.FC<ITextProps> = ({
//   children,
//   color = 'black',
//   fontSize = '16px',
//   height = 'auto',
//   ...rest
// }) => (
//   <TextWrapper color={color} fontSize={fontSize} height={height} {...rest}>
//     {children}
//   </TextWrapper>
// );

export type TextProps = ITextProps;

/** @component */
export default TextWrapper;
