import React from 'react';
import './Header.css';

function Header({ warStats, lastUpdated }) {
  
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return `${(num * 100).toFixed(1)}%`;
  };

  return (
    <header className="header">
      <div className="header-main">
        <h1 className="header-title">Helldivers 2 Galactic War Status</h1>
        {lastUpdated && (
          <p className="last-updated">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}
      </div>
      
      {warStats && (
        <div className="war-stats">
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Mission Success Rate</span>
              <span className="stat-value">{formatPercentage(warStats.statistics?.missionSuccessRate / 100)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Missions Won</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.missionsWon)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Missions Lost</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.missionsLost)}</span>
            </div>
          </div>
          
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Active Players</span>
              <span className="stat-value highlight">{formatNumber(warStats.statistics?.playerCount)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Deaths</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.deaths)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Accuracy</span>
              <span className="stat-value">{formatPercentage(warStats.statistics?.accuracy / 100)}</span>
            </div>
          </div>
          
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Terminid Kills</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.terminidKills)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Automaton Kills</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.automatonKills)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Illuminate Kills</span>
              <span className="stat-value">{formatNumber(warStats.statistics?.illuminateKills)}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
