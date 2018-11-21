function LooList(loos) {
  this.type = 'FeatureCollection';
  this.features = loos || [];
}

LooList.prototype.toJSON = function() {
  return this;
};

LooList.prototype.toGeoJSON = function() {
  return this.toJSON();
};

module.exports = LooList;
