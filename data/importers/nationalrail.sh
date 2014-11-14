#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

for f in ../sources/NationalRail/stations*.csv 
do
	../../cli/fetch -f ../fetchers/nationalrail_csv $f \
	| \
	../../cli/transform -t ../transformers/convert_properties.js nationalrail \
	| \
	../../cli/transform -t ../transformers/attribute.js attribution 'National Rail Enquiries' \
	| \
	../../cli/write $VERBOSE $VVERBOSE -w ../writers/process_loo_report
done