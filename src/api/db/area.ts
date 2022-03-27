import mongoose from 'mongoose';
import { Polygon } from './geojson';

const AreaSchema = new mongoose.Schema(
  {
    name: String,
    geometry: Polygon,
    type: String,
    priority: Number,
    version: Number,
    datasetId: Number,
  },
  { minimize: false }
);

AreaSchema.index({ geometry: '2dsphere' });
AreaSchema.index({ name: 'text' });

/**
 * Find an area containing a point.
 */
AreaSchema.statics.containing = async function (coords) {
  const areas = await this.find(
    {
      geometry: {
        $geoIntersects: {
          $geometry: {
            coordinates: coords,
            type: 'Point',
          },
        },
      },
    },
    { name: 1, type: 1 }
  ).exec();

  return areas.sort((a, b) => b.priority - a.priority);
};

const Area = mongoose.models.Area || new mongoose.model('Area', AreaSchema);
export default Area;
