import React from 'react';

import config from '../config';

import PageLayout from '../components/PageLayout';
import NearestLooMap from '../components/NearestLooMap';

import layout from '../components/css/layout.module.css';
import headings from '../css/headings.module.css';
import controls from '../css/controls.module.css';

const LoginPage = (props) => {
  const mainFragment = (
    <div>
      <div>
        <div className={layout.controls}>
          {config.showBackButtons && (
            <button onClick={props.history.goBack} className={controls.btn}>
              Back
            </button>
          )}
        </div>
      </div>

      <h2 className={headings.large}>Hello! What's your name?</h2>

      <p>Before you can contribute data we'll need to know who to thank.</p>
      <p>
        We'll only store the first part of the email address you give us against
        the data you contribute.
      </p>
      <p>Login or sign up to let us know you're real.</p>

      <div className={controls.btnStack}>
        <button
          onClick={() => props.auth.reactContextLogin()}
          className={controls.btn}
        >
          Log In/Sign Up
        </button>
      </div>
    </div>
  );

  return <PageLayout main={mainFragment} map={<NearestLooMap />} />;
};

export default LoginPage;
