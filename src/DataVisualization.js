import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const DataVisualization = ({ data, selectedConfig, clickedPoint }) => {
  if (!clickedPoint) return <div>Select a location to view data</div>;

  // Configuration options
  const config = {
    'ph_temp': {
      metrics: ['pH', 'temperature'],
      colors: ['#8884d8', '#ff0000'],
      axes: ['left', 'right']
    },
    'do_ph': {
      metrics: ['dissolvedOxygen', 'pH'],
      colors: ['#2ECC71', '#8884d8'],
      axes: ['left', 'right']
    }
  };

  // Get selected configuration
  const { metrics, colors, axes } = config[selectedConfig] || config['ph_temp'];

  // Prepare data
  const locationData = data.features
    .filter(f =>  
      f.geometry.coordinates[0] === clickedPoint.geometry.coordinates[0] &&
      f.geometry.coordinates[1] === clickedPoint.geometry.coordinates[1]
    )
    .sort((a, b) => new Date(a.properties.date) - new Date(b.properties.date));

  const chartData = locationData.map(feature => {
    const entry = { date: feature.properties.date };
    metrics.forEach(metric => {
      entry[metric] = feature.properties[metric].mean;
    });
    return entry;
  });

  return (
    <div style={{ padding: '10px', backgroundColor: '#f4f4f4', height: '100%' }}>
      <h3>Time Series: {metrics.join(' vs ')}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          
          {/* Primary YAxis */}
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke={colors[0]}
            label={{
              value: metrics[0],
              angle: -90,
              position: 'insideLeft'
            }}
          />
          
          {/* Secondary YAxis */}
          {metrics.length > 1 && (
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke={colors[1]}
              label={{
                value: metrics[1],
                angle: -90,
                position: 'insideRight'
              }}
            />
          )}

          <XAxis dataKey="date" />
          <Tooltip />
          <Legend />

          {/* Render lines */}
          {metrics.map((metric, index) => (
            <Line 
              key={metric}
              type="monotone" 
              dataKey={metric}
              stroke={colors[index]}
              yAxisId={axes[index]}
              name={metric}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DataVisualization;