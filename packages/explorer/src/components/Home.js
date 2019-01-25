import React, { Component } from 'react';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import styles from '../css/home.module.css';

import { withStyles } from '@material-ui/core/styles';

const HeadingTypography = withStyles({
  root: {
    padding: '1rem',
  },
})(Typography);

const SubTypography = withStyles({
  root: {
    paddingLeft: '1rem',
    paddinRight: '1rem',
    paddingBottom: '1rem',
  },
})(Typography);

class Home extends Component {
  render() {
    const { classes } = this.props;
    return (
      <div className={styles.main}>
        <div>
          <br />
          <Typography variant="h5" component="body1">
            Toilet Map Explorer exists to help people who want to know more
            about the data behind the{' '}
            <Link href={'https://www.toiletmap.org.uk'}>
              The Great British Public Toilet Map
            </Link>
          </Typography>
          <br />
          <Typography variant="body1" component="body2">
            You've come to the right place if you want to:
            <br />
            <div>
              <ul>
                <li>Get a statistical overview of the data</li>
                <li>Search for specific toilet data</li>
                <li>Explore the data by UK Administrative Geography</li>
                <li>Learn how to use our APIs to power your application</li>
                <li>
                  Learn about the Licensing terms under which you can use this
                  data
                </li>
              </ul>
            </div>
          </Typography>
          <Typography variant="body1" component="body2">
            If you're looking for the nearest Loo you're better off using{' '}
            <Link href={'https://www.toiletmap.org.uk'}>
              The Great British Public Toilet Map
            </Link>
          </Typography>
          <br />
          <Typography variant="body1" component="body2">
            If you're looking for information about our software please head on
            over to{' '}
            <Link href={'https://github.com/neontribe/gbptm'}>
              our Github repository
            </Link>
          </Typography>
          <br />
        </div>
        <Grid container spacing={16}>
          <Grid xs={12} md={4} item>
            <Paper elevation={5} square>
              <HeadingTypography variant="h5" component="body2">
                Stats
              </HeadingTypography>
              <SubTypography variant="body1" component="body2">
                You can view a selection of high level statistics{' '}
                <Link href={'./statistics'}>here</Link>
              </SubTypography>
            </Paper>
          </Grid>

          <Grid xs={12} md={4} item>
            <Paper elevation={5} square>
              <HeadingTypography variant="h5" component="h3">
                Search
              </HeadingTypography>
              <SubTypography variant="body1" component="body2">
                You can search for toilet data using keyword searches{' '}
                <Link href={'./search'}>here</Link>
              </SubTypography>
            </Paper>
          </Grid>

          <Grid xs={12} md={4} item>
            <Paper elevation={5} square>
              <HeadingTypography variant="h5" component="h3">
                Licensing
              </HeadingTypography>
              <SubTypography variant="body1" component="body2">
                <br />
              </SubTypography>
            </Paper>
          </Grid>

          <Grid xs={12} item>
            <Paper elevation={5} square>
              <HeadingTypography variant="h5" component="h3">
                API
              </HeadingTypography>
              <SubTypography variant="body1" component="body2">
                The Toilet Map API is expressed in{' '}
                <Link href={'https://graphql.org/'}>GraphQL</Link>. The endpoint
                is served at `https://www.toiletmap.org.uk/graphql`.You can{' '}
                <Link href={'/voyager'}>visualise the schema</Link>, or{' '}
                <Link href={'/graphql'}>experiment with queries</Link>. To
                conduct mutations, or to get un-redacted results for certain
                fields you'll need to supply some credentials in an
                `Authorization` header. Please get in touch if you'd like to
                know how to achieve that. Please familiarize yourself with the
                terms under which our data is licensed before making use of it.
              </SubTypography>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default Home;
