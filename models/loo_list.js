'use strict';

function LooList(loos){
    this.type = 'FeatureCollection';
    this.features = loos || [];
}

LooList.prototype.toJSON = function(){
    return this;
};

LooList.prototype.toHAL = function(){
    return this.toJSON();
};

LooList.prototype.toGeoJSON = function(){
    return this.toJSON();
};

LooList.prototype.toCSV = function(){
    return '';
};

module.exports = LooList;

