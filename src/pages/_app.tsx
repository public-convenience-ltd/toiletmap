// Polyfills
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import 'resize-observer-polyfill';

import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import Router from 'next/router';
import Link from 'next/link';
import { SWRConfig } from 'swr';

import ProtectedRoute from '../components/ProtectedRoute';
import AuthCallback from './AuthCallback';
import HomePage from './HomePage';
import AboutPage from './AboutPage';
import ContactPage from './ContactPage';
import ContributePage from './ContributePage';
import MapPage from './MapPage';
import UseOurLoosPage from './UseOurLoosPage';
import CookiesPage from './CookiesPage';
import PrivacyPage from './PrivacyPage';
import NotFound from './404';
import PageLoading from '../components/PageLoading';

import AuthProvider from '../Auth';
import fetcher from '../graphql/fetcher';
import { MapStateProvider } from '../components/MapState';

// if (process.env.REACT_APP_MOCKS) {
//   lazy(() =>
//     import(/*webpackChunkName: 'explorer'*/ '../mocks')
//   );
// }

const Explorer = lazy(() =>
  import(/*webpackChunkName: 'explorer'*/ '../explorer')
);
const AddPage = lazy(() =>
  import(/*webpackChunkName: 'add'*/ './AddPage')
);
const EditPage = lazy(() =>
  import(/*webpackChunkName: 'edit'*/ './EditPage')
);
const RemovePage = lazy(() =>
  import(/*webpackChunkName: 'remove'*/ './RemovePage')
);

// ReactDOM.render(
//  ,
//   (typeof document !== 'undefined') && document.getElementById('root')
// );


const App = ({Component, pageProps}) => (
  <AuthProvider>
  <SWRConfig
    value={{
      fetcher,
    }}
  >
    <MapStateProvider>
      <Component {...pageProps} />
        {/* <Suspense fallback={<PageLoading />}> */}
            {/* <Link exact href="/" component={HomePage} /> */}
            {/* <ProtectedRoute href="/loos/add" component={AddPage} />
            <Link href="/loos/:id" exact component={HomePage} />
            <Link exact href="/about" component={AboutPage} />
            <Link exact href="/cookies" component={CookiesPage} />
            <Link exact href="/privacy" component={PrivacyPage} />
            <Link exact href="/use-our-loos" component={UseOurLoosPage} />
            <Link exact href="/contact" component={ContactPage} />
            <Link
              href="/contribute"
              render={(props) => <ContributePage {...props} />}
            />
            <Link
              href="/login"
              render={() => <Redirect to="/contribute" />}
            />
            <Link
              href="/map/:lng/:lat"
              render={(props) => <MapPage {...props} />}
            />
            <Link
              exact
              href="/callback"
              render={(props) => <AuthCallback {...props} />}
            />
            <Link
              href="/explorer"
              render={(props) => <Explorer {...props} />}
            />
            <ProtectedRoute href="/loos/:id/edit" component={EditPage} />
            <ProtectedRoute href="/loos/:id/remove" component={RemovePage} />
            <Link component={NotFound} /> */}
        {/* </Suspense> */}
    </MapStateProvider>
  </SWRConfig>
</AuthProvider>
)

export default App;
