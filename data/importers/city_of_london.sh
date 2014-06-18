#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/kml http://apps.cityoflondon.gov.uk/community-toilets/toilets_live.kml \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/convert_properties.js \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://apps.cityoflondon.gov.uk/community-toilets/toilets_live.kml \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'City of London Corporation' \
 | \ 
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report