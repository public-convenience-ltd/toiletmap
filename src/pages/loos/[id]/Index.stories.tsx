import React from 'react';
import { Meta } from '@storybook/react';
import { PageFindLooByIdComp } from '../../../api-client/page';
import { default as LooPageNext } from '../../../pages/loos/[id]/index.page';
import Main from '../../../components/Main';
import LooMap from '../../../components/LooMap/LooMapLoader';

export default {
  name: 'Pages',
  component: LooPageNext,
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
} as Meta<PageFindLooByIdComp>;

/**
 * Loo
 */
export const Loo = (props) => {
  return <Main Component={LooPageNext} pageProps={props} map={<LooMap />} />;
};
