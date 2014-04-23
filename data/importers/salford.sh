#! /bin/bash
../../cli/fetch -f ../fetchers/kml http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
 ../../cli/transform -t ../transformers/geohash_property.js \
 | \
 ../../cli/transform -t ../transformers/omit_properties.js styleUrl styleHash \
 | \
 ../../cli/transform -t ../transformers/attribute.js source http://services.salford.gov.uk/data/kml/public-toilet.kml \
 | \
../../cli/transform -t ../transformers/attribute.js attribution 'Salford City Council' \
 | \
 ../../cli/write -w ../writers/upsert_mongo loos