import React from 'react';
import styled from '@emotion/styled';

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
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';

import Box from './Box';
import Button from './Button';
import Text from './Text';
import Spacer from './Spacer';
import Icon from './Icon';

const Grid = styled(Box)`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: -${({ theme }) => theme.space[3]}px;
`;

const FeaturesList = styled.ul`
  list-style: none;
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
      icon={<Icon icon={faDirections} />}
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
      icon: <Icon icon={faPoundSign} />,
      label: 'Free',
      valueIcon: <Icon icon={faCheck} />,
    },
    baby_changing: {
      icon: <Icon icon={faBaby} />,
      label: 'Baby Changing',
      valueIcon: <Icon icon={faCheck} />,
    },
    accessible: {
      icon: <Icon icon={faWheelchair} />,
      label: 'Accessible',
      valueIcon: <Icon icon={faCheck} />,
    },
    radar_key: {
      icon: <Icon icon={faKey} />,
      label: 'RADAR Key',
      valueIcon: <Icon icon={faCheck} />,
    },
    unisex: {
      icon: <Icon icon={faVenusMars} />,
      label: 'Unisex',
      valueIcon: <Icon icon={faCheck} />,
    },
    gender_neutral: {
      icon: <Icon icon={faGenderless} />,
      label: 'Gender Neutral',
      valueIcon: <Icon icon={faQuestion} color="tertiary" />,
    },
    automatic: {
      icon: <Icon icon={faCog} />,
      label: 'Automatic',
      valueIcon: <Icon icon={faTimes} color="tertiary" />,
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
        paddingRight={5}
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
                borderWidth={1}
                borderStyle="solid"
              >
                <Icon icon={faTimes} />
              </Box>
            </button>
          </Box>

          <Box width={['100%', '50%', '25%']} padding={3}>
            {titleFragment}
            <Spacer mb={2} />
            {getDirectionsFragment}
          </Box>

          <Box width={['100%', '50%', '25%']} padding={3}>
            <h2>
              <Text fontWeight="bold">Features</Text>
            </h2>
            <FeaturesList>
              {Object.entries(features).map(([key, feature]) => (
                <Box
                  as="li"
                  key={key}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center">
                    <Box width="20px" display="flex" justifyContent="center">
                      {feature.icon}
                    </Box>
                    <Spacer mr={2} />
                    {feature.label}
                  </Box>
                  {feature.valueIcon}
                </Box>
              ))}
            </FeaturesList>
          </Box>

          <Box width={['100%', '50%', '25%']} padding={3}>
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

          <Box width={['100%', '50%', '25%']} padding={3}>
            <Box display="flex" alignItems="center">
              <Icon icon={faClock} />
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
        <Box width={['100%', '50%', '25%']} padding={3}>
          {titleFragment}
        </Box>

        <Box width={['100%', '50%', '25%']} padding={3}>
          <Box display="flex" alignItems="center">
            <Icon icon={faClock} />
            <Spacer mr={1} />
            <h2>
              <Text fontWeight="bold">Opening Hours</Text>
            </h2>
          </Box>
          {data.opening || 'Unknown'}
        </Box>

        <Box
          width={['100%', '50%']}
          padding={3}
          display="flex"
          justifyContent={['flex-start', 'flex-start', 'flex-end']}
        >
          {getDirectionsFragment}
          <Spacer mr={2} />
          <Button
            variant="secondary"
            icon={<Icon icon={faList} />}
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
