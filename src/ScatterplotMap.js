import React from 'react';
import { DeckGL, ScatterplotLayer } from 'deck.gl';
import Map from 'react-map-gl/mapbox';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoiam9iYW5ndXMiLCJhIjoiY203ZGdwem9wMDMzdTJrcjUwMXBwMDlheiJ9._K6c1zsCN3-S8EGk-NOCJw'; // Replace with your token


const ScatterplotMap = ({ data, selectedMetric, viewState, onPointClick }) => {
  const getFillColor = (d) => {
    const value = d.properties[selectedMetric]?.median || 0;
    return [
      Math.max(0, 255 - value * 10), 
      Math.min(255, value * 10), 
      0
    ];
  };
  if (!data) {
    return <p>Loading map data...</p>;
  }

  return (
    
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={[
        new ScatterplotLayer({
          id: 'scatterplot-layer',
          key: selectedMetric, // Force re-render on metric change
          data: data.features,
          getPosition: d => d.geometry.coordinates,

          getRadius: 7,
          getFillColor: getFillColor,
          pickable: true,
          autoHighlight: true,
          updateTriggers: {
            getFillColor: selectedMetric // Update color when metric changes
          }
        })
      ]}
      onClick={info => onPointClick(info.object)}
    >
      <Map
        mapStyle="mapbox://styles/mapbox/dark-v10"
        mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
      />
    </DeckGL>
  );
};

export default ScatterplotMap;