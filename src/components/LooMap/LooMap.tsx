import { useRouter } from 'next/router';
import { MapContainer, Pane, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { css } from '@emotion/react';
import Box from '../Box';
import { Media } from '../Media';
import Markers from './Markers';
import { Loo } from '../../api-client/graphql';
interface Props {
  focus?: Loo;
  center: { lat: number; lng: number };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  staticMap?: boolean;
  onViewportChanged?: () => void;
  controlsOffset?: number;
  showCrosshair?: boolean;
  withAccessibilityOverlays?: boolean;
  loos: Array<Loo>;
  filters: any;
}

const LooMap: React.FC<Props> = ({
  focus,
  showCrosshair,
  controlsOffset = 0,
  center,
  zoom,
  minZoom,
  maxZoom = 18,
  staticMap = false,
  loos,
  filters,
}) => {
  return (
    <Box
      position="relative"
      height="100%"
      width="100%"
      css={[
        showCrosshair
          ? css`
              &:after {
                content: url(/crosshair.svg);
                position: absolute;
                top: 50%;
                left: 50%;
                display: block;
                height: 53px;
                width: 52px;
                transform: translate(-50%, -50%);
              }
            `
          : undefined,
        css``,
      ]}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        scrollWheelZoom={!staticMap}
        css={(theme) => css`
          height: 100%;
          width: 100%;
          position: relative;
          z-index: 0;

          .leaflet-bottom {
            bottom: ${controlsOffset}px;
          }

          .leaflet-bar {
            border: none;
            box-shadow: none;
          }

          a.leaflet-bar-part,
          a.leaflet-control-zoom-in,
          a.leaflet-control-zoom-out {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            color: ${theme.colors.primary};
            border: 1px solid ${theme.colors.primary};
            border-radius: 20px;

            &:not(:first-of-type) {
              margin-top: 10px;
            }

            &:first-of-type,
            &:last-of-type {
              border-radius: 20px;
            }
          }

          &[data-focus-visible-added] {
            border: 2px solid ${theme.colors.tertiary};
          }

          .leaflet-control [data-focus-visible-added] {
            outline: 2px solid ${theme.colors.tertiary} !important;
            outline-offset: 3px;
          }

          &[data-focus-visible-added] {
            outline-offset: 0;
          }
        `}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          minZoom={minZoom}
          maxZoom={maxZoom}
        />

        <Markers focus={focus} loos={loos} />

        <Media greaterThan="md">
          <ZoomControl position="bottomright" />
        </Media>
        {/* <LocateMapControl position="bottomright" /> */}
      </MapContainer>
    </Box>
  );
};

export default LooMap;
