declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';

declare module 'leaflet.markercluster';

declare module '*.png' {
  const value: string;
  export default value;
}
