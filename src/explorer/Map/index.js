import React, { useState } from 'react';
import Chloropleth from './Chloropleth';
import ReactTooltip from 'react-tooltip';
import { Grid, Select, MenuItem, InputLabel } from '@material-ui/core';

const DEFAULT_OPTIONS = {
  statistic: 'activeLoos',
  display: 'number',
};

function Options(props) {
  const getCallback = (optionName) => {
    return (e) => props.onOptionChange(optionName, e.target.value);
  };

  return (
    <Grid container spacing={4}>
      <Grid item container spacing={1}>
        <Grid item>
          <InputLabel htmlFor="statistic">Statistic: </InputLabel>
        </Grid>
        <Grid item>
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
      </Grid>
      <Grid item container spacing={1}>
        <Grid item>
          <InputLabel htmlFor="display">Display: </InputLabel>
        </Grid>
        <Grid item>
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
    </Grid>
  );
}

function Map(props) {
  const [content, setContent] = useState('');
  const [options, setOptions] = useState(DEFAULT_OPTIONS);

  const updateOptions = (opt, newVal) => {
    setOptions((prevOptions) => {
      const newOpts = { ...prevOptions };
      newOpts[opt] = newVal;
      return newOpts;
    });
  };

  return (
    <div style={{ margin: '1rem' }}>
      <Grid container>
        <Grid item xs>
          <Chloropleth
            width={800}
            height={750}
            options={options}
            setTooltipContent={setContent}
          />
        </Grid>
        <Grid item xs>
          <Options onOptionChange={updateOptions} />
        </Grid>
      </Grid>
      <ReactTooltip html={true}>{content}</ReactTooltip>
    </div>
  );
}

export default Map;
