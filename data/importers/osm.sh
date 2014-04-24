#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/overpass-query-amenities-toilets-uk.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/upsert_mongo loos