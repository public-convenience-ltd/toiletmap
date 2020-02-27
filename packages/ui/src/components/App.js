import { Component } from 'react';
import { withRouter } from 'react-router-dom';

class App extends Component {
  render() {
    return this.props.children;
  }
}

export default withRouter(App);
