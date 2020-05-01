import React from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import LooMap from '../components/LooMap';
import useMapPosition from '../components/useMapPosition';
import useNearbyLoos from '../components/useNearbyLoos';

import lists from '../css/lists.module.css';
import headings from '../css/headings.module.css';
import layout from '../components/css/layout.module.css';
import controls from '../css/controls.module.css';

import uolLogo from '../images/domestos-use-our-loos-full.png';

const AboutPage = (props) => {
  const [mapPosition, setMapPosition] = useMapPosition();

  const { data } = useNearbyLoos({
    lat: mapPosition.center.lat,
    lng: mapPosition.center.lng,
    radius: mapPosition.radius,
  });

  const mainFragment = (
    <div>
      <div className={layout.controls}>
        {config.showBackButtons && (
          <button onClick={props.history.goBack} className={controls.btn}>
            Back
          </button>
        )}
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
        </a>
        , a joint venture between researchers Dr Jo-Anne Bichard and Gail
        Ramster (who created the map at the{' '}
        <a
          href="http://www.rca.ac.uk/research-innovation/helen-hamlyn-centre"
          target="_blank"
          rel="noopener noreferrer"
        >
          RCA Helen Hamlyn Centre for Design
        </a>
        ) and software development company{' '}
        <a
          href="https://neontribe.co.uk"
          target="_blank"
          rel="noopener noreferrer"
        >
          Neontribe
        </a>{' '}
        (who designed and built it).
      </p>
      {config.shouldShowSponsor() && (
        <div className={layout.bandedSection}>
          <div className={layout.bandedSectionText}>
            <div className={layout.mainContainer}>
              <h2 id="use-our-loos" className={headings.regular}>
                Use Our Loos
              </h2>

              <img src={uolLogo} alt="Use Our Loos is powered by Domestos" />

              <p>
                We all need toilets. When you need to go, you need to go. At
                home or in an office this isn’t a problem. However, out and
                about, are you sure there’s somewhere to go when the need
                arises?
              </p>

              <p>
                Across the UK, more than one in every three public toilets have
                been closed over the last two decades. Some councils are already
                without a single free-to-use public convenience.
              </p>

              <p>
                <strong>Use Our Loos</strong> is the first national community
                toilet scheme, created by the{' '}
                <a
                  href="http://www.btaloos.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  British Toilet Association
                </a>
                ,{' '}
                <a
                  href="http://www.domestos.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Domestos
                </a>{' '}
                and the <strong>Great British Public Toilet Map</strong>, with
                the ambition to unlock the loos that are hidden in high street
                cafes, restaurants, coffee shops and bars and open them up to
                the community.
              </p>

              <p>
                As more public loos are closed, we’re asking that more loos are
                made public.
              </p>

              <p>
                We’re inviting businesses to sign up and welcome everyone,
                customers and non-customers, to use their loos. In return, we’re
                providing them with free Domestos product, directing people to
                their venues and driving local fame so they will benefit from
                increased customers and a stronger connection to their
                community.
              </p>

              <p>
                We’re inviting the public to use our map to discover loos near
                them and to help us improve the service by adding new locations
                or flagging loos that have closed.
              </p>

              <p>
                To register your business for the Use Our Loos campaign please
                contact{' '}
                <a
                  href="mailto:useourloos@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  useourloos@gmail.com
                </a>
              </p>
              <p>
                You can also register your interest{' '}
                <a
                  href="https://goo.gl/forms/JRw6J7yoDe46YIB23"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here.
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 id="contributing" className={headings.regular}>
        Thinking about adding a toilet?
      </h2>

      <p>
        A publicly-accessible toilet means any toilet that the public are
        allowed to access without needing to be a customer.
      </p>

      <h3 className={headings.small}>Public toilets</h3>
      <ul className={lists.inset}>
        <li>Council-run toilets and other public toilet blocks</li>
        <li>
          Toilets in train stations, bus stations, service/petrol stations, tube
          stations, ferry terminals, airports and other transport networks
        </li>
        <li>Shopping centre toilets</li>
      </ul>

      <h3 className={headings.small}>Other publicly-accessible toilets</h3>
      <ul className={lists.inset}>
        <li>
          Toilets in public buildings, such as town halls, libraries, hospitals,
          museums and leisure centres
        </li>
        <li>
          Toilets in other businesses where the business agrees that the public
          can use their toilets without having to buy anything. These are often
          part of Community Toilet Schemes (run by councils) and can include
          shops, cafes, supermarkets, restaurants, hotels and pubs
        </li>
      </ul>

      <p>
        <strong>
          We try not to show toilets where you need to ask permission to use it
        </strong>
        , such as those that are for customers-only. The exception is
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
    </div>
  );

  return (
    <PageLayout
      main={mainFragment}
      map={
        <LooMap
          loos={data}
          center={mapPosition.center}
          zoom={mapPosition.zoom}
          onMoveEnd={setMapPosition}
          showContributor
          showCenter
          showSearchControl
          showLocateControl
        />
      }
    />
  );
};

export default AboutPage;
