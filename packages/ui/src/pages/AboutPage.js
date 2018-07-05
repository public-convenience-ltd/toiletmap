import React, { Component } from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';

import styles from './css/about-page.module.css';
import headings from '../css/headings.module.css';
import layout from '../components/css/layout.module.css';
import controls from '../css/controls.module.css';

import rcaLogo from '../images/rca_logo.jpg';

class AboutPage extends Component {
  renderMain() {
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
        <h2 className={headings.large}>About this project</h2>

        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:toiletmap@rca.ac.uk">toiletmap@rca.ac.uk</a>
        </p>
        <p>
          <strong>Twitter:</strong>{' '}
          <a href="https://twitter.com/GBToiletMap">@GBToiletMap</a>{' '}
        </p>

        <p>
          The Great British Public Toilet Map was created by{' '}
          <a href="http://www.rca.ac.uk/research-innovation/helen-hamlyn-centre">
            The Helen Hamlyn Centre for Design
          </a>{' '}
          at the Royal College of Art. It was designed and built by{' '}
          <a href="http://www.neontribe.co.uk">Neontribe</a>. It is funded by
          the
          <a href="http://www.nominettrust.org.uk">Nominet Trust</a>. It began
          as part of the TACT3 research project, funded by the New Dynamics of
          Ageing programme.
        </p>

        <p>
          We are looking for sponsorship. Please contact Gail at{' '}
          <a href="mailto:gail.ramster@network.rca.ac.uk">
            gail.ramster@network.rca.ac.uk
          </a>{' '}
          if you would like to find out more.
        </p>

        <h3 className={headings.regular}>What is it?</h3>

        <p>
          The map shows toilets that the public can use. This includes those in
          shops, cafes etc if they choose to let non-customers use their loo,
          such as those in Community Toilet Schemes. We try not to include those
          that are for customer use only.
        </p>

        <p>
          The data comes from councils, businesses, the{' '}
          <a href="http://www.openstreetmap.org">OpenStreetMap</a> project and
          YOU! The data will be available for others to use under an open
          licence.
        </p>

        <p>Please help by adding and editing toilets.</p>

        <h3>Info for councils</h3>
        <p>
          The Local Government Association manage a scheme to help councils to
          publish ‘open data’ about public toilets, planning applications and
          licensing of premises. Councils are paid £7000 if they publish all
          three datasets as part of Local Open Data Incentive Scheme.
        </p>

        <p>
          <a href="http://incentive.opendata.esd.org.uk">
            incentive.opendata.esd.org.uk
          </a>
        </p>

        <p>
          <strong>Info for organisations and businesses</strong>
        </p>

        <p>
          If you have lots of toilets that you would like displayed on the map,
          please contact{' '}
          <a href="mailto:toiletmap@rca.ac.uk">toiletmap@rca.ac.uk</a>.
        </p>

        <h3 className={headings.regular}>Find out more&hellip;</h3>

        <p>
          Please email the toilet map with your questions, comments and
          feedback.
        </p>
        <p>More information about public toilets can be found at:</p>
        <p>
          <a href="http://gailknight.wordpress.com/further-reading">
            http://gailknight.wordpress.com/further-reading/
          </a>
        </p>
        <p>
          <a href="http://www.hhc.rca.ac.uk/CMS/files/Toilet_LoRes.pdf">
            Publicly Accessible Toilets: An Inclusive Design Guide
          </a>{' '}
          (pdf)
        </p>

        <h3 className={headings.regular}>Privacy policy</h3>

        <p>
          Cookies on RCA web sites are used to gather anonymous data such as
          which pages are viewed, what time the visit occurred, if the visitor
          has been to the site before, and which site referred the visitor to
          the web page etc.
        </p>

        <p>
          The Royal College of Art also notes and saves information such as time
          of day, browser type and content requested. That information is used
          to provide more relevant services to users.
        </p>

        <p>
          Any data collected automatically from visitors to our web sites
          through the use of cookies will be used to improve the sites, and will
          not and cannot be used to identify any visitor. Consent by site
          visitors for this anonymous data to be collected and used by RCA for
          the purpose stated above will be assumed by your continued navigation
          of this website.
        </p>

        <p>
          We will not associate any data gathered from this site with any
          personally identifying information from any source. We may also log
          Internet Protocol (IP) address (but nothing that directly identifies
          visitors) in order to receive and send the required information over
          the internet.
        </p>

        <p>
          For further details about the RCA’s policy on privacy and cookies,
          please visit:<br />
          <a href="http://www.rca.ac.uk/contact-us/about-this-website/privacy-cookies">
            Privacy and Cookies
          </a>
        </p>

        <p>
          <a href="http://www.rca.ac.uk" className={styles.rcaImage}>
            <img src={rcaLogo} alt="The Royal College Of Art" />
          </a>
        </p>
      </div>
    );
  }

  renderMap() {
    return <NearestLooMap />;
  }

  render() {
    return <PageLayout main={this.renderMain()} map={this.renderMap()} />;
  }
}

export default AboutPage;
