import React, { useState, useEffect } from 'react';
import Chloropleth from './Chloropleth';
import ReactTooltip from 'react-tooltip';
import { Paper, Grid, Select, MenuItem, InputLabel } from '@material-ui/core';

function convertRemToPixels(rem) {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

const DEFAULT_OPTIONS = {
  statistic: 'activeLoos',
  display: 'density',
};

function Options(props) {
  const getCallback = (optionName) => {
    return (e) => props.onOptionChange(optionName, e.target.value);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <Grid container spacing={4}>
        <Grid item>
          <InputLabel htmlFor="statistic">Statistic: </InputLabel>
          <Select
            name={'statistic'}
            onChange={getCallback('statistic')}
            defaultValue={DEFAULT_OPTIONS.statistic}
          >
            <MenuItem value={'activeLoos'} key={0}>
              Active Loos
            </MenuItem>
            <MenuItem value={'totalLoos'} key={1}>
              All Loos
            </MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <InputLabel htmlFor="display">Display: </InputLabel>
          <Select
            name="display"
            onChange={getCallback('display')}
            defaultValue={DEFAULT_OPTIONS.display}
          >
            <MenuItem value={'number'} key={0}>
              by number
            </MenuItem>
            <MenuItem value={'density'} key={1}>
              by density
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
    </div>
  );
}

function Map(props) {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [mapWidth, setMapWidth] = useState(640);

  const updateOptions = (opt, newVal) => {
    setOptions((prevOptions) => {
      const newOpts = { ...prevOptions };
      newOpts[opt] = newVal;
      return newOpts;
    });
  };

  useEffect(() => {
    const resizeListener = () => {
      if (window.innerWidth < 640) {
        setMapWidth(window.innerWidth - 2 * convertRemToPixels(1));
      } else {
        setMapWidth(
          Math.ceil((window.innerWidth - 2 * convertRemToPixels(1)) / 2)
        );
      }
    };
    resizeListener();
    window.addEventListener('resize', resizeListener);
    return () => window.removeEventListener('resize', resizeListener);
  }, []);

  const mapHeight = 600;

  return (
    <div style={{ margin: '1rem' }}>
      <Grid container>
        <Grid item xs>
          <Paper elevation={1} style={{ width: mapWidth, height: mapHeight }}>
            <Chloropleth
              width={mapWidth}
              height={750}
              options={options}
              setTooltipContent={setContent}
            />
          </Paper>
        </Grid>
        <Grid item xs>
          <Paper elevation={0} variant="outlined">
            <Options onOptionChange={updateOptions} />
          </Paper>
        </Grid>
      </Grid>
      <ReactTooltip html={true}>{content}</ReactTooltip>
    </div>
  );
}

export default Map;
