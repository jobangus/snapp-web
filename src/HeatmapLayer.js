import { HeatmapLayer } from '@deck.gl/aggregation-layers';

const HeatmapLayerComponent = ({ data }) => {
  return new HeatmapLayer({
    id: 'heatmap-layer',
    data,
    getPosition: d => [d.longitude, d.latitude], // Extract coordinates
    getWeight: d => d.temperature,              // Use temperature as weight
    radiusPixels: 50,                           // Radius of each heatmap point
    intensity: 1,                               // Intensity of the heatmap
    threshold: 0.05,                            // Threshold for color intensity
    colorRange: [
      [0, 0, 255, 25],  // Blue (low temperature)
      [0, 255, 0, 80],  // Green
      [255, 255, 0, 120], // Yellow
      [255, 0, 0, 255]  // Red (high temperature)
    ]
  });
};

export default HeatmapLayerComponent;