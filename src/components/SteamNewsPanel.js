import React from 'react';
import './SteamNewsPanel.css';

function SteamNewsPanel({ steamNews }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const truncateContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleNewsClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="steam-news-panel">
      <h3>Steam News</h3>
      <div className="news-list">
        {steamNews && steamNews.length > 0 ? (
          steamNews.map((news) => (
            <div 
              key={news.id} 
              className="news-item"
              onClick={() => handleNewsClick(news.url)}
            >
              <div className="news-header">
                <h4 className="news-title">{news.title}</h4>
                <span className="news-date">
                  {formatDate(news.date)}
                </span>
              </div>
              <div className="news-content">
                {truncateContent(news.contents)}
              </div>
              <div className="news-footer">
                <span className="news-author">by {news.author}</span>
                <span className="news-link-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" />
                  </svg>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-news">
            No Steam news available
          </div>
        )}
      </div>
    </div>
  );
}

export default SteamNewsPanel;
