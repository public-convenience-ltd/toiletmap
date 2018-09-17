import React, { Component } from 'react';
import api from '@neontribe/api-client';
import classNames from 'classnames';
import LooTile from './LooTile';
import LooTable from './table/LooTable';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
  looTile: {
    height: '100%',
    width: 'auto',
  },
  mapTile: {
    width: '100%',
    height: 300,
  },
  appBarSpacer: theme.mixins.toolbar,
  root: {
    flexGrow: 1,
    marginLeft: '2%',
    marginRight: '2%',
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: '33.33%',
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
  expansionRoot: {
    width: '100%',
  },
});

const TableRowRender = props => {
  const { data } = props;
  return (
    <>
      {data.docs.map(loo => {
        return (
          <TableRow key={loo[0]}>
            <TableCell component="th" scope="row">
              {loo[0]}
            </TableCell>
            <TableCell>
              <div>
                <pre>{JSON.stringify(loo[1], null, 2)}</pre>
              </div>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
};

const TableColRender = () => {
  return (
    <TableRow>
      <TableCell>Property</TableCell>
      <TableCell>Value</TableCell>
    </TableRow>
  );
};

class LooView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingData: true,
      expanded: null,
      loo: {},
    };

    this.fetchLooData = this.fetchLooData.bind(this);
  }

  componentDidMount() {
    this.fetchLooData();
  }

  async fetchLooData() {
    this.setState({ loadingData: true });
    const result = await api.findLooById(this.props.looId, {
      populateReports: true,
    });
    this.setState({
      loadingData: false,
      loo: {
        ...result,
      },
    });
  }

  handleChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false,
    });
  };

  render() {
    const { loo, loadingData, expanded } = this.state;
    const { classes } = this.props;

    if (loadingData) {
      return <p>Loading Loo Info</p>;
    }

    return (
      <div className={classes.root}>
        <div className={classes.appBarSpacer} />
        <Grid container spacing={24}>
          <Grid item md={6} sm={12}>
            <Typography variant="display1" gutterBottom>
              {loo.properties.name}
            </Typography>
            {loo.properties.area.map(val => {
              return (
                <Typography key={val._id} variant="subheading" gutterBottom>
                  {val.name} / {val.type}
                </Typography>
              );
            })}
          </Grid>
          <Grid container item md={6} sm={12}>
            <Paper className={classNames(classes.paper, classes.mapTile)}>
              <LooTile
                className={classes.looTile}
                loo={loo}
                mapProps={{
                  scrollWheelZoom: true,
                  dragging: true,
                }}
              />
            </Paper>
          </Grid>

          <Grid container item sm={12}>
            <Grid item sm={12}>
              <Typography variant="display1" gutterBottom>
                Toilet Data
              </Typography>
              <Typography variant="subheading" gutterBottom>
                Data attached to this loo.
              </Typography>
            </Grid>
            <LooTable
              data={{
                docs: Object.entries(loo.properties),
              }}
              rowRender={TableRowRender}
              colRender={TableColRender}
            />
          </Grid>

          <Grid container item sm={12}>
            <Grid item sm={12}>
              <Typography variant="display1" gutterBottom>
                Loo Reports
              </Typography>
              <Typography variant="subheading" gutterBottom>
                Contributions towards this loo.
              </Typography>
            </Grid>
            <div className={classes.expansionRoot}>
              {loo.reports.map(value => {
                return (
                  <ExpansionPanel
                    key={value._id}
                    expanded={expanded === value._id}
                    onChange={this.handleChange(value._id)}
                  >
                    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography className={classes.heading}>
                        Report from: {value.attribution}
                      </Typography>
                      <Typography className={classes.secondaryHeading}>
                        Created: {value.updatedAt}
                      </Typography>
                    </ExpansionPanelSummary>

                    <ExpansionPanelDetails>
                      <LooTable
                        data={{
                          docs: Object.entries(value.properties),
                        }}
                        rowRender={TableRowRender}
                        colRender={TableColRender}
                      />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                );
              })}
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(styles)(LooView);
