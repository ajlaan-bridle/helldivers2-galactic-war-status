const API_BASE_URL = '/api';

// Rate limiting: 2 calls per 20 seconds (very conservative)
class RateLimiter {
  constructor(maxCalls = 2, timeWindow = 20000) {
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
      const waitTime = this.timeWindow - (now - oldestCall) + 1000; // Add 1s buffer
      
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
    // Temporarily load only war stats for testing
    console.log('Starting to fetch war stats...');
    const warStats = await fetchData('/v1/war');
    console.log('War stats loaded:', warStats);
    
    // For now, return mock data for other endpoints to test header display
    return {
      warStats,
      assignments: [], // Mock empty data
      planets: [], // Mock empty data
      campaigns: [], // Mock empty data
      dispatches: [], // Mock empty data
      steamNews: [], // Mock empty data
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    throw error;
  }
}
