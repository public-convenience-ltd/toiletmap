#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/gbptm_csv ../sources/gbptm.csv \
| \
 ../../cli/transform -t ../transformers/convert_properties.js gbptm \
| \
../../cli/transform -t ../transformers/attribute.js attribution 'Great British Public Toilet Map' \
 | \
 ../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report