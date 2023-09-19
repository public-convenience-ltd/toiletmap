import { useMap } from 'react-leaflet';

import Icon from '../../design-system/components/Icon';
import { ControlButton } from './LocateMapControl';

const ZoomControl = () => {
  const map = useMap();

  const zoomIn = (e) => {
    e.preventDefault();
    map.setZoom(map.getZoom() + 1);
  };
  const zoomOut = (e) => {
    e.preventDefault();
    map.setZoom(map.getZoom() - 1);
  };

  return (
    <div className="leaflet-control">
      <ControlButton
        className="leaflet-control-zoom-in"
        title="Zoom in"
        aria-label="Zoom in"
        onClick={zoomIn}
      >
        <Icon aria-hidden="true" icon="plus" size="medium" />
      </ControlButton>
      <ControlButton
        className="leaflet-control-zoom-out"
        title="Zoom out"
        aria-label="Zoom out"
        onClick={zoomOut}
      >
        <Icon aria-hidden="true" icon="minus" size="medium" />
      </ControlButton>
    </div>
  );
};

export default ZoomControl;
