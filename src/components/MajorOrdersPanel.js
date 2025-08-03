import React from 'react';
import './MajorOrdersPanel.css';

function MajorOrdersPanel({ assignments }) {
  if (!assignments || assignments.length === 0) {
    return (
      <div className="panel major-orders-panel">
        <h3>Major Orders</h3>
        <div className="no-data">
          <p>No active major orders</p>
        </div>
      </div>
    );
  }

  const formatTimeRemaining = (expiresAt) => {
    if (!expiresAt) return 'Unknown';
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString();
  };

  return (
    <div className="panel major-orders-panel">
      <h3>Major Orders</h3>
      <div className="major-orders-list">
        {assignments.map((assignment, index) => (
          <div key={assignment.id || index} className="major-order">
            <div className="order-header">
              <h4 className="order-title">{assignment.briefing || assignment.title || 'Major Order'}</h4>
              <div className="order-meta">
                <span className="time-remaining">
                  ⏱️ {formatTimeRemaining(assignment.expiresAt)}
                </span>
              </div>
            </div>
            
            {assignment.description && (
              <p className="order-description">{assignment.description}</p>
            )}
            
            {assignment.tasks && assignment.tasks.length > 0 && (
              <div className="order-tasks">
                {assignment.tasks.map((task, taskIndex) => (
                  <div key={taskIndex} className="task">
                    <div className="task-info">
                      <span className="task-type">{task.type || 'Task'}</span>
                      {task.values && task.values.length >= 2 && (
                        <div className="task-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${Math.min((task.values[0] / task.values[1]) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <span className="progress-text">
                            {formatNumber(task.values[0])} / {formatNumber(task.values[1])}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {assignment.reward && (
              <div className="order-reward">
                <span className="reward-label">Reward:</span>
                <span className="reward-value">{assignment.reward.type} - {assignment.reward.amount}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MajorOrdersPanel;
