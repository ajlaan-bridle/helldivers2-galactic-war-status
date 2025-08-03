import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchAllData } from './services/api';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    warStats: null,
    assignments: null,
    planets: null,
    campaigns: null,
    dispatches: null,
    steamNews: null,
    lastUpdated: null
  });

  const fetchData = async () => {
    try {
      setError(null);
      const allData = await fetchAllData();
      setData(allData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Set up interval to refresh data every 60 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Helldivers 2 Galactic War Status</h1>
          <div className="loading">
            <p>Loading galactic war data...</p>
          </div>
        </header>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Helldivers 2 Galactic War Status</h1>
          <div className="error">
            <p>{error}</p>
            <button onClick={fetchData}>Retry</button>
          </div>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Helldivers 2 Galactic War Status</h1>
        {data.lastUpdated && (
          <p className="last-updated">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        )}
      </header>
      
      <main className="App-main">
        <div className="content-grid">
          <div className="left-sidebar">
            {/* Major Orders and Top Planets panels will go here */}
            <div className="panel">
              <h3>Major Orders</h3>
              <p>Panel coming soon...</p>
            </div>
            <div className="panel">
              <h3>Top Planets</h3>
              <p>Panel coming soon...</p>
            </div>
          </div>
          
          <div className="center-content">
            {/* Galaxy Map will go here */}
            <div className="panel galaxy-map-placeholder">
              <h3>Galactic Map</h3>
              <p>Interactive map coming soon...</p>
            </div>
          </div>
          
          <div className="right-sidebar">
            {/* Newsfeed panels will go here */}
            <div className="panel">
              <h3>Dispatches</h3>
              <p>Panel coming soon...</p>
            </div>
            <div className="panel">
              <h3>Steam News</h3>
              <p>Panel coming soon...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
