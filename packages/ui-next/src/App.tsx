import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import ApolloClient from 'apollo-boost';
import { ApolloProvider, Query } from 'react-apollo';
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: process.env.REACT_APP_GRAPHQL_ENDPOINT
});

const LOOS_QUERY = gql`
  query GetLoos {
    loos {
      area {
        name
      }
    }
  }
`;
class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
          </header>
          <Query query={LOOS_QUERY}>
            {({loading, data, error}) => {
              if (loading) {
                return <h2>Loading...</h2>;
              }
              if (error) {
                return <pre>err{JSON.stringify(error)}</pre>;
              }
              return <pre>data{JSON.stringify(data, null, '\t')}</pre>
            }}
          </Query>
        </div>
      </ApolloProvider>
    );
  }
}

export default App;
