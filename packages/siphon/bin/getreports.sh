#! /bin/bash

if [[ -z "$1" ]]
then
	echo "Usage ./getreports.sh <password>" >&2
	exit 1
fi

mongoexport --host lamppost.9.mongolayer.com --port 10239 --type json --jsonArray --username heroku --db app29532998 --password "$1" --collection looreports --out reports.json
