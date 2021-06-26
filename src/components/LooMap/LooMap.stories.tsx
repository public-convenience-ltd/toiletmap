import { Meta } from '@storybook/react';
import { useEffect } from 'react';
import LooMap from '.';
import { useMapState } from '../MapState';

export default {
  name: 'LooMap',
  component: LooMap,
  args: {
    data: {
      loo: {
        __typename: 'Loo',
        id: '1b2a8eca18a105b40607fb79',
        createdAt: '2016-09-14T16:04:03.296Z',
        updatedAt: '2019-07-04T09:44:55.881Z',
        verifiedAt: null,
        active: true,
        location: {
          __typename: 'Point',
          lat: 51.501194503134535,
          lng: -0.12600481510162356,
        },
        name: 'Westminster Underground Station (in subway)',
        openingTimes: null,
        accessible: false,
        men: true,
        women: true,
        allGender: null,
        babyChange: true,
        children: null,
        urinalOnly: null,
        radar: null,
        automatic: false,
        noPayment: true,
        paymentDetails: '£0.50',
        notes:
          'Accessible from underground station but best entrance is the tunnel at corner of Bridge street and Parliament Street',
        removalReason: null,
        attended: true,
      },
    },
  },
} as Meta;

export const Default = (props) => (
  <LooMap center={{ lat: 51.5072, lng: 0.1276 }} zoom={8} {...props}></LooMap>
);

export const Crosshair = (props) => (
  <LooMap
    center={{ lat: 51.5072, lng: 0.1276 }}
    zoom={8}
    showCrosshair={true}
    {...props}
  ></LooMap>
);

export const WithAccessibilityOverlay = (props) => (
  <LooMap
    center={{ lat: 51.5072, lng: 0.1276 }}
    zoom={8}
    showAccessibilityOverlay={true}
    {...props}
  ></LooMap>
);

export const WithCurrentLooMarker = (props) => {
  const [mapState, setMapState] = useMapState();
  useEffect(() => {
    setMapState({ center: props.data.loo.location, focus: props.data.loo });
  }, [mapState.focus, props.data.loo, props.data.loo.location, setMapState]);
  return (
    <LooMap center={{ lat: 51.5072, lng: 0.1276 }} zoom={8} {...props}></LooMap>
  );
};
