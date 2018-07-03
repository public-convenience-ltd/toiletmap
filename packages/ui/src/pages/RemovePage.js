import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import {
  actionRemoveRequest,
  actionFindByIdRequest,
} from '../redux/modules/loos';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import SingleLooMap from '../components/map/SingleLooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

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
        <div>
          <div className={layout.controls}>
            <button
              onClick={this.props.history.goBack}
              className={controls.btn}
            >
              Back
            </button>
          </div>
        </div>

        <h2 className={headings.large}>Toilet Remover</h2>

        <p>
          Please let us know why you're removing this toilet from the map using
          the form below.
        </p>

        <label>
          Reason for removal
          <textarea
            type="text"
            name="reason"
            className={controls.text}
            value={this.state.reason}
            onChange={this.updateReason}
          />
        </label>

        <button onClick={this.doSubmit} className={controls.btnCaution}>
          Remove it
        </button>
      </div>
    );
  }

  renderMap() {
    return <SingleLooMap loo={this.props.loo} />;
  }

  render() {
    if (!this.props.loo) {
      return (
        <PageLayout
          main={<Loading message={'Fetching Loo Data'} />}
          map={<Loading message={'Fetching Loo Data'} />}
        />
      );
    }
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

RemovePage.propTypes = {
  loo: PropTypes.object.isRequired,
};

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
