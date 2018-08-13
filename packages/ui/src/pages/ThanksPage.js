import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actionFindByIdRequest } from '../redux/modules/loos';
import { actionHighlight } from '../redux/modules/mapControls';

import PageLayout from '../components/PageLayout';
import Loading from '../components/Loading';
import NearestLooMap from '../components/NearestLooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

import config from '../config';

function constructCampaignLink(loo, email = '') {
  let coords = loo.geometry.coordinates.join(',');
  let name = loo.properties.name || '';
  let opening = loo.properties.opening || '';
  return `https://docs.google.com/forms/d/e/1FAIpQLScMvkjoE68mR1Z-yyVH7YhdndHCd_k8QwbugwfbqgZGUr_DvQ/viewform?emailAddress=${encodeURIComponent(
    email
  )}&entry.975653982=${encodeURIComponent(
    coords
  )}&entry.688810578=${encodeURIComponent(
    name
  )}&entry.1574991632=${encodeURIComponent(opening)}`;
}

class ThanksPage extends Component {
  componentDidMount() {
    if (!this.props.loo) {
      this.props.actionFindByIdRequest(this.props.match.params.id);
    }
    this.props.actionHighlight(this.props.match.params.id);
  }

  componentDidUpdate(prevProps) {
    // Support navigation _between_ loo pages
    if (this.props.match.params.id !== prevProps.match.params.id) {
      if (!this.props.loo) {
        this.props.actionFindByIdRequest(this.props.match.params.id);
      }
      this.props.actionHighlight(this.props.match.params.id);
    }
  }

  componentWillUnmount() {
    // Clear any marker highlighting when navigating away
    this.props.actionHighlight(null);
  }

  renderMain() {
    let { loo, name } = this.props;

    return (
      <div>
        <div>
          <div className={layout.controls}>
            {config.showBackButtons && (
              <button
                onClick={this.props.history.goBack}
                className={controls.btn}
              >
                Back
              </button>
            )}
          </div>
        </div>
        <h2 id="thanks" className={headings.regular}>
          Thank You!
        </h2>
        <p>Thanks for the information you've provided.</p>
        <p>
          We rely on contributions of data like yours to keep the map accurate
          and useful.
        </p>
        <a
          className={controls.btnFeatured}
          target="_blank"
          rel="noopener noreferrer"
          href={constructCampaignLink(loo, name)}
        >
          Join <strong>Use Our Loos</strong>
        </a>
      </div>
    );
  }

  renderMap() {
    return (
      <NearestLooMap
        loo={this.props.loo}
        mapProps={{
          showLocation: false,
          showSearchControl: false,
          showLocateControl: false,
          showCenter: false,
          countLimit: null,
        }}
      />
    );
  }

  render() {
    if (!this.props.loo) {
      return (
        <PageLayout
          main={<Loading message={'Fetching Toilet Data'} />}
          map={<Loading message={'Fetching Toilet Data'} />}
        />
      );
    }
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

var mapStateToProps = (state, ownProps) => ({
  app: state.app,
  loo: state.loos.byId[ownProps.match.params.id] || null,
  name: state.auth.name,
});

var mapDispatchToProps = {
  actionFindByIdRequest,
  actionHighlight,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ThanksPage);
