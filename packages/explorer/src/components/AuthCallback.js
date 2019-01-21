import React, { Component } from 'react';

class AuthCallback extends Component {
  async componentDidMount() {
    if (/access_token|id_token|error/.test(this.props.location.hash)) {
      await this.props.auth.handleAuthentication();
      await this.props.auth.fetchProfile();
    }

    if (this.props.auth.isAuthenticated()) {
      this.props.navigate('/explorer');
    } else {
      this.props.navigate('/explorer');
    }
  }

  render() {
    return <h2>Updating credentials</h2>;
  }
}

export default AuthCallback;
