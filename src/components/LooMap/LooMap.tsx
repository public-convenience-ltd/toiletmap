import { useMapState } from '../MapState';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { css } from '@emotion/react';
import Box from '../Box';
import { Media } from '../Media';
import Markers from './Markers';
import CurrentLooMarker from './CurrentLooMarker';
import LocateMapControl from './LocateMapControl';
import { useCallback, useEffect, useState } from 'react';
import { Map } from 'leaflet';
import useLocateMapControl from './useLocateMapControl';
import AccessibilityIntersection from './AccessibilityIntersection';
import AccessibilityList from './AccessibilityList';
import VisuallyHidden from '../VisuallyHidden';
import 'focus-visible';
import React from 'react';
import router from 'next/router';
import ZoomControl from './ZoomControl';
import crosshairSvg from '../../../public/crosshair.svg';

const MapTracker = () => {
  const [, setMapState] = useMapState();
  const map = useMapEvents({
    moveend: () => {
      setMapState({ center: map.getCenter() });
    },
    zoomend: () => {
      setMapState({ zoom: map.getZoom() });
    },
  });
  return null;
};

export interface LooMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  staticMap?: boolean;
  controlsOffset?: number;
  showCrosshair?: boolean;
  withAccessibilityOverlays?: boolean;
  showAccessibilityOverlay?: boolean;
  alwaysShowGeolocateButton?: boolean;
  controlPositionOverride?: 'top' | 'bottom';
  onViewportChanged?: () => void;
}

const controlPositionClassNames = {
  top: 'leaflet-bar leaflet-top leaflet-right',
  bottom: 'leaflet-bar leaflet-bottom leaflet-right',
};

const LooMap: React.FC<LooMapProps> = ({
  showCrosshair,
  controlsOffset = 0,
  center,
  zoom,
  minZoom,
  maxZoom = 18,
  staticMap = false,
  withAccessibilityOverlays = true,
  showAccessibilityOverlay = false,
  alwaysShowGeolocateButton = false,
  controlPositionOverride,
}) => {
  const [mapState, setMapState] = useMapState();

  // const [hydratedToilets, setHydratedToilets] = useState<CompressedLooObject[]>([]);
  const [announcement, setAnnouncement] = React.useState(null);
  const [intersectingToilets, setIntersectingToilets] = useState([]);

  const [renderAccessibilityOverlays, setRenderAccessibilityOverlays] =
    useState(showAccessibilityOverlay);

  // Load a reference to the leaflet map into application state so components that aren't below in the tree can access.
  // const setMap = useCallback(
  //   (map: Map) => {
  //     if (map !== null) {
  //       setMapState({ map });
  //     }
  //   },
  //   [setMapState]
  // );

  const mapRef = React.createRef<Map>();

  useEffect(() => {
    if (
      mapRef.current !== null &&
      (mapState.map === null ||
        mapState.map === undefined ||
        mapRef.current !== mapState.map)
    ) {
      setMapState({ map: mapRef.current });
    }
  }, [mapRef, mapState.map, setMapState]);

  // Begin accessibility overlay

  useEffect(() => {
    // when focused on the map container, Leaflet allows the user to pan the map by using the arrow keys
    // without the application role screen reader software overrides these controls
    //
    // this also avoids the entire main region being announced
    const container = mapState.map?.getContainer();
    container?.setAttribute('role', 'application');
    container?.setAttribute('aria-label', 'Map');

    // ensure all map tiles are loaded on Safari
    // https://github.com/neontribe/gbptm/issues/776
    setTimeout(() => {
      mapState.map?.invalidateSize({
        pan: false,
      });
    }, 400);
  }, [mapState.map]);

  const keyboardSelectionHandler = React.useCallback(
    (selectionIndex: string | number) => {
      const toilet = intersectingToilets[selectionIndex];

      if (!toilet) {
        return;
      }

      setAnnouncement(`${toilet.name || 'Unnamed toilet'} selected`);
      setMapState({ searchLocation: undefined, focus: toilet });
      router.push(`/loos/${toilet.id}`);
    },
    [intersectingToilets, setMapState]
  );

  React.useEffect(() => {
    if (withAccessibilityOverlays && mapState.map) {
      const callback = function (mutationsList) {
        for (const mutation of mutationsList) {
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
      observer.observe(mapState.map?.getContainer(), { attributes: true });

      return () => {
        observer.disconnect();
      };
    }
  }, [withAccessibilityOverlays, renderAccessibilityOverlays, mapState.map]);

  // Begin location service initialisation.
  const onLocationFound = useCallback(
    (event: { latitude: number; longitude: number }) => {
      setMapState({
        geolocation: {
          lat: event.latitude,
          lng: event.longitude,
        },
      });
    },
    [setMapState]
  );

  const onStopLocation = useCallback(() => {
    setMapState({
      geolocation: null,
    });
  }, [setMapState]);

  const { isActive, startLocate, stopLocate } = useLocateMapControl({
    onLocationFound,
    onStopLocation,
    map: mapState.map,
  });

  useEffect(() => {
    setMapState({
      locationServices: {
        isActive,
        startLocate,
        stopLocate,
      },
    });
  }, [mapState.map, isActive, setMapState, startLocate, stopLocate]);

  // Override the map location with the search result if present.
  useEffect(() => {
    if (mapState?.searchLocation && mapState?.map) {
      mapState.map.setView(mapState.searchLocation);
    }
    // Only update the map when the search location changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState.searchLocation]);

  const controlPosition =
    controlPositionOverride !== undefined
      ? controlPositionClassNames[controlPositionOverride]
      : undefined;

  return (
    <Box
      position="relative"
      height="100%"
      width="100%"
      css={[
        showCrosshair
          ? css`
              &:after {
                content: url(${crosshairSvg.src});
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
        id="gbptm-map"
        zoomControl={false} // we are overriding this with our own custom placed zoom control
        tap={false}
        dragging={!staticMap}
        ref={mapRef}
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

          .leaflet-bar {
            bottom: ${controlsOffset}px;
          }

          .leaflet-bar {
            border: none !important; // override leaflet default border
            box-shadow: none;
          }

          a.leaflet-bar-part,
          button.leaflet-control-zoom-in,
          button.leaflet-control-zoom-out,
          button.locate-map-control {
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
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          minZoom={minZoom}
          maxZoom={maxZoom}
        />

        {mapState.focus && <CurrentLooMarker loo={mapState.focus} />}

        <Markers />

        <div
          className={
            controlPosition !== undefined
              ? controlPosition
              : mapState.focus
              ? controlPositionClassNames['top']
              : controlPositionClassNames['bottom']
          }
        >
          {alwaysShowGeolocateButton && <LocateMapControl />}
          <Media greaterThanOrEqual="sm">
            {!alwaysShowGeolocateButton && <LocateMapControl />}
            <ZoomControl />
          </Media>
        </div>

        <MapTracker />

        {renderAccessibilityOverlays && (
          <>
            <AccessibilityIntersection
              className="accessibility-box"
              onIntersection={setIntersectingToilets}
              onSelection={keyboardSelectionHandler}
            />

            <AccessibilityList toilets={intersectingToilets} />

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
      </MapContainer>
    </Box>
  );
};

export default LooMap;
