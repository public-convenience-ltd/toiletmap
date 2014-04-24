#!/usr/bin/env sh
../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/overpass-query-amenities-toilets-uk.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write -vv -w ../writers/upsert_mongo loos