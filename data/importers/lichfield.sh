#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/kml http://www2.lichfielddc.gov.uk/data/files/2010/11/toilets.kml \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://www2.lichfielddc.gov.uk/data/files/2010/11/toilets.kml \
 | \
../../cli/transform -t ../transformers/attribute.js attribution 'Lichfield District Council' \
 | \
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/upsert_mongo loos