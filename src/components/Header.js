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
              <span className="stat-label">Galactic War Progress</span>
              <span className="stat-value">{formatPercentage(warStats.galacticWarProgress)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Planets Held</span>
              <span className="stat-value">{formatNumber(warStats.planetsHeld)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Planets</span>
              <span className="stat-value">{formatNumber(warStats.totalPlanets)}</span>
            </div>
          </div>
          
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Active Players</span>
              <span className="stat-value highlight">{formatNumber(warStats.activePlayers)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Missions Won</span>
              <span className="stat-value">{formatNumber(warStats.missionsWon)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Missions Lost</span>
              <span className="stat-value">{formatNumber(warStats.missionsLost)}</span>
            </div>
          </div>
          
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Bug Kills</span>
              <span className="stat-value">{formatNumber(warStats.bugKills)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Bot Kills</span>
              <span className="stat-value">{formatNumber(warStats.botKills)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Illuminate Kills</span>
              <span className="stat-value">{formatNumber(warStats.illuminateKills)}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
