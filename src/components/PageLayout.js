import React from 'react';
import PropTypes from 'prop-types';

import MediaQuery from 'react-responsive';

import Header from './Header';
import Footer from './Footer';

import layout from './css/layout.module.css';

import config from '../config';
import { TRACKING_STORAGE_KEY } from './Tracking';
import TrackingPreferences from './Tracking/TrackingPreferences';

const PageLayout = (props) => {
  const mainRef = React.useRef();

  const [isCookieSettingsOpen, setIsCookieSettingsOpen] = React.useState(
    !config.getSetting(TRACKING_STORAGE_KEY, 'trackingStateChosen')
  );

  React.useEffect(() => {
    if (mainRef.current && isCookieSettingsOpen) {
      mainRef.current.scrollTop = 0;
    }
  }, [mainRef, isCookieSettingsOpen]);

  return (
    <div className={layout.appContainer}>
      <div className={layout.mainContainer}>
        <div className={layout.main}>
          <Header />

          <main ref={mainRef} className={layout.content}>
            {props.main && React.cloneElement(props.main, props)}
          </main>

          <Footer
            onCookieBoxButtonClick={() =>
              setIsCookieSettingsOpen(!isCookieSettingsOpen)
            }
            isCookieSettingsOpen={isCookieSettingsOpen}
          />
        </div>
      </div>

      <MediaQuery minWidth={config.viewport.mobile}>
        <aside data-testid="mainMap" className={layout.mapContainer}>
          {props.map && React.cloneElement(props.map, props)}
        </aside>
      </MediaQuery>

      <TrackingPreferences
        isOpen={isCookieSettingsOpen}
        onClose={() => setIsCookieSettingsOpen(false)}
      />
    </div>
  );
};

PageLayout.propTypes = {
  main: PropTypes.element,
  map: PropTypes.element,
};

export default PageLayout;
