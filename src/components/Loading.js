import React from 'react';

import Notification from './Notification';

export default (props) => {
  return (
    <Notification>
      <p>{props.message}</p>
    </Notification>
  );
};
