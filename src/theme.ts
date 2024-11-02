const breakpoints = ['768px', '1024px', '1192px'];
const theme = {
  breakpoints: breakpoints,
  space: [0, 4, 8, 16, 32, 64],
  radii: [0, 4, 8, 16, 32, 64],
  fontSizes: [10, 12, 16, 18, 24, 32, 40],
  colors: {
    primary: '#0a165e',
    secondary: '#92f9db',
    tertiary: '#ed3d62',
    ice: '#d2fff2',
    white: '#fff',
    lightGrey: '#f4f4f4',
    grey: '#807f7f',
    aqua: '#93f9db',
  },
  mediaQueries: {
    sm: '0',
    md: `@media screen and (min-width: ${breakpoints[0]})`,
    lg: `@media screen and (min-width: ${breakpoints[1]})`,
    xl: `@media screen and (min-width: ${breakpoints[2]})`,
  },
};

import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    breakpoints: string[];
    space: number[];
    radii: number[];
    fontSizes: number[];
    colors: {
      primary: string;
      secondary: string;
      tertiary: string;
      ice: string;
      white: string;
      lightGrey: string;
      grey: string;
      aqua: string;
    };
    mediaQueries: { [key: string]: string };
  }
}

export default theme;
