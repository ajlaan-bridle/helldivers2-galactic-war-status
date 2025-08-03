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
    // Try to fetch real data first
    console.log('Starting to fetch war stats...');
    const warStats = await fetchData('/v1/war');
    console.log('War stats loaded:', warStats);
    
    // If successful, return real data with mock data for other endpoints
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
    console.warn('API unavailable, using mock data:', error.message);
    
    // Return mock data when API is unavailable (HTTP 503, etc.)
    return {
      warStats: {
        started: "2024-01-23T20:05:13Z",
        ended: "2028-02-08T20:04:55Z",
        now: new Date().toISOString(),
        clientVersion: "0.3.0",
        factions: ["Humans", "Terminids", "Automaton", "Illuminate"],
        impactMultiplier: 0.018276155,
        statistics: {
          missionsWon: 593535361,
          missionsLost: 56200036,
          missionTime: 1860742707955,
          terminidKills: 132828561199,
          automatonKills: 55812199434,
          illuminateKills: 41296610988,
          bulletsFired: 1021491557469,
          bulletsHit: 1151555253691,
          timePlayed: 1860742707955,
          deaths: 5293390608,
          revives: 2,
          friendlies: 616038988,
          missionSuccessRate: 91,
          accuracy: 100,
          playerCount: 50854
        }
      },
      assignments: [
        {
          id: 1,
          briefing: "Collect Terminid samples and hold key scientific facilities",
          description: "Super Earth's scientists need fresh Terminid specimens to develop Gloom-resistant ship shielding. Secure and hold research facilities while collecting samples.",
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
          tasks: [
            {
              type: "COLLECT_SAMPLES",
              values: [1250, 2000]
            },
            {
              type: "HOLD_FACILITIES",
              values: [8, 12]
            }
          ],
          reward: {
            type: "Medals",
            amount: 45
          }
        }
      ],
      planets: [
        {
          index: 0,
          name: "TURING",
          currentOwner: "Humans",
          statistics: {
            playerCount: 12543,
            missionsWon: 1250,
            missionsLost: 89
          }
        },
        {
          index: 1,
          name: "PHACT BAY",
          currentOwner: "Humans",
          statistics: {
            playerCount: 9876,
            missionsWon: 987,
            missionsLost: 123
          }
        },
        {
          index: 2,
          name: "VERNEN WELLS",
          currentOwner: "Terminids",
          statistics: {
            playerCount: 8432,
            missionsWon: 654,
            missionsLost: 234
          }
        },
        {
          index: 3,
          name: "VOG-SOJOTH",
          currentOwner: "Automaton",
          statistics: {
            playerCount: 7123,
            missionsWon: 432,
            missionsLost: 187
          }
        },
        {
          index: 4,
          name: "PANDION-XXIV",
          currentOwner: "Humans",
          statistics: {
            playerCount: 6543,
            missionsWon: 543,
            missionsLost: 98
          }
        }
      ],
      campaigns: [
        {
          planetIndex: 0,
          progress: 0.75
        },
        {
          planetIndex: 1,
          progress: 0.45
        },
        {
          planetIndex: 2,
          progress: 0.23
        }
      ],
      dispatches: [],
      steamNews: [],
      lastUpdated: new Date().toISOString()
    };
  }
}
