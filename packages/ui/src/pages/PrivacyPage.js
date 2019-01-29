import React, { Component } from 'react';

import config from '../config';

import { Button, Heading, VerticalSpacing } from '@toiletmap/design-system';

import PageLayout from '../PageLayout';
import NearestLooMap from '../NearestLooMap';

class PrivacyPage extends Component {
  renderMain() {
    return (
      <div>
        {config.showBackButtons && (
          <React.Fragment>
            <Button onClick={this.props.history.goBack}>Back</Button>
            <VerticalSpacing />
          </React.Fragment>
        )}

        <Heading headingLevel={2} id="privacy-policy">
          Privacy Policy
        </Heading>
        <Heading headingLevel={3}>Visitors to the site</Heading>
        <p>
          Cookies on The Great British Public Toilet Map website are used to
          gather anonymous data such as which pages are viewed, what time the
          visit occurred, if the visitor has been to the site before, and which
          site referred the visitor to the web page etc.
        </p>
        <p>
          Public Convenience Ltd also notes and saves information such as time
          of day, browser type and content requested. That information is used
          to provide more relevant services to users.
        </p>
        <p>
          Any data collected automatically from visitors to our web sites
          through the use of cookies will be used to improve the sites, and will
          not and cannot be used to identify any visitor. Consent by site
          visitors for this anonymous data to be collected and used by Public
          Convenience Ltd and the Use Our Loos campaign for the purpose stated
          above will be assumed by your continued navigation of this website.
        </p>
        <p>
          We will not associate any data gathered from this site through
          navigation and cookies with any personally identifying information
          from any source. We may also log Internet Protocol (IP) address (but
          nothing that directly identifies visitors) in order to receive and
          send the required information over the internet.
        </p>

        <Heading headingLevel={3}>Contributors to the site</Heading>
        <p>
          Contributors to The Great British Public Toilet Map website are asked
          to sign-in via the Auth0 platform using their email address. This
          helps us to share data on the quantity and spread of contributions to
          the site which helps show how the community value the project, to
          improve our interfaces for our users, to protect our dataset from
          misuse and to recognise contributions from a user if that user is
          adding unsuitable content, whether intentionally or inadvertently.
        </p>
        <p>
          A full list of a contributor’s activities will only be accessible to
          Public Convenience Ltd and the Use Our Loos campaign manager, for
          moderating the dataset. A contributor’s full email address will never
          be disclosed or shared and is only visible to Public Convenience Ltd.
        </p>

        <Heading headingLevel={3}>
          Public and Business Supporters of Use Our Loos campaign
        </Heading>
        <p>
          Individuals and businesses who click the “Join the Use Our Loos
          campaign” button on The Great British Public Toilet Map should have
          the opportunity to consider the terms and conditions of the campaign
          before completing the sign-up form there. The campaign is separate
          from The Great British Public Toilet Map. Data added to the Use Our
          Loos campaign is not stored or processed by Public Convenience Ltd.
        </p>
        <p>
          If you'd like to know what we've stored about you, or ask us to forget
          you, or to let us know about something you'd like changed please drop
          us a line at{' '}
          <a
            href="mailto:gbtoiletmap@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            gbtoiletmap@gmail.com
          </a>
          . If you'd like to exercise any of your rights under the GDPR that's
          the address to use.
        </p>
      </div>
    );
  }

  renderMap() {
    return <NearestLooMap numberNearest />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

export default PrivacyPage;
