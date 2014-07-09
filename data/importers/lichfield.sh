#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/kml http://www2.lichfielddc.gov.uk/data/files/2010/11/toilets.kml \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/convert_properties.js \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://www2.lichfielddc.gov.uk/data/files/2010/11/toilets.kml \
 | \
../../cli/transform -t ../transformers/attribute.js attribution 'Lichfield District Council' \
 | \
 ../../cli/transform -t ../transformers/attribute.js trust 4 \
 | \
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report