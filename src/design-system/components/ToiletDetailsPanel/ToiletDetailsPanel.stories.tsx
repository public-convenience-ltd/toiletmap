import { Meta } from '@storybook/react';
import ToiletDetailsPanel from './ToiletDetailsPanel';

const meta: Meta<typeof ToiletDetailsPanel> = {
  title: 'Design-System/Components/ToiletDetailsPanel',
  component: ToiletDetailsPanel,
  tags: ['autodocs'],
};

const mockToiletData = {
  loo: {
    id: '05a8ddcad8fdca635f5dbdb0',
    createdAt: '2023-01-29T01:25:04.595Z',
    updatedAt: '2023-01-29T01:25:04.595Z',
    verifiedAt: '2021-07-20T09:46:27.122Z',
    active: true,
    location: {
      lat: 51.502403582,
      lng: -0.136447673,
      __typename: 'Point' as const,
    },
    name: 'bite-sized academy',
    openingTimes: [
      ['03:18', '17:45'],
      ['07:09', '20:01'],
      ['01:55', '17:45'],
      ['05:59', '17:56'],
      ['05:21', '08:28'],
      ['08:30', '13:30'],
      ['07:58', '11:09'],
    ],
    accessible: true,
    men: false,
    women: false,
    allGender: false,
    babyChange: false,
    children: false,
    urinalOnly: false,
    radar: true,
    automatic: null,
    noPayment: true,
    paymentDetails: '£9.34 on entry',
    notes: 'dependent toilet!! incidentally republic know!',
    removalReason: null,
    attended: null,
    geohash: 'gcpuuzsxhxchpxw1vbzh',
    area: [
      {
        name: 'Westminster',
        type: 'Local Authority',
        __typename: 'AdminGeo' as const,
      },
    ],
    __typename: 'Loo' as const,
  },
};

export default meta;

export const Default = () => <ToiletDetailsPanel data={mockToiletData.loo} />;
