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
 * Extract and validate required fields from war stats according to PRD
 * @param {Object} warStats - Raw war stats data from API
 * @returns {Object} - Validated war stats with required fields
 */
function extractWarStatsFields(warStats) {
  if (!warStats || !warStats.statistics) {
    console.warn('War stats missing or invalid structure');
    return null;
  }
  
  const stats = warStats.statistics;
  return {
    missionsWon: stats.missionsWon || 0,
    missionsLost: stats.missionsLost || 0,
    missionSuccessRate: stats.missionSuccessRate || 0,
    terminidKills: stats.terminidKills || 0,
    automatonKills: stats.automatonKills || 0,
    illuminateKills: stats.illuminateKills || 0,
    timePlayed: stats.timePlayed || 0,
    playerCount: stats.playerCount || 0
  };
}

/**
 * Extract and validate required fields from assignments according to PRD
 * @param {Array} assignments - Raw assignments data from API
 * @returns {Array} - Validated assignments with required fields
 */
function extractAssignmentsFields(assignments) {
  if (!Array.isArray(assignments)) {
    console.warn('Assignments data is not an array or is missing');
    return [];
  }
  
  return assignments.map(assignment => {
    const progress = assignment.progress && assignment.progress[0] ? assignment.progress[0] : 0;
    const targetValue = assignment.tasks && assignment.tasks[0] && assignment.tasks[0].values && assignment.tasks[0].values[2] ? assignment.tasks[0].values[2] : 1;
    
    return {
      title: assignment.title || 'Unknown Assignment',
      briefing: assignment.briefing || '',
      progress: progress,
      target: targetValue,
      progressPercentage: targetValue > 0 ? (progress / targetValue) * 100 : 0,
      expiration: assignment.expiration || null
    };
  });
}

/**
 * Extract and validate required fields from planets according to PRD
 * @param {Array} planets - Raw planets data from API
 * @returns {Array} - Validated planets with required fields
 */
function extractPlanetsFields(planets) {
  if (!Array.isArray(planets)) {
    console.warn('Planets data is not an array or is missing');
    return [];
  }
  
  return planets.map(planet => {
    const enemyFaction = planet.currentOwner !== 'Humans' ? planet.currentOwner : null;
    
    return {
      index: planet.index,
      name: planet.name || 'Unknown Planet',
      sector: planet.sector || 'Unknown Sector',
      biome: planet.biome || 'Unknown Biome',
      hazards: planet.hazards || [],
      position: planet.position || { x: 0, y: 0 },
      currentOwner: planet.currentOwner || 'Unknown',
      enemyFaction: enemyFaction,
      playerCount: planet.statistics && planet.statistics.playerCount ? planet.statistics.playerCount : 0
    };
  });
}

/**
 * Extract and validate required fields from campaigns according to PRD
 * @param {Array} campaigns - Raw campaigns data from API
 * @returns {Array} - Validated campaigns with required fields
 */
function extractCampaignsFields(campaigns) {
  if (!Array.isArray(campaigns)) {
    console.warn('Campaigns data is not an array or is missing');
    return [];
  }
  
  return campaigns.map(campaign => {
    const hasEvent = campaign.planet && campaign.planet.event;
    let eventProgress = null;
    let eventEndTime = null;
    
    if (hasEvent) {
      const event = campaign.planet.event;
      eventProgress = event.maxHealth > 0 ? 1 - (event.health / event.maxHealth) : 0;
      eventEndTime = event.endTime;
    }
    
    return {
      planetIndex: campaign.planet && campaign.planet.index ? campaign.planet.index : campaign.planetIndex,
      hasEvent: !!hasEvent,
      eventProgress: eventProgress,
      eventEndTime: eventEndTime
    };
  });
}

/**
 * Filter dispatches to only include those from the last 36 hours according to PRD
 * @param {Array} dispatches - Raw dispatches data from API
 * @returns {Array} - Filtered dispatches
 */
function filterDispatches(dispatches) {
  if (!Array.isArray(dispatches)) {
    console.warn('Dispatches data is not an array or is missing');
    return [];
  }
  
  const thirtySevenHoursAgo = new Date(Date.now() - 36 * 60 * 60 * 1000);
  
  return dispatches.filter(dispatch => {
    const publishedDate = new Date(dispatch.published || dispatch.publishedAt || 0);
    return publishedDate > thirtySevenHoursAgo;
  });
}

/**
 * Filter Steam news to show most recent OR last week, whichever is greater according to PRD
 * @param {Array} steamNews - Raw Steam news data from API
 * @returns {Array} - Filtered Steam news
 */
function filterSteamNews(steamNews) {
  if (!Array.isArray(steamNews)) {
    console.warn('Steam news data is not an array or is missing');
    return [];
  }
  
  if (steamNews.length === 0) return [];
  
  // Sort by date (most recent first)
  const sortedNews = steamNews.sort((a, b) => {
    const dateA = new Date(a.date || a.publishedAt || 0);
    const dateB = new Date(b.date || b.publishedAt || 0);
    return dateB - dateA;
  });
  
  // Get the most recent news item
  const mostRecent = sortedNews[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const mostRecentDate = new Date(mostRecent.date || mostRecent.publishedAt || 0);
  
  // If most recent is within a week, filter to last week
  if (mostRecentDate > oneWeekAgo) {
    return sortedNews.filter(news => {
      const newsDate = new Date(news.date || news.publishedAt || 0);
      return newsDate > oneWeekAgo;
    });
  }
  
  // Otherwise, just return the most recent
  return [mostRecent];
}

/**
 * Extract and validate required fields from space stations according to PRD
 * @param {Array} spaceStations - Raw space stations data from API
 * @returns {Array} - Validated space stations with required fields
 */
function extractSpaceStationsFields(spaceStations) {
  if (!Array.isArray(spaceStations)) {
    console.warn('Space stations data is not an array or is missing');
    return [];
  }
  
  return spaceStations.map(station => {
    return {
      position: station.planet && station.planet.position ? station.planet.position : { x: 0, y: 0 },
      electionEnd: station.electionEnd || null
    };
  });
}

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
  // Initialize processed data variables
  let processedWarStats = null;
  let processedAssignments = [];
  let processedPlanets = [];
  let processedCampaigns = [];
  let filteredDispatches = [];
  let filteredSteamNews = [];
  let processedSpaceStations = [];
  
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
    
    // Process and validate data according to PRD requirements
    processedWarStats = warStats.status === 'fulfilled' ? extractWarStatsFields(warStats.value) : null;
    processedAssignments = assignments.status === 'fulfilled' ? extractAssignmentsFields(assignments.value) : [];
    processedPlanets = planets.status === 'fulfilled' ? extractPlanetsFields(planets.value) : [];
    processedCampaigns = campaigns.status === 'fulfilled' ? extractCampaignsFields(campaigns.value) : [];
    filteredDispatches = dispatches.status === 'fulfilled' ? filterDispatches(dispatches.value) : [];
    filteredSteamNews = steamNews.status === 'fulfilled' ? filterSteamNews(steamNews.value) : [];
    processedSpaceStations = spaceStations.status === 'fulfilled' ? extractSpaceStationsFields(spaceStations.value) : [];
    
    // Log processed data for debugging
    console.log('Processed data:', {
      warStats: processedWarStats ? 'processed' : 'null',
      assignments: `${processedAssignments.length} assignments`,
      planets: `${processedPlanets.length} planets`,
      campaigns: `${processedCampaigns.length} campaigns`,
      dispatches: `${filteredDispatches.length} dispatches (filtered)`,
      steamNews: `${filteredSteamNews.length} steam news (filtered)`,
      spaceStations: `${processedSpaceStations.length} space stations`
    });
    
    // Handle "no active Major Order" case as per PRD
    if (processedAssignments.length === 0) {
      console.log('No active Major Orders found');
    }
    
    // Use processed data if available, fall back to mock data if needed
    return {
      warStats: processedWarStats,
      assignments: processedAssignments.length > 0 ? processedAssignments : [
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
      planets: processedPlanets.length > 0 ? processedPlanets : [
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
      campaigns: processedCampaigns.length > 0 ? processedCampaigns : [
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
      dispatches: filteredDispatches.length > 0 ? filteredDispatches : [
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
      steamNews: filteredSteamNews.length > 0 ? filteredSteamNews : [
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
      spaceStations: processedSpaceStations,
      lastUpdated: new Date().toISOString()
    };
  }
}
