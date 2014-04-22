#! /bin/bash
../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/overpass-query-amenities-toilets-uk.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/geo_hash_id.js \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 #| \
 #../../cli/write -f ../writers/upsert_mongo loos