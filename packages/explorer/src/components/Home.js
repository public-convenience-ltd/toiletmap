import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import ListItemText from '@material-ui/core/ListItemText';
import styles from '../css/home.module.css';

class Home extends Component {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.intro}>
          <p>
            Toilet Map Explorer exists to help people who want to know more
            about the data behind the{' '}
            <a
              href="https://www.toiletmap.org.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Great British Public Toilet Map
            </a>
          </p>

          <p>You've come to the right place if you want to:</p>
          <ListItemText primary="Get a statistical overview of the data" />
          <ListItemText primary="Search for specific toilet data" />
          <ListItemText primary="Explore the data by UK Administrative Geography" />
          <ListItemText primary="Learn how to use our APIs to power your application" />
          <ListItemText primary="Learn about the Licensing terms under which you can use this data" />
          <p>
            If you're looking for the nearest Loo you're better off using{' '}
            <a
              href="https://www.toiletmap.org.uk"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Great British Public Toilet Map
            </a>
          </p>

          <p>
            If you're looking for information about our software please head on
            over to [our Github repository](https://github.com/neontribe/gbptm).
          </p>
        </div>
        <div className={styles.stats}>
          <Paper>
            <h1>Stats</h1>
            <p>This is where the link to stats will be</p>
          </Paper>
        </div>
        <div className={styles.search}>
          <Paper>
            <h1>Search</h1>
            <p>This is where the link to the search will be</p>
          </Paper>
        </div>
        <div className={styles.api}>
          <Paper>
            <h1>API</h1>
            <p>This is where the API info will be</p>
          </Paper>
        </div>
        <div className={styles.licensing}>
          <Paper>
            <h1>Licensing</h1>
            <p>This is where the licensing info will be</p>
          </Paper>
        </div>
      </div>
    );
  }
}

export default Home;
