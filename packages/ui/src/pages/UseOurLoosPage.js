import React, { Component } from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';

import lists from '../css/lists.module.css';
import headings from '../css/headings.module.css';
import layout from '../components/css/layout.module.css';
import controls from '../css/controls.module.css';
import newlogo from '../images/newlogo.png';

class UseOurLoosPage extends Component {
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
        <img src={newlogo} alt="Powered by Domestos" />
        <p>
          <strong>Use Our Loos</strong> is the first national community toilet
          scheme, created by the British Toilet Association, Domestos and the{' '}
          <strong>Great British Public Toilet Map</strong>, with the ambition to
          unlock the loos that are hidden in high street cafes, restaurants,
          coffee shops and bars and open them up to the community.
        </p>
        <p>
          We're inviting businesses to sign up and welcome everyone, customers
          and non-customers, to use your loos. By joining our initiative, you
          will:
        </p>
        <ul className={lists.inset}>
          <li>
            Receive a Domestos welcome pack with free products and discounts to
            keep the toilet clean.
          </li>
          <li>
            Receive Use Our Loos stickers and signage to proudly display your
            commitment to the community.
          </li>
          <li>Get local support and liaison with the campaign manager.</li>
          <li>
            Get local fame and benefit from increased customers and a stronger
            connection to your community.
          </li>
        </ul>

        <p>
          <strong>
            <a href="https://goo.gl/forms/JRw6J7yoDe46YIB23">
              Register your interest here!
            </a>
          </strong>
        </p>
        <p>
          If you have any questions please contact the Campaign Manager at{' '}
          <a href="mailto:useourloos@gmail.com">useourloos@gmail.com</a>
        </p>
        <p>
          Please note you must be a representative of any business you sign up
          to the scheme. Members of the public can help by encouraging their
          local businesses to sign up.{' '}
          <a
            href="https://drive.google.com/file/d/1CPHj8nKAS7PS2mvUxrIwmHm2hAt9Vn2h/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
          >
            You can find campaign materials here
          </a>
          .
        </p>
        <div className={layout.bandedSection}>
          <div className={layout.bandedSectionText}>
            <div className={layout.mainContainer}>
              <h2 id="faq" className={headings.regular}>
                Use Our Loos FAQs
              </h2>
              <h3>Who Can Join The Scheme?</h3>
              <p>Businesses of all sizes can join the scheme.</p>
              <h3>What are the requirements of joining the scheme?</h3>
              <p>
                Participating businesses should allow customers and non
                customers alike to access their toilet facilities during normal
                opening hours and display stickers to make people aware of their
                participation in the scheme. There is an expectation that
                facilities will be maintained to acceptable standards of hygiene
                and cleanliness.
              </p>
              <h3>Why was this scheme created?</h3>
              <p>
                Over the past two decades, the number of public toilets
                available throughout the UK have been steadily reduced. There is
                currently no legal requirement for local authorities to provide
                toilets. This often leads to loos being closed if councils deem
                they cannot afford the cost to maintain. This presents a
                struggle for the many individuals and families who have a
                greater need for access to public facilities; it’s also a basic
                human need for us all. The Use Our Loos scheme has been designed
                to bring the public loos back by opening more loos through
                cafes, restaurants, and shops, where facilities already exist.
              </p>
              <p>
                Community Toilet Schemes have been run successfully at a local
                level across the country but the public are often unaware of
                their existence. By bringing these schemes under one umbrella,
                as well as welcoming new members we hope to increase the value
                for everyone.
              </p>
              <h3>
                Does this scheme aim to replace traditional public toilets?
              </h3>
              <p>
                No. Purpose built public toilets serve an important role in
                public life, and we will continue to encourage councils to
                increase rather than cut provision. This scheme aims to find a
                community-oriented solution to filling the gaps in current
                provision.
              </p>
              <h3>
                Can Businesses also participate in Local Community Toilet
                Schemes?
              </h3>
              <p>
                Yes! The Use Our Loos Campaign is not intended to replace
                existing schemes run by local authorities. We aim to unite
                existing schemes with a common and recognizable brand to enable
                the public to access them more easily. For areas where local
                schemes exist businesses are encouraged to sign up to both.
              </p>
              <h3>What if a dangerous situation arises in my loo?</h3>
              <p>
                Businesses reserve the right to manage situations as they would
                with any customer to their establishment, including escalating
                issues as needed.
              </p>
              <h3>What if I want to leave the scheme?</h3>
              <p>
                Businesses can leave the scheme at any time by contacting the
                campaign manager and asking to be removed from the map.
              </p>
              <h3>Terms and Conditions</h3>
              <p>
                You can view the full project{' '}
                <a href="https://drive.google.com/file/d/1lnTVYZWBc36W6J9YjLo1mB1bB4MIudOi/view?usp=sharing">
                  terms and conditions here
                </a>
                .
              </p>
            </div>
          </div>
        </div>
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

export default UseOurLoosPage;
