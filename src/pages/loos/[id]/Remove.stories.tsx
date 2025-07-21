import { Meta } from '@storybook/react';
import React from 'react';

import SiteLayout from '../../../design-system/components/SiteLayout';
import RemovePage from '../../../pages/loos/[id]/remove.page';

export default {
  name: 'Pages',
  component: RemovePage,
  args: {
    user: {
      email: 'hi@email.com',
    },
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

/**
 * Remove page
 */
export const Remove = (props) => {
  return <SiteLayout Component={RemovePage} pageProps={props} />;
};
