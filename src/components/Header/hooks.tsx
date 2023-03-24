import { Popover, ThemeProvider, createTheme } from '@mui/material';
import React from 'react';

import Feedback from '../Feedback/Feedback';
import theme from '../../theme';

export const useFeedbackPopover = () => {
  const [feedbackElement, setFeedbackElement] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setFeedbackElement(event.currentTarget);
  };

  const handleClose = () => {
    setFeedbackElement(null);
  };

  const popoverOpen = Boolean(feedbackElement);
  const feedbackPopoverId = popoverOpen ? 'feedback-popover' : undefined;

  const FeedbackPopover = () => (
    <ThemeProvider
      theme={createTheme({
        ...theme,
      })}
    >
      <Popover
        id={feedbackPopoverId}
        open={popoverOpen}
        anchorEl={feedbackElement}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Feedback />
      </Popover>
    </ThemeProvider>
  );

  return {
    handleClick,
    handleClose,
    feedbackPopoverId,
    popoverOpen,
    feedbackElement,
    FeedbackPopover,
  };
};
