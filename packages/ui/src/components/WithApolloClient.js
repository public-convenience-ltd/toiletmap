import React from 'react';

import { ApolloConsumer } from '@apollo/client';

/**
 * Provides a prop `apolloClient` to all first-level children which is a reference
 * to the ApolloClient object defined in the root index file.
 *
 * Example of how to wrap:
 *
 *    const MyComponentWithApolloClient = (props) => (
 *      <WithApolloClient>
 *        <MyComponent {...props} />
 *      </WithApolloClient>
 *    );
 */

const WithApolloClient = function WithApolloClient({ children }) {
  return (
    <ApolloConsumer>
      {client => {
        return React.Children.map(children, child => {
          return React.cloneElement(child, {
            apolloClient: client,
          });
        });
      }}
    </ApolloConsumer>
  );
};

export default WithApolloClient;
