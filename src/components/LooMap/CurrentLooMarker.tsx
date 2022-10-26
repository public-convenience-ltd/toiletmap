import { Marker } from 'react-leaflet';
import { Loo } from '../../api-client/graphql';
import ToiletMarkerIcon from './ToiletMarkerIcon';

const CurrentLooMarker = ({ loo }: { loo: Loo }) => {
  const icon = ToiletMarkerIcon({
    isHighlighted: true,
    toiletId: loo?.id,
  });

  return <Marker position={loo.location} icon={icon} />;
};

export default CurrentLooMarker;
