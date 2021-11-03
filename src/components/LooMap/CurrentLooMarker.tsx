import { Marker } from 'react-leaflet';
import { Loo } from '../../api-client/graphql';
import ToiletMarkerIcon from './ToiletMarkerIcon';

const CurrentLooMarker = ({ loo }: { loo: Loo }) => {
  const icon = new ToiletMarkerIcon({
    isHighlighted: true,
    toiletId: loo?.id,
    isUseOurLoosCampaign: loo?.campaignUOL,
  });

  return <Marker position={loo.location} icon={icon} />;
};

export default CurrentLooMarker;
