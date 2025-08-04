import React from 'react';
import './DispatchesPanel.css';

function DispatchesPanel({ dispatches }) {
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const publishedDate = new Date(dateString);
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
  };

  const getDispatchTypeColor = (type) => {
    switch (type) {
      case 'MAJOR_ORDER':
        return '#ff4444'; // Red for urgent
      case 'TACTICAL_UPDATE':
        return '#44ff44'; // Green for tactical
      case 'SUPPLY_DROP':
        return '#4444ff'; // Blue for supply
      case 'INTELLIGENCE':
        return '#ffaa44'; // Orange for intel
      default:
        return '#ffffff';
    }
  };

  const getDispatchTypeLabel = (type) => {
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
        return type;
    }
  };

  return (
    <div className="dispatches-panel">
      <h3>Dispatches</h3>
      <div className="dispatches-list">
        {dispatches && dispatches.length > 0 ? (
          dispatches.map((dispatch) => (
            <div key={dispatch.id} className="dispatch-item">
              <div className="dispatch-header">
                <span 
                  className="dispatch-type"
                  style={{ color: getDispatchTypeColor(dispatch.type) }}
                >
                  {getDispatchTypeLabel(dispatch.type)}
                </span>
                <span className="dispatch-time">
                  {formatTimeAgo(dispatch.publishedAt)}
                </span>
              </div>
              <div className="dispatch-message">
                {dispatch.message}
              </div>
              <div className="dispatch-author">
                — {dispatch.author}
              </div>
            </div>
          ))
        ) : (
          <div className="no-dispatches">
            No dispatches available
          </div>
        )}
      </div>
    </div>
  );
}

export default DispatchesPanel;
