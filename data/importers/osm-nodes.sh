#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

../../cli/fetch -f ../fetchers/overpass/nodes ../fetchers/overpass/toilets-nodes-uk.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/convert_properties.js osm \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/transform -t ../transformers/attribute.js trust 6 \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/process_loo_report