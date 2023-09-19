import Box from '../components/Box';
import Icon from '../design-system/components/Icon';
import type { Loo } from '../api-client/graphql';

export const getFeatureValueIcon = (value?: boolean) => {
  if (value === null) {
    return (
      <Box title="Unknown" color="tertiary">
        <Icon icon="question" size="medium" aria-label="Unknown" />
      </Box>
    );
  }

  return value ? (
    <Box title="Available">
      <Icon icon="check" size="medium" aria-label="Available" />
    </Box>
  ) : (
    <Box title="Unavailable" color="tertiary">
      <Icon icon="xmark" size="medium" aria-label="Unavailable" />
    </Box>
  );
};

export const getFeatures = (data: Loo) => [
  {
    icon: <Icon icon="person-dress" size="medium" />,
    label: 'Women',
    valueIcon: getFeatureValueIcon(data.women),
  },
  {
    icon: <Icon icon="person" size="medium" />,
    label: 'Men',
    valueIcon: getFeatureValueIcon(data.men),
  },
  {
    icon: <Icon icon="wheelchair-move" size="medium" />,
    label: 'Accessible',
    valueIcon: getFeatureValueIcon(data.accessible),
  },
  ...(data.accessible
    ? [
        {
          icon: <Icon icon="key" size="medium" />,
          label: 'RADAR Key',
          valueIcon: getFeatureValueIcon(data.radar),
        },
      ]
    : []),
  {
    icon: <Icon icon="toilet" size="medium" />,
    label: 'Gender Neutral',
    valueIcon: getFeatureValueIcon(data.allGender),
  },
  {
    icon: <Icon icon="child" size="medium" />,
    label: 'Children',
    valueIcon: getFeatureValueIcon(data.children),
  },
  {
    icon: <Icon icon="baby" size="medium" />,
    label: 'Baby Changing',
    valueIcon: getFeatureValueIcon(data.babyChange),
  },
  {
    icon: <Icon icon="toilet" size="medium" />,
    label: 'Urinal Only',
    valueIcon: getFeatureValueIcon(data.urinalOnly),
  },
  {
    icon: <Icon icon="gear" size="medium" />,
    label: 'Automatic',
    valueIcon: getFeatureValueIcon(data.automatic),
  },
  {
    icon: <Icon icon="sterling-sign" size="medium" />,
    label: 'Free',
    valueIcon: getFeatureValueIcon(data.noPayment),
  },
];
