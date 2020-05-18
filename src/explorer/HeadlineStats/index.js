import React from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';

import Counter from './Counter';
import LooIcon from '@material-ui/icons/Wc';
import RemoveIcon from '@material-ui/icons/Delete';
import StatIcon from '@material-ui/icons/Assessment';
import RefreshIcon from '@material-ui/icons/Refresh';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import { Doughnut } from 'react-chartjs-2';

const STATS = loader('./stats.graphql');

const RED = '#FF6384';
const GREEN = '#36A2EB';
const YELLOW = '#FFCE56';
const H_RED = '#FF6384';
const H_GREEN = '#36A2EB';
const H_YELLOW = '#FFCE56';

function makeDoughnutData(labels, data) {
  return {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor: [GREEN, RED, YELLOW],
        hoverBackgroundColor: [H_GREEN, H_RED, H_YELLOW],
      },
    ],
  };
}

function HeadlineStats() {
  const { loading, error, data } = useQuery(STATS);

  if (loading) return null;
  if (error) throw error;

  let { activeLoos, babyChanging, accessibleLoos } = data.proportions;

  const getNames = (proportions) => {
    return proportions.map((chunk) => {
      return chunk.name;
    });
  };

  const getValues = (proportions) => {
    return proportions.map((chunk) => {
      return chunk.value;
    });
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexFlow: 'row wrap',
          justifyContent: 'space-around',
          padding: '0.5px',
        }}
      >
        <Counter
          value={data.counters.activeLoos}
          icon={<LooIcon />}
          label="Active Loos"
        />
        <Counter
          value={data.counters.inactiveLoos}
          icon={<RemoveIcon />}
          label="Removed Loos"
        />
        <Counter
          value={data.counters.totalLoos}
          icon={<StatIcon />}
          label="Total Reports"
        />
        <Counter
          value={data.counters.multipleReports}
          icon={<RefreshIcon />}
          label="Multiple Reports"
        />
        <Counter
          value={data.counters.removalReports}
          icon={<RemoveIcon />}
          label="Removal Reports"
        />
      </div>

      <GridList cols={2} cellHeight={200} padding={1}>
        <GridListTile
          key="Subheader"
          cols={2}
          style={{ height: 'auto' }}
        ></GridListTile>
        <GridListTile rows={2} cols={1}>
          <Doughnut
            height={150}
            data={makeDoughnutData(getNames(activeLoos), getValues(activeLoos))}
          />
          <GridListTileBar
            titlePosition="bottom"
            title="Closed Loos"
            subtitle="Loos marked as closed"
          />
        </GridListTile>
        <GridListTile rows={2} cols={1}>
          <Doughnut
            height={150}
            data={makeDoughnutData(
              getNames(accessibleLoos),
              getValues(accessibleLoos)
            )}
          />
          <GridListTileBar
            titlePosition="bottom"
            title="Accessible Loos"
            subtitle="Loos marked as accessible"
          />
        </GridListTile>
        <GridListTile rows={2} cols={1}>
          <Doughnut
            height={150}
            data={makeDoughnutData(
              getNames(babyChanging),
              getValues(babyChanging)
            )}
          />
          <GridListTileBar
            titlePosition="bottom"
            title="Baby Changing"
            subtitle="Loos with baby changing facilities"
          />
        </GridListTile>
      </GridList>
    </div>
  );
}

export default HeadlineStats;
