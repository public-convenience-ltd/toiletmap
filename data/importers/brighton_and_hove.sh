#! /bin/bash
../../cli/fetch -f ../fetchers/kml http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml \
 | \
 ../../cli/transform -t ../transformers/geo_hash_id.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://www.brighton-hove.gov.uk/downloads/bhcc/openData/mapFiles/PublicToiletsKML.kml \
 | \
 ../../cli/transform -t ../transformers/attribute.js attribution 'Brighton & Hove City Council' \
 | \
 ../../cli/write -w ../writers/upsert_mongo.js loos