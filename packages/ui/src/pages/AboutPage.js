import React, { Component } from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';

import lists from '../css/lists.module.css';
import headings from '../css/headings.module.css';
import layout from '../components/css/layout.module.css';
import controls from '../css/controls.module.css';

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
        <h2 id="about" className={headings.regular}>
          About the map
        </h2>
        <p>
          The Great British Public Toilet Map is the UK's largest database of
          publicly-accessible toilets, with over 11000 facilities.
        </p>

        <p>
          It is run by{' '}
          <a
            href="https://publicconvenience.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Public Convenience
          </a>, a joint venture between researchers Dr Jo-Anne Bichard and Gail
          Ramster (who created the map at the{' '}
          <a
            href="http://www.rca.ac.uk/research-innovation/helen-hamlyn-centre"
            target="_blank"
            rel="noopener noreferrer"
          >
            RCA Helen Hamlyn Centre for Design
          </a>) and software development company{' '}
          <a
            href="https://neontribe.co.uk"
            target="_blank"
            rel="noopener noreferrer"
          >
            Neontribe
          </a>{' '}
          (who designed and built it).
        </p>

        <h2 id="contributing" className={headings.regular}>
          Thinking about adding a toilet?
        </h2>

        <p>
          A publicly-accessible toilet means any toilet that the public all
          allowed to access without needing to be a customer.
        </p>

        <p>
          Public toilets:
          <ul className={lists.inset}>
            <li>Council-run toilets and other public toilet blocks</li>
            <li>
              Toilets in train stations, bus stations, service/petrol stations,
              tube stations, ferry terminals, airports and other transport
              networks
            </li>
            <li>Shopping centre toilets</li>
          </ul>
        </p>

        <p>
          Other publicly-accessible toilets:
          <ul className={lists.inset}>
            <li>
              Toilets in public buildings, such as town halls, libraries,
              hospitals, museums and leisure centres
            </li>
            <li>
              Toilets in other businesses where the business agrees that the
              public can use their toilets without having to buy anything. These
              are often part of Community Toilet Schemes (run by councils) and
              can include shops, cafes, supermarkets, restaurants, hotels and
              pubs
            </li>
          </ul>
        </p>

        <p>
          <strong>
            We try not to show toilets where you need to ask permission to use
            it
          </strong>, such as those that are for customers-only. The exception is
          platform-side toilets at stations. These are only accessible to
          ticket-holders but we feel it is useful information to include.
        </p>

        <p>
          Anyone can go on the website and{' '}
          <strong>add, edit or remove toilets</strong>. We also use open data
          including from the{' '}
          <a
            href="https://www.openstreetmap.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenStreetMap
          </a>{' '}
          project and request information from councils, private companies and
          organisations.
        </p>

        <p>
          <strong>
            If you have any problems updating the toilets, or wish to send us
            toilet details or comments, please contact{' '}
            <a href="mailto:gbtoiletmap@gmail.com">gbtoiletmap@gmail.com</a>.
          </strong>
        </p>

        <h2 id="privacy" className={headings.regular}>
          Privacy Policy
        </h2>

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

export default AboutPage;
