import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import {
  ComposableMap,
  ZoomableGroup,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { loader } from 'graphql.macro';
import cloneDeep from 'lodash/cloneDeep';
import { scaleQuantile } from 'd3-scale';

const GET_AREAS = loader('./getAreas.graphql');
const GET_STATS = loader('./getStats.graphql');

const SCALE = [
  '#4A1B5F',
  '#4B2475',
  '#462C8B',
  '#3C35A0',
  '#3f51b5',
  '#577BC1',
  '#6FA0CC',
  '#88C0D6',
  '#A2DAE0',
  '#BCEAE6',
  '#D6F3EB',
];
SCALE.reverse();

function Chloropleth(props) {
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });
  const [transformedStats, setTransformedStats] = useState();
  const { loading: loadingAreas, data: areasData } = useQuery(GET_AREAS);
  const { data: statsData } = useQuery(GET_STATS);

  useEffect(() => {
    if (!statsData) {
      return;
    }

    const transformed = {};
    statsData.areaStats.forEach((stat) => {
      transformed[stat.area.name] = stat;
    });
    setTransformedStats(transformed);
  }, [statsData]);

  let colourScale;
  if (statsData) {
    colourScale = scaleQuantile()
      .domain(statsData.areaStats.map((s) => s[props.stat]))
      .range(SCALE);
  }

  const renderMap = () => {
    const geography = cloneDeep(areasData.mapAreas);

    // Convert to valid TopoJSON form
    const newObjects = {};
    geography.objects.forEach((obj) => {
      obj.value.geometries.forEach((geom) => {
        geom.properties = JSON.parse(geom.properties);
      });
      newObjects[obj.name] = obj.value;
    });
    geography.objects = newObjects;

    return (
      <div
        style={{
          width: `${props.width}px`,
          height: `${props.height}px`,
          background: '#c9cde6',
        }}
      >
        <ComposableMap
          projectionConfig={{
            rotate: [0.0, -55.0, 0],
            scale: 2700,
          }}
          width={props.width}
          height={props.height}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={setPosition}
          >
            <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { name } = geo.properties;
                  const value = transformedStats[name][props.stat];
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      strokeWidth="0"
                      stroke="white"
                      fill={value ? colourScale(value) : '#aaa'}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    );
  };

  return (
    <>
      {loadingAreas || !areasData || !transformedStats ? (
        <h1>Loading...</h1>
      ) : (
        renderMap()
      )}
    </>
  );
}

export default Chloropleth;
