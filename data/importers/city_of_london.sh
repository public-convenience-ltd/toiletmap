#! /bin/bash
../../cli/fetch -f ../fetchers/kml http://apps.cityoflondon.gov.uk/community-toilets/toilets_live.kml \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://apps.cityoflondon.gov.uk/community-toilets/toilets_live.kml \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'City of London Corporation' \
 | \
 ../../cli/write -w ../writers/upsert_mongo loos