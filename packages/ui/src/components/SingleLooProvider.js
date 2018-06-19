import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actionFindByIdRequest } from '../redux/modules/loos';

import styles from './css/loo-map.module.css';

class SingleLooProvider extends Component {
  componentDidMount() {
    this.props.actionFindByIdRequest(this.props.params.id);
  }

  render() {
    // Wait for loo to be fetched
    if (!this.props.loo) {
      return <div className={styles.loading}>Fetching loo&hellip;</div>;
    }

    var props = Object.assign({}, this.props);

    return React.cloneElement(this.props.children, props);
  }
}

var mapStateToProps = state => ({
  loo: state.loos.byId,
  geolocation: state.geolocation,
});

var mapDispatchToProps = {
  actionFindByIdRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SingleLooProvider);
