const theme = {
  breakpoints: ['768px', '1024px', '1192px'],
  space: [0, 4, 8, 16, 32, 64],
  radii: [0, 4, 8, 16, 32, 64],
  colors: {
    primary: '#0a165e',
    secondary: '#92f9db',
    white: '#fff',
    grey: '#f4f4f4',
  },
};

theme.mediaQueries = theme.breakpoints.map(
  (n) => `@media screen and (min-width: ${n})`
);

export default theme;
