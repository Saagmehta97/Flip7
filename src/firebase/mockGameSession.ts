import { GameSession, Player } from '../types';

// In-memory storage for development (no Firebase needed)
let mockSessions: Record<string, GameSession> = {};
let mockSubscribers: Record<string, ((session: GameSession | null) => void)[]> = {};

/**
 * Create a new game session (mock version - no Firebase)
 */
export async function createGameSession(): Promise<string> {
  const sessionId = generateSessionId();
  const session: GameSession = {
    id: sessionId,
    players: {},
    createdAt: Date.now()
  };
  
  mockSessions[sessionId] = session;
  
  // Notify any subscribers
  if (mockSubscribers[sessionId]) {
    mockSubscribers[sessionId].forEach(cb => cb(session));
  }
  
  return Promise.resolve(sessionId);
}

/**
 * Get a game session by ID (mock version)
 */
export async function getGameSession(sessionId: string): Promise<GameSession | null> {
  return Promise.resolve(mockSessions[sessionId] || null);
}

/**
 * Subscribe to real-time updates for a game session (mock version)
 */
export function subscribeToGameSession(
  sessionId: string,
  callback: (session: GameSession | null) => void
): () => void {
  if (!mockSubscribers[sessionId]) {
    mockSubscribers[sessionId] = [];
  }
  
  mockSubscribers[sessionId].push(callback);
  
  // Immediately call with current session
  const session = mockSessions[sessionId];
  if (session) {
    callback(session);
  } else {
    callback(null);
  }
  
  // Return unsubscribe function
  return () => {
    if (mockSubscribers[sessionId]) {
      mockSubscribers[sessionId] = mockSubscribers[sessionId].filter(cb => cb !== callback);
    }
  };
}

/**
 * Add a player to a game session (mock version)
 */
export async function addPlayerToSession(
  sessionId: string,
  playerId: string,
  playerName: string
): Promise<void> {
  if (!mockSessions[sessionId]) {
    mockSessions[sessionId] = {
      id: sessionId,
      players: {},
      createdAt: Date.now()
    };
  }
  
  const player: Player = {
    id: playerId,
    name: playerName,
    totalScore: 0,
    currentRoundScore: 0,
    rounds: [],
    currentRoundNumber: 1,
    usedCardsThisRound: []
  };
  
  mockSessions[sessionId].players[playerId] = player;
  
  // Notify subscribers
  if (mockSubscribers[sessionId]) {
    mockSubscribers[sessionId].forEach(cb => cb(mockSessions[sessionId]));
  }
  
  return Promise.resolve();
}

/**
 * Update a player's score in a game session (mock version)
 */
export async function updatePlayerScore(
  sessionId: string,
  playerId: string,
  updates: Partial<Player>
): Promise<void> {
  if (!mockSessions[sessionId] || !mockSessions[sessionId].players[playerId]) {
    console.warn('Session or player not found:', { sessionId, playerId });
    return Promise.resolve();
  }
  
  // Create a new player object with updates
  const updatedPlayer = {
    ...mockSessions[sessionId].players[playerId],
    ...updates
  };
  
  // Create a new players object to ensure reference changes
  mockSessions[sessionId] = {
    ...mockSessions[sessionId],
    players: {
      ...mockSessions[sessionId].players,
      [playerId]: updatedPlayer
    }
  };
  
  // Notify subscribers with a new session object
  if (mockSubscribers[sessionId]) {
    mockSubscribers[sessionId].forEach(cb => cb(mockSessions[sessionId]));
  }
  
  return Promise.resolve();
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 9);
}

