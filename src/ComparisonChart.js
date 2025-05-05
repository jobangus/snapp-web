// New ComparisonChart component
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

const ComparisonChart = ({ 
  data, 
  selectedMetric,
  primaryPoint,
  secondaryPoint 
}) => {
  if (!primaryPoint || !secondaryPoint) {
    
    return <div>Select two locations to compare {primaryPoint} {secondaryPoint}</div>;
  }

  // Process data for each point
  const processData = (point) => {
    return data.features
      .filter(f => 
        f.geometry.coordinates[0] === point.geometry.coordinates[0] &&
        f.geometry.coordinates[1] === point.geometry.coordinates[1]
      )
      .sort((a, b) => new Date(a.properties.date) - new Date(b.properties.date))
      .map(feature => ({
        date: feature.properties.date,
        value: feature.properties[selectedMetric].mean
      }));
  };

  const primaryData = processData(primaryPoint);
  const secondaryData = processData(secondaryPoint);

  // Combine data by date
  const combinedData = primaryData.map((p, i) => ({
    date: p.date,
    primary: p.value,
    secondary: secondaryData[i]?.value || null
  }));

  return (
    <div style={{ padding: '10px', backgroundColor: '#f4f4f4', height: '100%' }}>
      <h3>Comparison: {selectedMetric}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          <Line 
            type="monotone" 
            dataKey="primary"
            stroke="#8884d8"
            name="Primary Location"
            dot={false}
            isAnimationActive={false}
          />
          
          <Line 
            type="monotone" 
            dataKey="secondary"
            stroke="#ff0000"
            name="Secondary Location"
            dot={false}
            strokeDasharray="3 3"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;