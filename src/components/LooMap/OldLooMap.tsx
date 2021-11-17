import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { Map, TileLayer, ZoomControl } from 'react-leaflet';
import 'focus-visible';

import config from '../../config';
import LocateMapControl from './LocateMapControl';
import ToiletMarkerIcon from './ToiletMarkerIcon';
import AccessibilityIntersection from './AccessibilityIntersection';
import AccessibilityList from './AccessibilityList';

import Box from '../Box';
import Marker from './Marker';
import VisuallyHidden from '../VisuallyHidden';
import { Media } from '../Media';

import crosshair from '../../../public/crosshair.svg';

import 'leaflet/dist/leaflet.css';
import { Loo } from '../../api-client/graphql';

const KEY_ENTER = 13;

interface Props {
  loos?: Array<Loo>;
  center: { lat: number; lng: number };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  staticMap?: boolean;
  onViewportChanged?: () => void;
  controlsOffset?: number;
  showCrosshair: boolean;
  withAccessibilityOverlays?: boolean;
}

const LooMap: React.FC<Props> = ({
  center,
  zoom = config.initialZoom,
  minZoom = config.minZoom,
  maxZoom = config.maxZoom,
  onViewportChanged,
  loos = [],
  staticMap = false,
  controlsOffset = 0,
  showCrosshair,
  withAccessibilityOverlays = true,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const mapRef = React.useRef();
  const [intersectingToilets, setIntersectingToilets] = React.useState([]);
  const [renderAccessibilityOverlays, setRenderAccessibilityOverlays] =
    React.useState(false);
  const [announcement, setAnnouncement] = React.useState(null);

  useEffect(() => {
    if (mounted) {
      const { leafletElement } = mapRef.current;
      const map = leafletElement.getContainer();

      // when focused on the map container, Leaflet allows the user to pan the map by using the arrow keys
      // without the application role screen reader software overrides these controls
      //
      // this also avoids the entire main region being announced
      map.setAttribute('role', 'application');
      map.setAttribute('aria-label', 'Map');

      // ensure all map tiles are loaded on Safari
      // https://github.com/neontribe/gbptm/issues/776
      setTimeout(() => {
        leafletElement.invalidateSize({
          pan: false,
        });
      }, 400);
    }
  }, [mounted]);

  const handleViewportChanged = () => {
    const map = mapRef.current.leafletElement;
    const center = map.getCenter();
    const zoom = map.getZoom();

    const bounds = map.getBounds();
    const radius = parseInt(bounds.getNorthEast().distanceTo(center));

    onViewportChanged({
      center,
      zoom,
      radius,
    });
  };

  const router = useRouter();

  const memoizedMarkers = React.useMemo(
    () =>
      loos.map((toilet) => (
        <Marker
          key={toilet.id}
          position={toilet.location}
          zIndexOffset={toilet.isHighlighted ? 1000 : 0}
          icon={
            new ToiletMarkerIcon({
              isHighlighted: toilet.isHighlighted,
              toiletId: toilet.id,
            })
          }
          label={toilet.name || 'Unnamed toilet'}
          onClick={() => {
            if (!staticMap) {
              router.push(`/loos/${toilet.id}`);
            }
          }}
          onKeyDown={(event: { originalEvent: { keyCode: number } }) => {
            if (!staticMap && event.originalEvent.keyCode === KEY_ENTER) {
              router.push(`/loos/${toilet.id}`);
            }
          }}
          keyboard={false}
        />
      )),
    [loos, staticMap, router]
  );

  const keyboardSelectionHandler = React.useCallback(
    (selectionIndex: string | number) => {
      const toilet = intersectingToilets[selectionIndex];

      if (!toilet) {
        return;
      }

      setAnnouncement(`${toilet.name || 'Unnamed toilet'} selected`);
      router.push(`/loos/${toilet.id}`);
    },
    [intersectingToilets, router]
  );

  React.useEffect(() => {
    if (mounted && withAccessibilityOverlays && mapRef.current) {
      const map = mapRef.current.leafletElement.getContainer();

      const callback = function (mutationsList) {
        for (let mutation of mutationsList) {
          const focusVisible = mutation.target.dataset.focusVisibleAdded === '';

          if (focusVisible !== renderAccessibilityOverlays) {
            setRenderAccessibilityOverlays(focusVisible);
          }
        }
      };

      const observer = new MutationObserver(callback);

      // only render accessibility overlays when [data="focus-visible-added"] is applied
      //
      // we conditionally render instead of toggling CSS display since we want to avoid AccessibilityList being announced
      // before the map is keyboard focused
      observer.observe(map, { attributes: true });

      return () => {
        observer.disconnect();
      };
    }
  }, [withAccessibilityOverlays, mapRef, renderAccessibilityOverlays, mounted]);

  return (
    mounted && (
      <Box
        position="relative"
        height="100%"
        width="100%"
        css={
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
            : undefined
        }
      >
        <Map
          ref={mapRef}
          center={center}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onViewportChanged={handleViewportChanged}
          dragging={!staticMap}
          scrollWheelZoom={!staticMap}
          zoomControl={false}
          tap={false}
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

          {memoizedMarkers}

          <Media greaterThan="md">
            <ZoomControl position="bottomright" />
          </Media>

          <LocateMapControl position="bottomright" />

          {renderAccessibilityOverlays && (
            <>
              <AccessibilityIntersection
                className="accessibility-box"
                toilets={loos}
                bounds={mapRef.current.leafletElement.getBounds().pad(-0.4)}
                onIntersection={setIntersectingToilets}
                onSelection={keyboardSelectionHandler}
                center={center}
              />

              <AccessibilityList
                toilets={intersectingToilets.map(
                  (toilet: { name: any }) => toilet.name
                )}
              />

              <VisuallyHidden>
                <div
                  role="status"
                  aria-atomic="true"
                  aria-live="polite"
                  aria-relevant="additions text"
                >
                  {announcement}
                </div>
              </VisuallyHidden>
            </>
          )}
        </Map>
      </Box>
    )
  );
};

export default LooMap;
