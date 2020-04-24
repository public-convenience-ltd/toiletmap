import React from 'react';
import _ from 'lodash';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { Link, useRouteMatch } from 'react-router-dom';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';

import PeopleIcon from '@material-ui/icons/People';
import NameIcon from '@material-ui/icons/TextFields';
import CityIcon from '@material-ui/icons/LocationCity';
import ClockIcon from '@material-ui/icons/AccessTime';

import TimeAgo from 'timeago-react';

const MISSING_MESSAGE = 'Not Recorded';
const navigate = () => null;

export default function ResultRow({loo}) {
  const { path } = useRouteMatch();
  const { name, type, opening, area } = loo;
  const contributors = loo.reports.reduce((current, next) => {
    current.push(next.contributor);
    return current;
  }, []);

  return (
    <TableRow>
      <TableCell component="th" scope="row">
        <Link to={`./loo/${loo.id}`}>
          <Chip
            avatar={
              <Avatar>
                <NameIcon />
              </Avatar>
            }
            label={name || MISSING_MESSAGE}
            color={name ? 'primary' : 'secondary'}
            variant="default"
            clickable
          />
        </Link>
      </TableCell>
      <TableCell>
        {area.map((val) => {
          return (
            <React.Fragment key={val.name}>
              <Chip
                avatar={
                  <Avatar>
                    <CityIcon />
                  </Avatar>
                }
                label={val.name}
                color={val.name ? 'primary' : 'secondary'}
                variant="default"
                onClick={(e) => {
                  navigate(`search?area_name=${val.name}`);
                }}
                clickable
              />
              <Chip
                label={val.type}
                color={val.type ? 'primary' : 'secondary'}
                variant="outlined"
              />
            </React.Fragment>
          );
        })}
      </TableCell>
      <TableCell>
        <Chip
          avatar={
            <Avatar>
              <PeopleIcon />
            </Avatar>
          }
          label={
            type
              ? _.startCase(_.toLower(type.replace(/_/g, ' ')))
              : MISSING_MESSAGE
          }
          color={type ? 'primary' : 'secondary'}
          variant="default"
          clickable
        />
      </TableCell>

      <TableCell>
        {_.uniq(contributors).map((attr, i) => {
          return (
            <Chip
              key={attr + i}
              avatar={
                <Avatar>
                  <PeopleIcon />
                </Avatar>
              }
              label={attr || MISSING_MESSAGE}
              color={attr ? 'primary' : 'secondary'}
              variant="default"
              onClick={(event) => {
                navigate(`search?contributors=${attr}`);
              }}
              clickable
            />
          );
        })}
      </TableCell>

      <TableCell>
        <Chip
          avatar={
            <Avatar>
              <ClockIcon />
            </Avatar>
          }
          label={
            <TimeAgo datetime={loo.updatedAt} /> || MISSING_MESSAGE
          }
          color={loo.updatedAt ? 'primary' : 'secondary'}
          variant="default"
          onClick={(event) => {
            const dateUpdated = new Date(loo.updatedAt);
            const year = dateUpdated.getFullYear();
            const month = (
              '0' +
              (dateUpdated.getMonth() + 1)
            ).slice(-2);
            const day = ('0' + dateUpdated.getDate()).slice(-2);
            const updateString = `${year}-${month}-${day}`;
            navigate(`search?from_date=${updateString}`);
          }}
          clickable
        />
      </TableCell>
      <TableCell>
        <Chip
          label={opening || MISSING_MESSAGE}
          color={opening ? 'primary' : 'secondary'}
          variant="outlined"
        />
      </TableCell>
    </TableRow>
  );
}
