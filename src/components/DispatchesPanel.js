import React from 'react';
import './DispatchesPanel.css';

function DispatchesPanel({ dispatches }) {
  console.log('DispatchesPanel received data:', dispatches);
  
  const formatTimeAgo = (timestamp) => {
    try {
      const now = new Date();
      // Handle both timestamp (seconds) and ISO string formats
      const publishedDate = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);
      const diffInHours = Math.floor((now - publishedDate) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - publishedDate) / (1000 * 60));
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  const getDispatchTypeLabel = (type) => {
    // Handle numeric type from API (0, 1, 2, etc.) or string type
    if (typeof type === 'number') {
      switch (type) {
        case 0:
          return 'DISPATCH';
        case 1:
          return 'MAJOR ORDER';
        case 2:
          return 'TACTICAL';
        default:
          return 'NEWS';
      }
    }
    
    switch (type) {
      case 'MAJOR_ORDER':
        return 'MAJOR ORDER';
      case 'TACTICAL_UPDATE':
        return 'TACTICAL';
      case 'SUPPLY_DROP':
        return 'SUPPLY';
      case 'INTELLIGENCE':
        return 'INTEL';
      default:
        return 'DISPATCH';
    }
  };

  const getDispatchTypeColor = (type) => {
    // Handle numeric type from API
    if (typeof type === 'number') {
      switch (type) {
        case 0:
          return '#888888';
        case 1:
          return '#ff4444';
        case 2:
          return '#44ff44';
        default:
          return '#4444ff';
      }
    }
    
    switch (type) {
      case 'MAJOR_ORDER':
        return '#ff4444';
      case 'TACTICAL_UPDATE':
        return '#44ff44';
      case 'SUPPLY_DROP':
        return '#4444ff';
      case 'INTELLIGENCE':
        return '#ffaa44';
      default:
        return '#888888';
    }
  };

  // Check for null data (loading state)
  if (dispatches === null) {
    return (
      <div className="panel dispatches-panel">
        <h3>Dispatches</h3>
        <div className="loading-state">
          <p>Loading dispatches...</p>
        </div>
      </div>
    );
  }

  // Handle different possible data structures
  let dispatchItems = [];
  if (Array.isArray(dispatches)) {
    dispatchItems = dispatches;
  } else if (dispatches && Array.isArray(dispatches.dispatches)) {
    dispatchItems = dispatches.dispatches;
  }

  if (!dispatchItems || dispatchItems.length === 0) {
    return (
      <div className="panel dispatches-panel">
        <h3>Dispatches</h3>
        <p className="no-data">No dispatches available</p>
      </div>
    );
  }

  return (
    <div className="panel dispatches-panel">
      <h3>Dispatches</h3>
      <div className="dispatches-list">
        {dispatchItems.map((dispatch) => (
          <div key={dispatch.id} className="dispatch-item">
            <div className="dispatch-header">
              <span 
                className="dispatch-type"
                style={{ color: getDispatchTypeColor(dispatch.type) }}
              >
                {getDispatchTypeLabel(dispatch.type)}
              </span>
              <span className="dispatch-time">
                {formatTimeAgo(dispatch.published)}
              </span>
            </div>
            <div className="dispatch-message">
              {dispatch.message}
            </div>
            <div className="dispatch-author">
              — High Command
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DispatchesPanel;
