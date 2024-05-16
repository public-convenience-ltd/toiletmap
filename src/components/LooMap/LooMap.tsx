import { useMapState } from '../MapState';
import { MapContainer, useMapEvents } from 'react-leaflet';
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
import {
  CenteredTextSymbolizer,
  CircleSymbolizer,
  GroupSymbolizer,
  Justify,
  OffsetTextSymbolizer,
  TextPlacements,
  labelRules,
  leafletLayer,
  paintRules,
} from 'protomaps-leaflet';
import { mapTheme } from './mapTheme';

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
  showControls?: boolean;
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
  showControls = true,
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

  useEffect(() => {
    if (!mapState.map) return;

    const layer = leafletLayer({
      // Free for non-commercial use https://protomaps.com/
      url: 'https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.mvt?key=73e8a482f059f3f5',
      paintRules: paintRules(mapTheme),
      labelRules: labelRules(mapTheme).concat(
        {
          dataLayer: 'pois',
          symbolizer: new GroupSymbolizer([
            new CircleSymbolizer({
              fill: '#0a165e',
              stroke: '#f4f4f4',
            }),
            new OffsetTextSymbolizer({
              labelProps: ['name'],
              fill: '#0a165e',
              stroke: '#f4f4f4',
              width: 1,
              lineHeight: 0.875,
              font: '400 16px',
              offsetY: 4,
              // offsetX: 6,
              placements: [TextPlacements.S],
              justify: Justify.Center,
            }),
          ]),
          filter: (_, { props }) =>
            [
              'attraction',
              'landmark',
              'memorial',
              'social_facility',
              'supermarket',
            ].includes(String(props['pmap:kind'])),
        },
        {
          dataLayer: 'pois',
          symbolizer: new CenteredTextSymbolizer({
            labelProps: ['name'],
            fill: '#0a165e',
            stroke: 'transparent',
            width: 1,
            lineHeight: 1,
            font: '400 14px',
          }),
          filter: (z, { props }) => {
            if (z < 18) return false;
            return [
              'aerodrome',
              'adult_gaming_centre',
              'airfield',
              'alpine_hut',
              'amusement_ride',
              'animal',
              'art',
              'artwork',
              'atm',
              'attraction',
              'atv',
              'baby_hatch',
              'bakery',
              'bbq',
              'beauty',
              'bed_and_breakfast',
              'bench',
              'bicycle_parking',
              'bicycle_rental',
              'bicycle_repair_station',
              'boat_storage',
              'bookmaker',
              'books',
              'bureau_de_change',
              'bus_stop',
              'butcher',
              'cafe',
              'camp_site',
              'car_parts',
              'car_rental',
              'car_repair',
              'car_sharing',
              'car_wash',
              'car',
              'carousel',
              'cemetery',
              'chalet',
              'charging_station',
              'childcare',
              'clinic',
              'clothes',
              'college',
              'computer',
              'convenience',
              'customs',
              'dentist',
              'district',
              'doctors',
              'dog_park',
              'drinking_water',
              'emergency_phone',
              'fashion',
              'firepit',
              'fishing',
              'florist',
              'forest',
              'fuel',
              'gambling',
              'garden_centre',
              'gift',
              'golf_course',
              'golf',
              'greengrocer',
              'grocery',
              'guest_house',
              'hairdresser',
              'hanami',
              'harbourmaster',
              'hifi',
              'hospital',
              'hostel',
              'hotel',
              'hunting_stand',
              'information',
              'jewelry',
              'karaoke_box',
              'karaoke',
              'landmark',
              'library',
              'life_ring',
              'lottery',
              'marina',
              'maze',
              'memorial',
              'military',
              'mobile_phone',
              'money_transfer',
              'motorcycle_parking',
              'motorcycle',
              'national_park',
              'naval_base',
              'newsagent',
              'optician',
              'park',
              'parking',
              'perfumery',
              'picnic_site',
              'picnic_table',
              'pitch',
              'playground',
              'post_box',
              'post_office',
              'ranger_station',
              'recycling',
              'roller_coaster',
              'sanitary_dump_station',
              'school',
              'scuba_diving',
              'shelter',
              'ship_chandler',
              'shower',
              'slipway',
              'snowmobile',
              'social_facility',
              'stadium',
              'stationery',
              'studio',
              'summer_toboggan',
              'supermarket',
              'swimming_area',
              'taxi',
              'telephone',
              'tobacco',
              'toilets',
              'townhall',
              'trail_riding_station',
              'travel_agency',
              'university',
              'viewpoint',
              'waste_basket',
              'waste_disposal',
              'water_point',
              'water_slide',
              'watering_place',
              'wayside_cross',
              'wilderness_hut',
            ].includes(String(props['pmap:kind']));
          },
        },
      ),
    });

    // @ts-expect-error -- this is what the docs recommend
    // https://github.com/protomaps/protomaps-leaflet?tab=readme-ov-file#how-to-use
    layer.addTo(mapState.map);
  }, [mapState.map]);

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
    [intersectingToilets, setMapState],
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
    [setMapState],
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
          {alwaysShowGeolocateButton && showControls && <LocateMapControl />}
          <Media greaterThanOrEqual="md">
            {!alwaysShowGeolocateButton && showControls && <LocateMapControl />}
            {showControls && <ZoomControl />}
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
