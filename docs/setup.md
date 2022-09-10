**Important: This documentation is a work in progress, sections are incomplete and may not reflect the current reality of working on the project**

# Setup

An in-depth look at the intricacies of setting up a working local development environment

If you've already followed the quick setup guide in the readme you will have a local environment running against a set of mocked loos. For most purposes, this is all you'll need.

However there may be scenarios whilst developing a new feature you might need to have environment variables set up to allow authentication via Auth0 for your local instance — for example if you are writing end to end tests that require authentication.

## Getting a local instance running, with mocked loo data.

This is likely all you need to get up and running as a contributor to the toilet map. This guide will get you set up with a local mongodb server based on 5000 mocked toilet records.

What it won't let you do is allow you to authenticate against Auth0 or run cypress tests that involve authentication.

If you need to develop against an instance of the Toilet Map with this functionality, please read on!

**Incomplete: Content will live here**

## Auth0

Auth0 is the authentication provider used by the Toilet Map. It allows us to power our user contribution model. Users make an account in Auth0 and—once successfully authenticated—are able to submit add, edit, and removal requests against loo records.

If you'd like to enable authentication on your local instance of the map, you'll need to create an account on Auth0.

Once you've created an Auth0 account, you should have an application already configured against your account. The application represents an OIDC (OpenId Connect) interface to Auth0, which allows the next-auth0 plugin to complete the OAUTH flow to authenticate users.

Auth0 provide this handy guide: https://auth0.com/docs/quickstart/webapp/nextjs/01-login#configure-auth0 to configure and request access to all of the secrets you need to configure your local instance to connect to your Auth0 account when authenticating.

**Note:** We provide a template environment variable file here: [.env.local.example](../.env.local.example) that you can copy to `.env.local` during setup. This file represents the secret environment variables needed to run the application locally and _should not_ be added to git version control.

## Developing against the staging server

**Incomplete: Content will live here**

## Running the end-to-end tests

**Incomplete: Content will live here**
