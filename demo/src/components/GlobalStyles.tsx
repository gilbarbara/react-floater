import { css, Global } from '@emotion/react';
import { theme } from '@gilbarbara/components';

export default function GlobalStyles() {
  return (
    <Global
      styles={css`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400;0,700;1,400;1,700&display=swap');

        *,
        *:before,
        *:after {
          box-sizing: border-box;
        }

        html {
          font-size: 62.5%;
          -webkit-font-smoothing: antialiased;
          height: 100%;
        }

        body {
          background-color: ${theme.white};
          color: ${theme.darkColor};
          font-family: Rubik, sans-serif;
          font-size: ${theme.typography.md.fontSize};
          margin: 0;
          min-height: 100vh;
          padding: 0;
        }

        img {
          height: auto;
          max-width: 100%;
        }

        a {
          color: ${theme.colors.primary};
          text-decoration: underline;

          &.disabled {
            pointer-events: none;
          }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          transition:
            background-color 50000s ease-in-out 0s,
            color 5000s ease-in-out 0s;
        }
      `}
    />
  );
}
