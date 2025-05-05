import React from 'react';
import { DeckGL, HeatmapLayer } from 'deck.gl';
import  Map  from 'react-map-gl/mapbox';
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1Ijoiam9iYW5ndXMiLCJhIjoiY203ZGdwem9wMDMzdTJrcjUwMXBwMDlheiJ9._K6c1zsCN3-S8EGk-NOCJw'; // Replace with your token

const Heatmap = ({ data, selectedMetric, viewState, onPointClick }) => {
    const getWeight = (metric) => (d) => d[metric];
  
    const layers = [
      new HeatmapLayer({
        id: 'heatmap-layer',
        key: selectedMetric, // Unique key to force re-render
        data,
        getPosition: (d) => [d.longitude, d.latitude],
        getWeight: getWeight(selectedMetric),
        radiusPixels: 50,
        intensity: 1,
        threshold: 0.05,
        colorRange: [
          [0, 0, 255, 25],  // Blue (low value)
          [0, 255, 0, 80],  // Green
          [255, 255, 0, 120], // Yellow
          [255, 0, 0, 255]  // Red (high value)
        ],
        pickable: true, // Enable picking
        updateTriggers: {
          getWeight: selectedMetric // Trigger recalculation of getWeight
        }
      })
    ];
  
    return (
        <div >
      <DeckGL
        style={{width: 700, height:500}}
        initialViewState={viewState}
        controller={true}
        layers={layers}
        onClick={(info) => {
            if (info.object) {
              onPointClick(info.object); // Pass the clicked object to the parent
            } else {
              onPointClick(null); // Clear the clicked point if no object is clicked
            }
          }}
      >
        <Map
          mapStyle="mapbox://styles/mapbox/dark-v10"
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          
        />
      </DeckGL></div>
    );
  };

export default Heatmap;