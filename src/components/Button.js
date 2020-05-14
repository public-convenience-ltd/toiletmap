import React from 'react';
import styled from '@emotion/styled';
import { variant } from 'styled-system';

import Box from './Box';
import Text from './Text';

const BUTTON_HEIGHT = 34;

const StyledButton = styled.button(
  (props) =>
    `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    user-select: none;
    min-height: ${BUTTON_HEIGHT}px;
    max-width: 300px;
    border-radius: ${BUTTON_HEIGHT / 2}px;
    border: none;
    padding: 0 ${props.theme.space[3]}px;
    border-style: solid;
    border-width: 2px;
    color: primary;
  `,
  variant({
    variants: {
      primary: {
        color: 'primary',
        fontWeight: 'bold',
        bg: 'secondary',
        borderColor: 'secondary',
      },
      secondary: {
        color: 'primary',
        bg: 'white',
        fontWeight: 'bold',
        borderColor: 'primary',
      },
      link: {
        color: 'primary',
        border: 'none',
        background: 'none',
        textDecoration: 'underline',
        fontWeight: 'normal',
        padding: 0,
        minHeight: 0,
      },
    },
  })
);

const ButtonIcon = ({ icon }) => {
  return <Box mr={2}>{icon}</Box>;
};

const Button = ({ children, icon, ...props }) => (
  <StyledButton type="button" {...props}>
    {Boolean(icon) && (
      <Text color="primary">
        <ButtonIcon icon={icon} />
      </Text>
    )}

    <Text>{children}</Text>
  </StyledButton>
);

Button.defaultProps = {
  variant: 'primary',
  as: 'button',
};

export default Button;
