const API_BASE_URL = '/api';

// Rate limiting: 5 calls per 10 seconds (per PRD specification)
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
    // Fetch all data concurrently
    console.log('Starting to fetch all API data...');
    
    const [warStats, dispatches, steamNews, assignments, planets, campaigns, spaceStations] = await Promise.allSettled([
      fetchData('/api/v1/war'),
      fetchData('/api/v2/dispatches'),
      fetchData('/api/v1/steam'),
      fetchData('/api/v1/assignments'),
      fetchData('/api/v1/planets'),
      fetchData('/api/v1/campaigns'),
      fetchData('/api/v2/space-stations')
    ]);
    
    console.log('API fetch results:', {
      warStats: warStats.status,
      dispatches: dispatches.status,
      steamNews: steamNews.status,
      assignments: assignments.status,
      planets: planets.status,
      campaigns: campaigns.status,
      spaceStations: spaceStations.status
    });
    
    // Log campaigns data specifically for debugging
    if (campaigns.status === 'fulfilled') {
      console.log('Campaigns data received:', campaigns.value);
    } else {
      console.log('Campaigns failed:', campaigns.reason);
    }
    
    // Log space stations data specifically for debugging
    if (spaceStations.status === 'fulfilled') {
      console.log('Space stations data received:', spaceStations.value);
    } else {
      console.log('Space stations failed:', spaceStations.reason);
    }
    
    // Use real data if available, fall back to mock data if needed
    return {
      warStats: warStats.status === 'fulfilled' ? warStats.value : null,
      assignments: assignments.status === 'fulfilled' ? assignments.value : [
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
      planets: planets.status === 'fulfilled' ? planets.value : [
        {
          name: "TURING",
          faction: "Humans",
          liberation: 78.5,
          playerCount: 12543
        },
        {
          name: "HEETH",
          faction: "Terminids",
          liberation: 23.1,
          playerCount: 8921
        },
        {
          name: "TIEN KWAN",
          faction: "Automatons",
          liberation: 45.7,
          playerCount: 15672
        }
      ],
      campaigns: campaigns.status === 'fulfilled' ? campaigns.value : [
        {
          id: 1,
          planetName: "TURING",
          type: "Liberation",
          progress: 78.5
        }
      ],
      dispatches: dispatches.status === 'fulfilled' ? dispatches.value : [],
      steamNews: steamNews.status === 'fulfilled' ? steamNews.value : [],
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
      dispatches: [
        {
          id: 1,
          type: "MAJOR_ORDER",
          message: "URGENT: All Helldivers report to nearest Super Destroyer. New Terminid bioforms detected in Sector 7. Extreme caution advised.",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          author: "High Command"
        },
        {
          id: 2,
          type: "TACTICAL_UPDATE",
          message: "Automaton forces have been pushed back from the Turing system. Helldivers are advised to maintain defensive positions and prepare for counterattack.",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          author: "Tactical Command"
        },
        {
          id: 3,
          type: "SUPPLY_DROP",
          message: "New shipment of Stratagems has arrived. Priority access granted to active Helldivers in contested sectors.",
          publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          author: "Supply Division"
        },
        {
          id: 4,
          type: "INTELLIGENCE",
          message: "Reconnaissance reports indicate unusual Illuminate activity near the outer rim. Investigation teams are being deployed.",
          publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
          author: "Intelligence Division"
        }
      ],
      steamNews: [
        {
          id: "news_1",
          title: "Helldivers 2: Galactic War Update - New Enemy Types Discovered",
          url: "https://store.steampowered.com/news/app/553850/view/1234567890",
          contents: "Super Earth Command has confirmed the discovery of new Terminid bioforms in the outer colonies. These enhanced creatures show increased resistance to standard weaponry...",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          author: "Arrowhead Game Studios"
        },
        {
          id: "news_2",
          title: "Community Challenge: Liberation of Sector 7 Complete!",
          url: "https://store.steampowered.com/news/app/553850/view/1234567891",
          contents: "Thanks to the heroic efforts of Helldivers across the galaxy, Sector 7 has been successfully liberated from Automaton control. Victory celebrations are underway...",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          author: "Arrowhead Game Studios"
        },
        {
          id: "news_3",
          title: "Patch Notes: Balance Updates and Bug Fixes",
          url: "https://store.steampowered.com/news/app/553850/view/1234567892",
          contents: "This update includes balance adjustments to several Stratagems, fixes for connection issues, and improvements to the galactic war progression system...",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          author: "Arrowhead Game Studios"
        }
      ],
      spaceStations: spaceStations.status === 'fulfilled' ? spaceStations.value : [],
      lastUpdated: new Date().toISOString()
    };
  }
}
