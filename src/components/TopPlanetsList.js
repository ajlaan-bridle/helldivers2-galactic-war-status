import React from 'react';
import './TopPlanetsList.css';

function TopPlanetsList({ planets, campaigns }) {
  if (planets === null) {
    return (
      <div className="panel top-planets-panel">
        <h3>Top Planets by Activity</h3>
        <div className="loading-state">
          <p>Loading planet data...</p>
        </div>
      </div>
    );
  }

  if (!planets || planets.length === 0) {
    return (
      <div className="panel top-planets-panel">
        <h3>Top Planets by Activity</h3>
        <div className="no-data">
          <p>No active planets found</p>
        </div>
      </div>
    );
  }

  // Create a map of campaigns by planet ID for easy lookup
  const campaignMap = {};
  if (campaigns && campaigns.length > 0) {
    campaigns.forEach(campaign => {
      if (campaign.planetIndex !== undefined) {
        campaignMap[campaign.planetIndex] = campaign;
      }
    });
  }

  // Filter and sort planets by player count
  const activePlanets = planets
    .filter(planet => planet.currentOwner === 'Humans' || planet.statistics?.playerCount > 0)
    .map(planet => ({
      ...planet,
      campaign: campaignMap[planet.index] || null,
      playerCount: planet.statistics?.playerCount || 0
    }))
    .sort((a, b) => b.playerCount - a.playerCount)
    .slice(0, 5); // Top 5 planets

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString();
  };

  const getOwnerColor = (owner) => {
    switch (owner) {
      case 'Humans': return '#4CAF50';
      case 'Terminids': return '#FF9800';
      case 'Automaton': return '#F44336';
      case 'Illuminate': return '#9C27B0';
      default: return '#666';
    }
  };

  const getOwnerIcon = (owner) => {
    switch (owner) {
      case 'Humans': return '🌍';
      case 'Terminids': return '🐛';
      case 'Automaton': return '🤖';
      case 'Illuminate': return '👁️';
      default: return '❓';
    }
  };

  return (
    <div className="panel top-planets-panel">
      <h3>Top Planets by Activity</h3>
      <div className="planets-list">
        {activePlanets.map((planet, index) => (
          <div key={planet.index} className="planet-item">
            <div className="planet-rank">#{index + 1}</div>
            
            <div className="planet-info">
              <div className="planet-header">
                <h4 className="planet-name">{planet.name}</h4>
                <div className="planet-owner" style={{ color: getOwnerColor(planet.currentOwner) }}>
                  {getOwnerIcon(planet.currentOwner)} {planet.currentOwner}
                </div>
              </div>
              
              <div className="planet-stats">
                <div className="stat">
                  <span className="stat-label">Players:</span>
                  <span className="stat-value">{formatNumber(planet.playerCount)}</span>
                </div>
                
                {planet.statistics?.missionsWon !== undefined && (
                  <div className="stat">
                    <span className="stat-label">Missions Won:</span>
                    <span className="stat-value">{formatNumber(planet.statistics.missionsWon)}</span>
                  </div>
                )}
                
                {planet.statistics?.missionsLost !== undefined && (
                  <div className="stat">
                    <span className="stat-label">Missions Lost:</span>
                    <span className="stat-value">{formatNumber(planet.statistics.missionsLost)}</span>
                  </div>
                )}
              </div>
              
              {planet.campaign && (
                <div className="campaign-info">
                  <div className="campaign-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min((planet.campaign.progress || 0) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="progress-text">
                      {((planet.campaign.progress || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {activePlanets.length === 0 && (
          <div className="no-data">
            <p>No active planets found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopPlanetsList;
