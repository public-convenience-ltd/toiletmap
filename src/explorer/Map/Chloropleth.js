import React, { memo, useState, useEffect } from 'react';
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
import ReactTooltip from 'react-tooltip';

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
  const [geography, setGeography] = useState();
  const [areaSizes, setAreaSizes] = useState();
  const { loading: loadingAreas, data: areasData } = useQuery(GET_AREAS);
  const { data: statsData } = useQuery(GET_STATS);
  const { options: opts } = props;

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

  // We need to do some transforms when we finally recieve the TopoJSON data
  useEffect(() => {
    if (!areasData) {
      return;
    }

    // Convert to valid TopoJSON form
    const newGeography = cloneDeep(areasData.mapAreas);
    const newObjects = {};
    newGeography.objects.forEach((obj) => {
      obj.value.geometries.forEach((geom) => {
        geom.properties = JSON.parse(geom.properties);
      });
      newObjects[obj.name] = obj.value;
    });
    newGeography.objects = newObjects;
    setGeography(newGeography);
  }, [areasData]);

  // When the map can finally render, we need to rebuild tooltips to make sure that they are
  // bound correctly.
  useEffect(() => {
    ReactTooltip.rebuild();
  }, [geography]);

  // Setup colour scale
  useEffect(() => {
    if (!statsData || !geography || opts.display !== 'density') {
      return;
    }

    let areaSizes = {};
    Object.keys(geography.objects).forEach((objName) => {
      const obj = geography.objects[objName];
      obj.geometries.forEach((geom) => {
        areaSizes[geom.properties.name] = geom.properties.areaSize / 1000000;
      });
    });
    setAreaSizes(areaSizes);
  }, [opts, geography, statsData]);

  let colourScale;
  if (statsData) {
    if (areaSizes && opts.display === 'density') {
      colourScale = scaleQuantile()
        .domain(
          statsData.areaStats.map((s) => {
            console.log(s[opts.statistic] / areaSizes[s.area.name]);
            return s[opts.statistic] / areaSizes[s.area.name];
          })
        )
        .range(SCALE);
    } else {
      colourScale = scaleQuantile()
        .domain(statsData.areaStats.map((s) => s[opts.statistic]))
        .range(SCALE);
    }
  }

  const renderMap = () => {
    if (!geography) {
      return <></>;
    }

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
            scale: 2800,
          }}
          width={props.width}
          height={props.height}
          data-tip=""
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={setPosition}
          >
            <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const { name, areaSize } = geo.properties;

                  let value;
                  let unit;
                  if (opts.display === 'number') {
                    value = transformedStats[name][opts.statistic];
                    unit = 'loos';
                  } else if (opts.display === 'density') {
                    value = (
                      transformedStats[name][opts.statistic] /
                      (areaSize / 1000000)
                    ).toFixed(5);
                    unit = 'loos/km<sup>2</sup>';
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      strokeWidth="0.05"
                      stroke="white"
                      fill={value ? colourScale(value) : '#aaa'}
                      onMouseEnter={() =>
                        props.setTooltipContent(`${name} - ${value} ${unit}`)
                      }
                      onMouseLeave={() => props.setTooltipContent('')}
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

export default memo(Chloropleth);
