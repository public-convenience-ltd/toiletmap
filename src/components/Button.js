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
    user-select: none;
    height: ${BUTTON_HEIGHT}px;
    border-radius: ${BUTTON_HEIGHT / 2}px;
    border: none;
    padding: 0 ${props.theme.space[3]}px;
    border-style: solid;
    border-width: 2px;
  `,
  variant({
    variants: {
      primary: {
        bg: 'secondary',
        borderColor: 'secondary',
      },
      secondary: {
        borderColor: 'primary',
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

    <Text fontWeight="bold" color="primary">
      {children}
    </Text>
  </StyledButton>
);

Button.defaultProps = {
  variant: 'primary',
  as: 'button',
};

export default Button;
