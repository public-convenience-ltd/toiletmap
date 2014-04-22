#! /bin/bash
../../cli/fetch -f ../fetchers/kml http://www2.redbridge.gov.uk/Data/Kml/PublicToilets.kml \
 | \
 ../../cli/transform -t ../transformers/geo_hash_id.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://www2.redbridge.gov.uk/Data/Kml/PublicToilets.kml \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Redbridge Council' \
 | \
 ../../cli/write -f ../writers/upsert_mongo loos