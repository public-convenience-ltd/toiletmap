import Box from '../components/Box';
import Icon from '../components/Icon';
import type { Loo } from '../api-client/graphql';

import {
  faTimes,
  faCheck,
  faPoundSign,
  faBaby,
  faToilet,
  faMale,
  faFemale,
  faChild,
  faKey,
  faCog,
  faQuestion,
} from '@fortawesome/free-solid-svg-icons';
import { faAccessibleIcon } from '@fortawesome/free-brands-svg-icons';

export const getFeatureValueIcon = (value?: boolean) => {
  if (value === null) {
    return (
      <Box title="Unknown">
        <Icon icon={faQuestion} color="tertiary" aria-label="Unknown" />
      </Box>
    );
  }

  return value ? (
    <Box title="Available">
      <Icon icon={faCheck} aria-label="Available" />
    </Box>
  ) : (
    <Box title="Unavailable">
      <Icon icon={faTimes} color="tertiary" aria-label="Unavailable" />
    </Box>
  );
};

export const getFeatures = (data: Loo) => [
  {
    icon: <Icon icon={faFemale} />,
    label: 'Women',
    valueIcon: getFeatureValueIcon(data.women),
  },
  {
    icon: <Icon icon={faMale} />,
    label: 'Men',
    valueIcon: getFeatureValueIcon(data.men),
  },
  {
    icon: <Icon icon={faAccessibleIcon} />,
    label: 'Accessible',
    valueIcon: getFeatureValueIcon(data.accessible),
  },
  ...(data.accessible
    ? [
        {
          icon: <Icon icon={faKey} />,
          label: 'RADAR Key',
          valueIcon: getFeatureValueIcon(data.radar),
        },
      ]
    : []),
  {
    icon: <Icon icon={faToilet} />,
    label: 'Gender Neutral',
    valueIcon: getFeatureValueIcon(data.allGender),
  },
  {
    icon: <Icon icon={faChild} />,
    label: 'Children',
    valueIcon: getFeatureValueIcon(data.children),
  },
  {
    icon: <Icon icon={faBaby} />,
    label: 'Baby Changing',
    valueIcon: getFeatureValueIcon(data.babyChange),
  },
  {
    icon: <Icon icon={faToilet} />,
    label: 'Urinal Only',
    valueIcon: getFeatureValueIcon(data.urinalOnly),
  },
  {
    icon: <Icon icon={faCog} />,
    label: 'Automatic',
    valueIcon: getFeatureValueIcon(data.automatic),
  },
  {
    icon: <Icon icon={faPoundSign} />,
    label: 'Free',
    valueIcon: getFeatureValueIcon(data.noPayment),
  },
];
