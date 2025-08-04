import React from 'react';
import './SteamNewsPanel.css';

function SteamNewsPanel({ steamNews }) {
  console.log('SteamNewsPanel received data:', steamNews);
  
  const formatTimeAgo = (dateString) => {
    try {
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
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown time';
    }
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content || typeof content !== 'string') return 'No content available';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleNewsClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Handle different possible data structures
  let newsItems = [];
  if (Array.isArray(steamNews)) {
    newsItems = steamNews;
  } else if (steamNews && Array.isArray(steamNews.newsitems)) {
    newsItems = steamNews.newsitems;
  } else if (steamNews && Array.isArray(steamNews.appnews?.newsitems)) {
    newsItems = steamNews.appnews.newsitems;
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <div className="panel steam-news-panel">
        <h3>Steam News</h3>
        <p className="no-data">No Steam news available</p>
      </div>
    );
  }

  return (
    <div className="panel steam-news-panel">
      <h3>Steam News</h3>
      <div className="news-list">
        {newsItems.map((news) => (
          <div 
            key={news.gid || news.id} 
            className="news-item"
            onClick={() => handleNewsClick(news.url)}
          >
            <div className="news-header">
              <h4 className="news-title">{news.title}</h4>
              <span className="news-date">
                {formatTimeAgo(news.date * 1000)}
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
        ))}
      </div>
    </div>
  );
}

export default SteamNewsPanel;
