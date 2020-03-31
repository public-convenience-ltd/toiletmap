import React from 'react';
import PropTypes from 'prop-types';

import MediaQuery from 'react-responsive';

import Header from './Header';
import Footer from './Footer';

import layout from './css/layout.module.css';

import config from '../config';
import Tracking, {
  TRACKING_STATE_CHOSEN,
  CONFIG_NS,
} from './Tracking/Tracking';

const PageLayout = (props) => {
  const mainRef = React.useRef();

  const [cookieSettingsOpen, setCookieSettingsOpen] = React.useState(
    config.getSetting(CONFIG_NS, 'trackingState') !== TRACKING_STATE_CHOSEN
  );

  React.useEffect(() => {
    if (mainRef.current && cookieSettingsOpen) {
      mainRef.current.scrollTop = 0;
    }
  }, [mainRef, cookieSettingsOpen]);

  return (
    <div className={layout.appContainer}>
      <div className={layout.mainContainer}>
        <div className={layout.main}>
          <Header />

          <main ref={mainRef} className={layout.content}>
            <Tracking
              analyticsId={config.analyticsId}
              isOpen={cookieSettingsOpen}
              onClose={() => setCookieSettingsOpen(false)}
            >
              <div>{React.cloneElement(props.main, props)}</div>
            </Tracking>
          </main>

          <Footer onCookieBoxButtonClick={() => setCookieSettingsOpen(true)} />
        </div>
      </div>

      <MediaQuery minWidth={config.viewport.mobile}>
        <aside data-testid="mainMap" className={layout.mapContainer}>
          {React.cloneElement(props.map, props)}
        </aside>
      </MediaQuery>
    </div>
  );
};

PageLayout.propTypes = {
  main: PropTypes.element.isRequired,
  map: PropTypes.element.isRequired,
};

export default PageLayout;
