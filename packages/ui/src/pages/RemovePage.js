import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  actionRemoveRequest,
  actionFindByIdRequest,
} from '../redux/modules/loos';

import config from '../config';

import { Button, Heading, VerticalSpacing } from '@toiletmap/design-system';

import PageLayout from '../PageLayout';
import Loading from '../Loading';
import LooMap from '../LooMap';

class RemovePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reason: '',
    };
  }

  componentDidMount() {
    if (!this.props.loo) {
      this.props.actionFindByIdRequest(this.props.match.params.id);
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

  renderMain() {
    return (
      <div>
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={this.props.history.goBack}>Back</Button>
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

  renderMap() {
    var coords = {
      lat: this.props.loo.properties.geometry.coordinates[1],
      lng: this.props.loo.properties.geometry.coordinates[0],
    };

    return (
      <LooMap
        loos={[this.props.loo]}
        initialPosition={coords}
        highlight={this.props.loo._id}
        showLocation={false}
        showSearchControl={false}
        showLocateControl={false}
        showCenter={false}
        preventDragging={true}
        preventZoom={true}
        minZoom={config.editMinZoom}
      />
    );
  }

  render() {
    if (!this.props.loo) {
      return (
        <PageLayout
          main={<Loading message="Fetching Toilet Data" />}
          map={<Loading message="Fetching Toilet Data" />}
        />
      );
    }

    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

var mapStateToProps = (state, ownProps) => ({
  app: state.app,
  loo: state.loos.byId[ownProps.match.params.id] || null,
});

var mapDispatchToProps = {
  actionRemoveRequest,
  actionFindByIdRequest,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemovePage);
