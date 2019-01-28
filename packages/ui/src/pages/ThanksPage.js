import React, { Component } from 'react';
import { connect } from 'react-redux';

import { actionFindByIdRequest } from '../redux/modules/loos';
import { actionHighlight } from '../redux/modules/mapControls';

import Button from '../design-system/src/components/Button';
import LinkButton from '../design-system/src/components/LinkButton';
import Heading from '../design-system/src/components/Heading';
import VerticalSpacing from '../design-system/src/components/VerticalSpacing';

import PageLayout from '../PageLayout';
import Loading from '../Loading';
import NearestLooMap from '../NearestLooMap';

import config from '../config';

function constructCampaignLink(loo, email = '') {
  let coords = loo.properties.geometry.coordinates.join(',');
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
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={this.props.history.goBack}>Back</Button>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Heading headingLevel={2} id="thanks">
          Thank You!
        </Heading>
        <p>Thanks for the information you've provided.</p>
        <p>
          We rely on contributions of data like yours to keep the map accurate
          and useful.
        </p>
        <p>Please consider signing up with our sponsor's campaign.</p>
        <LinkButton to={constructCampaignLink(loo, name)} type="featured">
          Join the <strong>Use Our Loos</strong> campaign
        </LinkButton>
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
