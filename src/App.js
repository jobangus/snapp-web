import React, { useState, useEffect } from 'react';
import Heatmap from './Heatmap';
import ComparisonChart from './ComparisonChart';
import ScatterplotMap from './ScatterplotMap';
import DataVisualization from './DataVisualization';
import GroupedBoxPlot from './GroupedBoxPlot'; // Import new visualization
// Initial view state (centered on Hong Kong)
const INITIAL_VIEW_STATE = {
  longitude: 114.0718,

  latitude: 22.5022,
  zoom: 20,
  pitch: 0,
  bearing: 0
};

const App = () => {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [clickedPoint, setClickedPoint] = useState(null);
  const [data, setData] = useState(null);
  const [boxplotData, setBoxplotData] = useState(null); // New state for boxplot
  // In parent component
const [selectedConfig, setSelectedConfig] = useState('ph_temp');
  const [selectedPoints, setSelectedPoints] = useState([]); // For dual selection in ComparisonChart

  // Update map click handler
  const handlePointClick = (point) => {
    // Single selection for DataVisualization
    if (point == null) {
      setClickedPoint(null);
      setSelectedPoints([]);
    }else{
    setClickedPoint(prev => 
      prev?.geometry.coordinates[0] === point.geometry.coordinates[0] &&
      prev?.geometry.coordinates[1] === point.geometry.coordinates[1]
        ? null 
        : point
    );
  
    // Dual selection for ComparisonChart
    setSelectedPoints(prev => {
      const index = prev.findIndex(p => 
        p.geometry.coordinates[0] === point.geometry.coordinates[0] &&
        p.geometry.coordinates[1] === point.geometry.coordinates[1]
      );
      
      if (index !== -1) {
        // Remove if already exists
        return prev.filter((_, i) => i !== index);
      }
      
      // Add new point (max 2)
      return [...prev, point].slice(-2);
    });
    }
  };

  // Fetch time-series data <button class="citation-flag" data-index="7">
  useEffect(() => {
    // Change '/data.json' to your Flask endpoint
    fetch('http://localhost:5000/aggregated-data') 
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error loading data:', error));
  }, []);

  // Fetch data when selected metric changes
  useEffect(() => {
    fetch(`http://localhost:5000/boxplot-data`)
      .then(response => response.json())
      .then(data => setBoxplotData(data))
      .catch(error => console.error('Error:', error));
  }, []);

  if (!data) {
    return <p>Loading data...</p>;
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh',
      flexDirection: 'row'
    }}>
      {/* Left Panel (1/3 width) */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '10px',
        backgroundColor: '#f4f4f4'
      }}>
        {/* Metric Selector */}
        <div style={{ marginBottom: '10px' }}>
          <h3>Metric Selector</h3>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            {['temperature', 'pH', 'dissolvedOxygen', 'orp', 'EC', 'turbidity'].map(metric => (
              <button 
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                style={{ 
                  padding: '10px 16px',
                  backgroundColor: selectedMetric === metric ? '#ddd' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
    
        {/* Boxplot Container (30% height) */}
        <div style={{ 
          flex: '0 0 30%',
          marginBottom: '15px'
        }}>
          {boxplotData && (
            <GroupedBoxPlot 
              data={boxplotData}
              selectedMetric={selectedMetric}
              clickedPoint={clickedPoint}
              style={{ height: '100%' }}
            />
          )}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <h3>Config Selector</h3>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            flexWrap: 'wrap',
            marginBottom: '15px'
          }}>
            {['ph_temp', 'do_ph'].map(metric => (
              <button 
                key={metric}
                onClick={() => setSelectedConfig(metric)}
                style={{ 
                  padding: '10px 16px',
                  backgroundColor: selectedConfig === metric ? '#ddd' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Time-Series Container (70% height) */}
        <div style={{ flex: 1 }}>
          <DataVisualization
            data={data}
            selectedConfig={selectedConfig}
            clickedPoint={clickedPoint}
          />
        </div>
        <div style={{ flex: 1 }}>
        <ComparisonChart
          data={data}
          selectedMetric={selectedMetric}
          primaryPoint={selectedPoints[0]}
          secondaryPoint={selectedPoints[1]}
        />
    </div>
      </div>
    
      {/* Map Container (2/3 width) */}
      <div style={{ 
        flex: 2,
        position: 'relative',
        padding: '10px'
      }}>
        <ScatterplotMap
          data={boxplotData}
          selectedMetric={selectedMetric}
          viewState={INITIAL_VIEW_STATE}
          onPointClick={setClickedPoint}
        />
      </div>
    </div>
  );
};
export default App;