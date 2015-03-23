gbptm-api
=========

API server for the Great British Public Toilet Map

Obligatory badges
-----------------
[![Build Status](https://travis-ci.org/neontribe/gbptm-api.svg?branch=master)](https://travis-ci.org/neontribe/gbptm-api)
[![Dependency Status](https://david-dm.org/neontribe/gbptm-api.svg)](https://david-dm.org/neontribe/gbptm-api)

Requirements
------------

* Node.js 0.11.12 or better ([NVM](https://github.com/creationix/nvm) is useful to manage node versions)
* Mongodb 2.4 or better

(Woefully Incomplete) API Documentation
---------------------------------------
Available via [Apiary](http://docs.greatbritishpublictoiletmap.apiary.io)

Installation
------------

Obtain a copy of the code and then, in that directory:

    npm install
    npm test
    npm start

You may wish to populate your instance's database, otherwise queries are awful boring. The easiest way to do this is probably to load a snapshot from the live instance. There are some included in data/sources/mongodump - try something like this:

    mongorestore -h localhost:27017 -d gbptm ./data/sources/mongodump/27-11-2014/app29532998/
    
See how that went with:

    http localhost:3000/statistics
    
*(you do have [httpie](https://github.com/jakubroztocil/httpie) right?)*
    
Messing Around
--------------

    npm run dev
    
is provided for your convenience. It'll start your server with the default debug port enabled and monitor the application files with nodemon, restarting as necessary to save you labor.
