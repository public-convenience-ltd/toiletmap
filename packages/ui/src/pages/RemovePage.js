import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  actionRemoveRequest,
  actionFindByIdRequest,
} from '../redux/modules/loos';

import config from '../config';

import { Button, Heading, VerticalSpacing } from '@toiletmap/design-system';

import Loading from '../Loading';

class RemovePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reason: '',
    };
  }

  componentDidMount() {
    if (!this.props.loo) {
      this.props.actionFindByIdRequest(this.props.id);
    }
  }

  updateReason = evt => {
    let reason = evt.currentTarget.value;
    this.setState(() => ({
      reason,
    }));
  };

  doSubmit = () => {
    this.props.actionRemoveRequest(this.props.loo._id, this.state.reason);
  };

  render() {
    if (!this.props.loo) {
      return <Loading message="Fetching Toilet Data" />;
    }

    return (
      <div>
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={window.history.back}>Back</Button>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Heading headingLevel={2} size="large">
          Toilet Remover
        </Heading>

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
        </p>

        <label>
          Reason for removal
          <textarea
            type="text"
            name="reason"
            value={this.state.reason}
            onChange={this.updateReason}
          />
        </label>

        <Button onClick={this.doSubmit} type="caution">
          Remove it
        </Button>
      </div>
    );
  }
}

var mapStateToProps = (state, props) => ({
  app: state.app,
  loo: state.loos.byId[props.id] || null,
});

var mapDispatchToProps = {
  actionRemoveRequest,
  actionFindByIdRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemovePage);
