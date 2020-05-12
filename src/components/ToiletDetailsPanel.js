import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';
import {
  faDirections,
  faList,
  faTimes,
  faCheck,
  faPoundSign,
  faBaby,
  faWheelchair,
  faVenusMars,
  faGenderless,
  faKey,
  faCog,
} from '@fortawesome/free-solid-svg-icons';

import Box from './Box';
import Button from './Button';
import Text from './Text';
import styled from '@emotion/styled';
import Spacer from './Spacer';

const Grid = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -${({ theme }) => theme.space[2]}px;
`;

const ToiletDetailsPanel = ({ data, isLoading }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // return to default view if isLoading or data changes (e.g. a user has selected a new marker)
  React.useEffect(() => {
    setIsExpanded(false);
  }, [isLoading, data]);

  if (isLoading) {
    return (
      <Box
        width="100%"
        color="primary"
        bg="white"
        minHeight={100}
        borderTopLeftRadius={4}
        borderTopRightRadius={4}
        padding={4}
        display="flex"
        alignItems="center"
      >
        Loading toilet...
      </Box>
    );
  }

  const titleFragment = (
    <h1>
      <Text fontWeight="bold" fontSize={4}>
        {data.name || 'Unnamed Toilet'}
      </Text>
    </h1>
  );

  const getDirectionsFragment = (
    <Button
      icon={<FontAwesomeIcon icon={faDirections} />}
      as="a"
      href={`https://maps.apple.com/?dirflg=w&daddr=${[
        data.location.lat,
        data.location.lng,
      ]}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      Get directions
    </Button>
  );

  const features = {
    free: {
      icon: <FontAwesomeIcon icon={faPoundSign} />,
      label: 'Free',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    baby_changing: {
      icon: <FontAwesomeIcon icon={faBaby} />,
      label: 'Baby Changing',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    accessible: {
      icon: <FontAwesomeIcon icon={faWheelchair} />,
      label: 'Accessible',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    radar_key: {
      icon: <FontAwesomeIcon icon={faKey} />,
      label: 'RADAR Key',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    unisex: {
      icon: <FontAwesomeIcon icon={faVenusMars} />,
      label: 'Unisex',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    gender_neutral: {
      icon: <FontAwesomeIcon icon={faGenderless} />,
      label: 'Gender Neutral',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
    automatic: {
      icon: <FontAwesomeIcon icon={faCog} />,
      label: 'Automatic',
      valueIcon: <FontAwesomeIcon icon={faCheck} />,
    },
  };

  if (isExpanded) {
    return (
      <Box
        width="100%"
        color="primary"
        bg="white"
        minHeight={100}
        borderTopLeftRadius={4}
        borderTopRightRadius={4}
        padding={4}
        as="section"
      >
        <Grid>
          <Box position="absolute" top={30} right={30}>
            <button
              type="button"
              aria-label="Close toilet details"
              onClick={() => setIsExpanded(false)}
            >
              <Box
                height={26}
                width={26}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius={13}
                borderColor="primary"
                borderWidth={2}
                borderStyle="solid"
              >
                <FontAwesomeIcon icon={faTimes} />
              </Box>
            </button>
          </Box>

          <Box width={['100%', '50%', '25%']} padding={2}>
            {titleFragment}
            <Spacer mb={2} />
            {getDirectionsFragment}
          </Box>

          <Box width={['100%', '50%', '25%']} padding={2}>
            <h2>
              <Text fontWeight="bold">Features</Text>
            </h2>
            <ul>
              {Object.entries(features).map(([key, feature]) => (
                <li key={key}>
                  {feature.icon} {feature.label} {feature.valueIcon}
                </li>
              ))}
            </ul>
          </Box>

          <Box width={['100%', '50%', '25%']} padding={2}>
            <h2>
              <Text fontWeight="bold">Notes</Text>
            </h2>
            <div>
              {data.notes &&
                data.notes
                  .split('\n')
                  .map((string, i) => <p key={i}>{string}</p>)}
            </div>
          </Box>

          <Box width={['100%', '50%', '25%']} padding={2}>
            <Box display="flex" alignItems="center">
              <FontAwesomeIcon icon={faClock} />
              <Spacer mr={1} />
              <h2>
                <Text fontWeight="bold">Opening Hours</Text>
              </h2>
            </Box>
            {data.opening || 'Unknown'}
          </Box>
        </Grid>
      </Box>
    );
  }

  return (
    <Box
      width="100%"
      color="primary"
      bg="white"
      minHeight={100}
      borderTopLeftRadius={4}
      borderTopRightRadius={4}
      padding={4}
      as="section"
    >
      <Grid>
        <Box width={['100%', '50%', '25%']} padding={2}>
          {titleFragment}
        </Box>

        <Box width={['100%', '50%', '25%']} padding={2}>
          <Box display="flex" alignItems="center">
            <FontAwesomeIcon icon={faClock} />
            <Spacer mr={1} />
            <h2>
              <Text fontWeight="bold">Opening Hours</Text>
            </h2>
          </Box>
          {data.opening || 'Unknown'}
        </Box>

        <Box
          width={['100%', '50%']}
          padding={2}
          display="flex"
          justifyContent={['flex-start', 'flex-start', 'flex-end']}
        >
          {getDirectionsFragment}
          <Spacer mr={2} />
          <Button
            variant="secondary"
            icon={<FontAwesomeIcon icon={faList} />}
            onClick={() => setIsExpanded(true)}
          >
            More details
          </Button>
        </Box>
      </Grid>
    </Box>
  );
};

export default ToiletDetailsPanel;
