import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { GameSession, Player } from '../types';

/**
 * Create a new game session
 */
export async function createGameSession(): Promise<string> {
  const sessionId = generateSessionId();
  const session: GameSession = {
    id: sessionId,
    players: {},
    createdAt: Date.now()
  };
  
  await setDoc(doc(db, 'gameSessions', sessionId), {
    ...session,
    createdAt: serverTimestamp()
  });
  
  return sessionId;
}

/**
 * Get a game session by ID
 */
export async function getGameSession(sessionId: string): Promise<GameSession | null> {
  const docRef = doc(db, 'gameSessions', sessionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    players: data.players || {},
    createdAt: data.createdAt?.toMillis() || Date.now()
  };
}

/**
 * Subscribe to real-time updates for a game session
 */
export function subscribeToGameSession(
  sessionId: string,
  callback: (session: GameSession | null) => void
): () => void {
  const docRef = doc(db, 'gameSessions', sessionId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    
    const data = docSnap.data();
    callback({
      id: docSnap.id,
      players: data.players || {},
      createdAt: data.createdAt?.toMillis() || Date.now()
    });
  });
}

/**
 * Add a player to a game session
 */
export async function addPlayerToSession(
  sessionId: string,
  playerId: string,
  playerName: string
): Promise<void> {
  const docRef = doc(db, 'gameSessions', sessionId);
  const player: Player = {
    id: playerId,
    name: playerName,
    totalScore: 0,
    currentRoundScore: 0,
    rounds: [],
    currentRoundNumber: 1,
    usedCardsThisRound: []
  };
  
  await updateDoc(docRef, {
    [`players.${playerId}`]: player
  });
}

/**
 * Update a player's score in a game session
 */
export async function updatePlayerScore(
  sessionId: string,
  playerId: string,
  updates: Partial<Player>
): Promise<void> {
  const docRef = doc(db, 'gameSessions', sessionId);
  
  const updateData: Record<string, any> = {};
  Object.keys(updates).forEach(key => {
    updateData[`players.${playerId}.${key}`] = updates[key as keyof Player];
  });
  
  await updateDoc(docRef, updateData);
}

/**
 * Generate a random session ID
 */
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 9);
}

