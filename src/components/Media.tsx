import { createMedia } from '@artsy/fresnel';

import theme from '../theme';

const GBPTMMedia = createMedia({
  breakpoints: {
    sm: 0,
    md: parseInt(theme.breakpoints[0]),
    lg: parseInt(theme.breakpoints[1]),
    xl: parseInt(theme.breakpoints[2]),
  },
});

export const mediaStyle = GBPTMMedia.createMediaStyle();
export const { MediaContextProvider, Media } = GBPTMMedia;
