import React, { useState } from 'react';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import parseISO from 'date-fns/parseISO';
import lightFormat from 'date-fns/lightFormat';

import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import PropertyTable from './PropertyTable';

export default function ExpandableReport(props) {
  let [expanded, setExpanded] = useState(false);
  let report = pickBy(props.report, (val) => val !== null);
  let displayProperties = omit(
    report,
    'contributor',
    'createdAt',
    '__typename'
  );
  return (
    <Accordion
      key={report.id}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>Report from: {report.contributor}</Typography>
        <Typography>
          Created:{' '}
          {lightFormat(parseISO(report.createdAt), 'dd/MM/yyyy, hh:mm aa')}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <PropertyTable items={displayProperties} />
      </AccordionDetails>
    </Accordion>
  );
}
