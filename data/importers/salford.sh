#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/kml http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
../../cli/transform -t ../transformers/attribute.js attribution 'Salford City Council' \
 | \
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report