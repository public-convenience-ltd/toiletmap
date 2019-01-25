import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import styles from '../css/home.module.css';

class Home extends Component {
  render() {
    return (
      <div className={styles.wrapper}>
        <div className={styles.intro}>
          <Typography variant="h5" component="h1">
            Toilet Map Explorer exists to help people who want to know more
            about the data behind the{' '}
            <Link href={'https://www.toiletmap.org.uk'}>
              The Great British Public Toilet Map
            </Link>
            <p />
          </Typography>

          <Typography variant="h6" component="h1">
            You've come to the right place if you want to:
            <p />
            <ul>
              <li>Get a statistical overview of the data"</li>
              <li>Search for specific toilet data"</li>
              <li>Explore the data by UK Administrative Geography"</li>
              <li>Learn how to use our APIs to power your application"</li>
              <li>
                Learn about the Licensing terms under which you can use this
                data"
              </li>
            </ul>
            <p />
          </Typography>
          <Typography variant="h6" component="h1">
            If you're looking for the nearest Loo you're better off using{' '}
            <Link href={'https://www.toiletmap.org.uk'}>
              The Great British Public Toilet Map
            </Link>
            <p />
          </Typography>

          <Typography variant="h6" component="h1">
            If you're looking for information about our software please head on
            over to{' '}
            <Link href={'https://github.com/neontribe/gbptm'}>
              our Github repository
            </Link>
          </Typography>
        </div>
        <div className={styles.stats}>
          <Paper elevation={5} square="true">
            <Typography variant="h3" component="h1">
              Stats
            </Typography>
            <Typography variant="subtitle1" component="subtitle">
              This is where the link to stats will be
            </Typography>
          </Paper>
        </div>
        <div className={styles.search}>
          <Paper elevation={5} square="true">
            <Typography variant="h3" component="h1">
              Search
            </Typography>
            <Typography variant="subtitle1" component="subtitle">
              This is where the link to the search will be
            </Typography>
          </Paper>
        </div>
        <div className={styles.api}>
          <Paper elevation={5} square="true">
            <Typography variant="h3" component="h1">
              API
            </Typography>
            <Typography variant="subtitle1" component="subtitle">
              This is where the API info will be
            </Typography>
          </Paper>
        </div>
        <div className={styles.licensing}>
          <Paper elevation={5} square="true">
            <Typography variant="h3" component="h1">
              Licensing
            </Typography>
            <Typography variant="subtitle1" component="subtitle">
              This is where the licensing info will be
            </Typography>
          </Paper>
        </div>
      </div>
    );
  }
}

export default Home;
