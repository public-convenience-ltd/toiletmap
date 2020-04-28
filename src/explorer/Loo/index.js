import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import { useParams } from 'react-router-dom';

import Map from './Map';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import RaisedButton from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
// import TableCell from '@material-ui/core/TableCell';
// import TableRow from '@material-ui/core/TableRow';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { withStyles } from '@material-ui/core/styles';
import pickBy from 'lodash/pickBy';
import { DateTime } from 'luxon';

import { useAuth } from '../../Auth';

const LOO_DETAILS = loader('./looDetails.graphql');

const styles = (theme) => ({
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
    padding: theme.spacing(2),
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
  buttons: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
});

// const TableRowRender = (props) => {
//   const { data } = props;
//   return (
//     <>
//       {data.docs.map((loo) => {
//         return (
//           <TableRow key={loo[0]}>
//             <TableCell component="th" scope="row">
//               {loo[0]}
//             </TableCell>
//             <TableCell>
//               <div>
//                 <pre>{JSON.stringify(loo[1], null, 2)}</pre>
//               </div>
//             </TableCell>
//           </TableRow>
//         );
//       })}
//     </>
//   );
// };

// const TableColRender = () => {
//   return (
//     <TableRow>
//       <TableCell>Property</TableCell>
//       <TableCell>Value</TableCell>
//     </TableRow>
//   );
// };

function Loo(props) {
  const auth = useAuth();
  let { id } = useParams();
  let [expanded, setExpanded] = useState(false);
  const { loading, error, data } = useQuery(LOO_DETAILS, { variables: { id } });

  if (loading) return <p>Loading Loo Info</p>;
  if (error) return <p>Failed to fetch loo :(</p>;
  let loo = pickBy(data.loo, (val) => val !== null);
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item md={6} sm={12}>
          <Typography variant="h2" gutterBottom>
            {loo.name}
          </Typography>
          {loo.area.map(({ name, type }) => (
            <Typography key={name} variant="subtitle1" gutterBottom>
              {name} / {type}
            </Typography>
          ))}
          {auth.isAuthenticated() && (
            <div>
              <RaisedButton
                variant="contained"
                color="secondary"
                target="_blank"
                rel="noopener noreferer"
                href={`/loos/${loo.id}/edit`}
              >
                Edit
              </RaisedButton>
            </div>
          )}
        </Grid>
        <Grid container item md={6} sm={12}>
          <Paper style={{ height: '300px', width: '100%' }}>
            <Map {...loo.location} />
          </Paper>
        </Grid>

        <Grid container item sm={12}>
          <Grid item sm={12}>
            <Typography variant="h3" gutterBottom>
              Toilet Data
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Data attached to this loo.
            </Typography>
          </Grid>
          {/* <LooTable
            data={{
              docs: Object.entries(
                omit(loo, '__typename', 'location', 'area', 'reports')
              ),
            }}
            rowRender={TableRowRender}
            colRender={TableColRender}
          /> */}
        </Grid>

        <Grid container item sm={12}>
          <Grid item sm={12}>
            <Typography variant="h4" gutterBottom>
              Loo Reports
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Contributions towards this loo.
            </Typography>
          </Grid>
          <div>
            {loo.reports.map((value) => {
              let report = pickBy(value, (val) => val !== null);
              return (
                <ExpansionPanel
                  key={report.id}
                  expanded={expanded}
                  onChange={() => setExpanded(!expanded)}
                >
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Report from: {report.contributor}</Typography>
                    <Typography>
                      Created:{' '}
                      {DateTime.fromISO(report.createdAt).toLocaleString(
                        DateTime.DATETIME_MED
                      )}
                    </Typography>
                  </ExpansionPanelSummary>

                  <ExpansionPanelDetails>
                    {/* <LooTable
                      data={{
                        docs: Object.entries(
                          omit(
                            report,
                            'contributor',
                            'createdAt',
                            '__typename'
                          )
                        ),
                      }}
                      rowRender={TableRowRender}
                      colRender={TableColRender}
                    /> */}
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

export default withStyles(styles)(Loo);
