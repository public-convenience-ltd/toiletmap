import React from 'react';

import { useAuth } from '../Auth';

import PageLayout from '../components/PageLayout';
import Button from '../components/Button';

const LoginPage = (props) => {
  const auth = useAuth();

  return (
    <PageLayout>
      <h2>Hello! What's your name?</h2>

      <p>Before you can contribute data we'll need to know who to thank.</p>
      <p>
        We'll only store the first part of the email address you give us against
        the data you contribute.
      </p>
      <p>Login or sign up to let us know you're real.</p>

      <Button onClick={auth.login}>Log In/Sign Up</Button>
    </PageLayout>
  );
};

export default LoginPage;
