#!/usr/bin/env sh

while getopts "vV" options; do
    case $options in
        v)  VERBOSE="-v";;
        V)  VVERBOSE="-vv";;
    esac
done

# Fetch NORTH EAST
../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/toilets-uk-north-east.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/process_loo_report

# Fetch NORTH WEST
 ../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/toilets-uk-north-west.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/process_loo_report

# Fetch SOUTH WEST
 ../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/toilets-uk-south-west.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/process_loo_report

# Fetch SOUTH EAST
 ../../cli/fetch -f ../fetchers/overpass ../fetchers/overpass/toilets-uk-south-east.xml http://overpass-api.de/api/interpreter \
 | \
 ../../cli/transform -t ../transformers/rename_property.js id osm_id \
 | \
 ../../cli/transform -t ../transformers/attribute.js origin http://overpass-api.de \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Open Street Map' \
 | \
 ../../cli/write  $VERBOSE $VVERBOSE -w ../writers/process_loo_report