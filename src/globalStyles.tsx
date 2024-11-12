import { Global, css } from '@emotion/react';

//To do: when we have moved away from Emotion, think about what we do with the file

// loosely based on https://hankchizljaw.com/wrote/a-modern-css-reset + a height declaration on the next container...
const globalStyles = (
  <Global
    styles={css`
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

      :root {
        --color-blue: #0a165e;
        --color-turquoise: #92f9db;
        --color-pink: #ed3d62;
        --color-ice: #d2fff2;
        --color-white: #fff;
        --color-light-grey: #f4f4f4;
        --color-grey: #807f7f;

        /* space and text scales based on @link https://utopia.fyi/space/calculator?c=320,16,1.2,1240,18,1.25,5,2,&s=0.75|0.5|0.25,1.5|2|3|4|6,s-l&g=s,l,xl,12 */

        --space-3xs: clamp(0.25rem, calc(0.23rem + 0.11vw), 0.31rem);
        --space-2xs: clamp(0.5rem, calc(0.48rem + 0.11vw), 0.56rem);
        --space-xs: clamp(0.75rem, calc(0.71rem + 0.22vw), 0.88rem);
        --space-s: clamp(1rem, calc(0.96rem + 0.22vw), 1.13rem);
        --space-m: clamp(1.5rem, calc(1.43rem + 0.33vw), 1.69rem);
        --space-l: clamp(2rem, calc(1.91rem + 0.43vw), 2.25rem);
        --space-xl: clamp(3rem, calc(2.87rem + 0.65vw), 3.38rem);
        --space-2xl: clamp(4rem, calc(3.83rem + 0.87vw), 4.5rem);
        --space-3xl: clamp(6rem, calc(5.74rem + 1.3vw), 6.75rem);

        --text--2: clamp(0.69rem, calc(0.69rem + 0.04vw), 0.72rem);
        --text--1: clamp(0.83rem, calc(0.81rem + 0.12vw), 0.9rem);
        --text-0: clamp(1rem, calc(0.96rem + 0.22vw), 1.13rem);
        --text-1: clamp(1.2rem, calc(1.13rem + 0.36vw), 1.41rem);
        --text-2: clamp(1.44rem, calc(1.33rem + 0.55vw), 1.76rem);
        --text-3: clamp(1.73rem, calc(1.56rem + 0.82vw), 2.2rem);
        --text-4: clamp(2.07rem, calc(1.84rem + 1.17vw), 2.75rem);
        --text-5: clamp(2.49rem, calc(2.16rem + 1.64vw), 3.43rem);

        --toilet-max-width: 845px;
        --toilet-gutter: var(--space-l);
      }

      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      *:focus {
        outline: none;
      }

      [data-focus-visible-added] {
        outline: 1px dotted currentColor;
        outline-offset: 0.5rem;
      }

      /* remove default padding */
      ul,
      ol,
      button,
      fieldset {
        padding: 0;
      }

      /* remove default margin */
      body,
      h1,
      h2,
      h3,
      h4,
      p,
      ul,
      ol,
      li,
      figure,
      figcaption,
      blockquote,
      dl,
      dd,
      fieldset {
        margin: 0;
      }

      :root,
      #root {
        height: 100%;
      }

      /* set core body defaults */
      body {
        height: 100%;
        scroll-behavior: smooth;
        text-rendering: optimizeSpeed;
        line-height: 1.5;
        font-family: 'Open Sans', sans-serif;
        color: var(--color-blue);
      }

      /* remove list styles on ul, ol elements */
      ul,
      ol {
        list-style: none;
      }

      /* have link and buttons be indistinguishable */
      a,
      button {
        color: inherit;
        cursor: pointer;
      }

      a {
        text-decoration: underline;
      }

      button {
        border: none;
        background: none;
      }

      /* make images easier to work with */
      img {
        max-width: 100%;
        display: block;
      }

      /* natural flow and rhythm in articles by default */
      article > * + * {
        margin-top: 1em;
      }

      /* inherit fonts for inputs and buttons */
      input,
      button,
      textarea,
      select {
        font: inherit;
      }

      label {
        cursor: pointer;
      }

      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        font: inherit;
      }

      h1 {
        font-size: var(--text-4);
        max-width: 50ch;
      }

      h2 {
        font-size: var(--text-3);
      }

      h3 {
        font-size: var(--text-2);
      }

      h4 {
        font-size: var(--text-1);
      }

      fieldset {
        border: 0;
      }

      th {
        text-align: left;
        font-weight: normal;
        vertical-align: bottom;
      }

      p + p {
        margin-top: 1em;
      }

      a:hover,
      a:focus,
      button:hover,
      button:focus {
        color: var(--color-pink);
        transition: all 0.2s ease;
      }

      [hidden] {
        display: none !important;
      }

      [inert] {
        opacity: 0.25;
      }

      ::-webkit-input-placeholder {
        color: var(--color-blue);
      }

      :-ms-input-placeholder {
        color: var(--color-blue);
      }

      ::placeholder {
        color: var(--color-blue);
      }

      /* remove all animations and transitions for people that prefer not to see them */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      }

      #__next {
        height: 100%;
      }
    `}
  />
);

export default globalStyles;
