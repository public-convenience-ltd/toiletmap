import React from 'react';

import Header from '../Header';
import Footer from '../Footer';

type SiteLayoutProps = {
  Component: React.ElementType;
  // This is not ideal as we currently only need the pageProps in the loo page stories.
  pageProps?: Record<string, unknown>;
  map?: React.ReactNode;
};

const SiteLayout: React.FC<SiteLayoutProps> = ({
  Component,
  pageProps,
  map = undefined,
}) => {
  return (
    <div className="site-layout">
      <Header />
      <div className="site-layout__wrapper">
        <main className="site-layout__content" role="main">
          {map ? (
            <div className="site-layout__map-container">
              <Component {...pageProps} />
              {map}
            </div>
          ) : (
            <Component {...pageProps} />
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
};

SiteLayout.displayName = 'SiteLayout';

export default SiteLayout;
