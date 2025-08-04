import React, { useState, useEffect } from 'react';
import './App.css';
import { fetchAllData } from './services/api';
import Header from './components/Header';
import MajorOrdersPanel from './components/MajorOrdersPanel';
import TopPlanetsList from './components/TopPlanetsList';
import DispatchesPanel from './components/DispatchesPanel';
import SteamNewsPanel from './components/SteamNewsPanel';

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
        <Header warStats={null} lastUpdated={null} />
        <div className="loading">
          <p>Loading galactic war data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="App">
        <Header warStats={null} lastUpdated={null} />
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Header warStats={data.warStats} lastUpdated={data.lastUpdated} />
      
      <main className="App-main">
        <div className="content-grid">
          <div className="left-sidebar">
            <MajorOrdersPanel assignments={data.assignments} />
            <TopPlanetsList planets={data.planets} campaigns={data.campaigns} />
          </div>
          
          <div className="center-content">
            {/* Galaxy Map will go here */}
            <div className="panel galaxy-map-placeholder">
              <h3>Galactic Map</h3>
              <p>Interactive map coming soon...</p>
            </div>
          </div>
          
          <div className="right-sidebar">
            <DispatchesPanel dispatches={data.dispatches} />
            <SteamNewsPanel steamNews={data.steamNews} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
