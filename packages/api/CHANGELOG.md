# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="2.5.0"></a>
# [2.5.0](https://github.com/neontribe/gbptm/compare/v2.4.0...v2.5.0) (2018-08-06)


### Features

* redirect all traffic to www.toiletmap.org.uk ([ef90d29](https://github.com/neontribe/gbptm/commit/ef90d29))




<a name="2.4.0"></a>
# [2.4.0](https://github.com/neontribe/gbptm/compare/v2.3.0...v2.4.0) (2018-08-02)


### Bug Fixes

* package upgrades ([be89ceb](https://github.com/neontribe/gbptm/commit/be89ceb))


### Features

* add newrelic monitoring to the api ([8c95a80](https://github.com/neontribe/gbptm/commit/8c95a80))




<a name="2.3.0"></a>
# [2.3.0](https://github.com/neontribe/gbptm/compare/v2.2.0...v2.3.0) (2018-08-02)


### Bug Fixes

* bug where geometry was not regenerated ([5c62ea5](https://github.com/neontribe/gbptm/commit/5c62ea5))
* bypass mongo's mandatory geonear limit ([3d5af8c](https://github.com/neontribe/gbptm/commit/3d5af8c))
* correct tests in light of near endpoint changes ([9916d96](https://github.com/neontribe/gbptm/commit/9916d96))
* remove quantity and prefer fixed distance limit for nearby loos ([0be93ae](https://github.com/neontribe/gbptm/commit/0be93ae))
* use metres instead of our incorrect angles in geo queries ([298fa95](https://github.com/neontribe/gbptm/commit/298fa95))


### Features

* connect to cross-app auth ([c23efac](https://github.com/neontribe/gbptm/commit/c23efac))
* enable cors requests ([049b9b8](https://github.com/neontribe/gbptm/commit/049b9b8))


### Performance Improvements

* reduce Loo properties sent to front-end in near requests ([d4a694c](https://github.com/neontribe/gbptm/commit/d4a694c))




<a name="2.2.0"></a>
# [2.2.0](https://github.com/neontribe/gbptm/compare/v2.1.0...v2.2.0) (2018-07-03)


### Features

* redirect to https in production ([da86c96](https://github.com/neontribe/gbptm/commit/da86c96))




<a name="2.1.0"></a>
# [2.1.0](https://github.com/neontribe/gbptm/compare/v0.0.5...v2.1.0) (2018-07-02)


### Bug Fixes

* fetch single loo data correctly ([82daaa1](https://github.com/neontribe/gbptm/commit/82daaa1))
* path stats route correctly ([ce6be86](https://github.com/neontribe/gbptm/commit/ce6be86))
* update mongoose ([4b4eee9](https://github.com/neontribe/gbptm/commit/4b4eee9))


### Features

* don't stack reports ([c02cb50](https://github.com/neontribe/gbptm/commit/c02cb50))
* include admin ui ([9db1036](https://github.com/neontribe/gbptm/commit/9db1036))
* react-router + auth0 ([3a26cc2](https://github.com/neontribe/gbptm/commit/3a26cc2))
