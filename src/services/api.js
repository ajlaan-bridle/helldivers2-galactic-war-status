const API_BASE_URL = '/api';

// Rate limiting: 5 calls per 10 seconds
class RateLimiter {
  constructor(maxCalls = 5, timeWindow = 10000) {
    this.maxCalls = maxCalls;
    this.timeWindow = timeWindow;
    this.calls = [];
  }

  async waitIfNeeded() {
    const now = Date.now();
    
    // Remove calls older than the time window
    this.calls = this.calls.filter(callTime => now - callTime < this.timeWindow);
    
    // If we've made too many calls, wait
    if (this.calls.length >= this.maxCalls) {
      const oldestCall = Math.min(...this.calls);
      const waitTime = this.timeWindow - (now - oldestCall) + 100; // Add 100ms buffer
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitIfNeeded(); // Recursive call to check again
      }
    }
    
    // Record this call
    this.calls.push(now);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Fetch data from the Helldivers 2 API
 * @param {string} endpoint - The API endpoint (e.g., '/v1/war')
 * @returns {Promise<Object>} - The parsed JSON response
 */
export async function fetchData(endpoint) {
  try {
    // Wait if we need to respect rate limits
    await rateLimiter.waitIfNeeded();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'X-Super-Client': 'aj',
        'X-Super-Contact': 'aj',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch all required data for the application
 * @returns {Promise<Object>} - Object containing all fetched data
 */
export async function fetchAllData() {
  try {
    // Make sequential API calls to respect rate limiting
    const warStats = await fetchData('/v1/war');
    const assignments = await fetchData('/v1/assignments');
    const planets = await fetchData('/v1/planets');
    const campaigns = await fetchData('/v1/campaigns');
    const dispatches = await fetchData('/v2/dispatches');
    const steamNews = await fetchData('/v1/steam');

    return {
      warStats,
      assignments,
      planets,
      campaigns,
      dispatches,
      steamNews,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}
