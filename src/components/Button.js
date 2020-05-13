import React from 'react';
import styled from '@emotion/styled';
import { variant } from 'styled-system';

import Box from './Box';
import Text from './Text';

const ButtonIcon = ({ icon }) => {
  return <Box mr={2}>{icon}</Box>;
};

const StyledButton = styled.button(
  `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    user-select: none;
    min-height: 34px;
    max-width: 300px;
    border-radius: 25px;
    border: none;
    padding: 0 20px;
    border-style: solid;
    border-width: 2px;
    box-sizing: border-box;
  `,
  variant({
    variants: {
      primary: {
        bg: 'secondary',
        borderColor: 'secondary',
      },
      secondary: {
        bg: 'white',
        borderColor: 'primary',
      },
    },
  })
);

const Button = ({ children, icon, ...props }) => (
  <StyledButton type="button" {...props}>
    <Text color="primary">{icon && <ButtonIcon icon={icon} />}</Text>
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
