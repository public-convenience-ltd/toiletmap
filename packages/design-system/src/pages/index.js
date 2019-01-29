import React from 'react';
import { Link } from 'gatsby';

class Home extends React.Component {
  render() {
    return (
      <div>
        <h1>Welcome</h1>

        <Link to="/components/">Components</Link>
      </div>
    );
  }
}

export default Home;
