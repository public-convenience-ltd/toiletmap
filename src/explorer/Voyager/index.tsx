import React from 'react';
import {Voyager} from 'graphql-voyager';
import 'graphql-voyager/dist/voyager.css';

function introspectionProvider(query) {
  return fetch('/api', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({query: query}),
  }).then(response => response.json());
}

const Index = () => <Voyager introspection={introspectionProvider}
  workerURI={process.env.PUBLIC_URL + '/voyager.worker.js'}
/>;

export default Index;
