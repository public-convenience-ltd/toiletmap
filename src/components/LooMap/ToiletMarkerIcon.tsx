import React, { useEffect, useId, useState } from 'react';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';
import { motion } from 'framer-motion';
const ICON_DIMENSIONS = [22, 34];
const LARGE_ICON_DIMENSSIONS = ICON_DIMENSIONS.map((i) => i * 1.5);
const getIconAnchor = (dimensions: number[]) => [
  dimensions[0] / 2,
  dimensions[1],
];

export const getSVGHTML = ({ isHighlighted = false }) => {
  return (
    <svg viewBox="-1 -1 21 33" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 0C4.47632 0 0 4.47529 0 10C0 19.5501 10 32 10 32C10 32 20 19.5501 20 10C20 4.47529 15.5237 0 10 0Z"
        fill="#ED3D63"
        stroke="white"
      />

      {isHighlighted ? (
        <path
          d="M10 4L11.7634 7.57295L15.7063 8.1459L12.8532 10.9271L13.5267 14.8541L10 13L6.47329 14.8541L7.14683 10.9271L4.29366 8.1459L8.23664 7.57295L10 4Z"
          fill="white"
        />
      ) : (
        <circle cx="10" cy="10" r="5" fill="white" />
      )}
    </svg>
  );
};

export const MarkeyIcon = ({ isHighlighted = false, toiletId = undefined }) => {
  return (
    <div data-toiletid={toiletId} id={toiletId} className="get-me">
      {getSVGHTML({ toiletId })}
    </div>
  );
};

const ToiletMarkerIcon = ({ isHighlighted = false, toiletId = undefined }) =>
  new (L.DivIcon.extend({
    options: {
      highlight: isHighlighted,
      toiletId,
    },

    initialize: function () {
      // eslint-disable-next-line functional/immutable-data
      this.options = {
        ...this.options,
        iconSize: isHighlighted ? LARGE_ICON_DIMENSSIONS : ICON_DIMENSIONS,
        iconAnchor: isHighlighted
          ? getIconAnchor(LARGE_ICON_DIMENSSIONS)
          : getIconAnchor(ICON_DIMENSIONS),
        html: renderToString(
          <MarkeyIcon isHighlighted={isHighlighted} toiletId={toiletId} />
        ),
      };

      L.Util.setOptions(this, { toiletId, isHighlighted });
    },
  }))();

export default ToiletMarkerIcon;
