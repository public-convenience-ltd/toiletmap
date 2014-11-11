#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/nationalrail_csv ../sources/NationalRail/stations-AW.csv \
| \
../../cli/transform -t ../transformers/convert_properties.js nationalrail \
| \
../../cli/transform -t ../transformers/attribute.js attribution 'National Rail' \
 | \
 ../../cli/transform -t ../transformers/attribute.js trust 8 #\
 #| \
 #../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report