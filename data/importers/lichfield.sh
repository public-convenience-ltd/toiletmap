#!/usr/bin/env sh
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
 ../../cli/write -w ../writers/upsert_mongo loos