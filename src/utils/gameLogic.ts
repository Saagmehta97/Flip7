import { Player } from '../types';

/**
 * Calculate score with PEMDAS order of operations:
 * 1. Base score (+1 through +12)
 * 2. Add modifier cards (+2, +4, +6, +8, +10)
 * 3. Apply x2 multiplier to the total
 * @param baseScore - Base score (1-12)
 * @param modifierTotal - Sum of modifier cards added
 * @param x2Active - Whether x2 card is active
 * @returns Final score to add
 */
export function calculateScore(
  baseScore: number,
  modifierTotal: number,
  x2Active: boolean
): number {
  // Step 1: Add base score and modifiers
  const sum = baseScore + modifierTotal;
  
  // Step 2: Apply x2 multiplier if active
  const finalScore = x2Active ? sum * 2 : sum;
  
  return finalScore;
}

/**
 * Add points to a player's current round score
 * Uses PEMDAS: base + modifiers, then apply x2
 * @param player - The player object
 * @param baseScore - Base score (1-12)
 * @param modifierTotal - Sum of modifier cards
 * @param x2Active - Whether x2 card is active
 * @returns Updated player object
 */
export function addToCurrentRound(
  player: Player,
  baseScore: number,
  modifierTotal: number,
  x2Active: boolean
): Player {
  const pointsToAdd = calculateScore(baseScore, modifierTotal, x2Active);
  return {
    ...player,
    currentRoundScore: Math.max(0, player.currentRoundScore + pointsToAdd)
  };
}

/**
 * Subtract 15 points from current round score
 * Only affects currentRoundScore, never goes below 0
 * @param player - The player object
 * @returns Updated player object
 */
export function subtract15FromCurrentRound(player: Player): Player {
  return {
    ...player,
    currentRoundScore: Math.max(0, player.currentRoundScore - 15)
  };
}

/**
 * Bank the current round score
 * Adds currentRoundScore to totalScore, saves to rounds array, resets currentRoundScore
 * @param player - The player object
 * @returns Updated player object
 */
export function bankRound(player: Player): Player {
  const roundScore = player.currentRoundScore;
  return {
    ...player,
    totalScore: player.totalScore + roundScore,
    currentRoundScore: 0,
    rounds: [...player.rounds, roundScore],
    currentRoundNumber: player.currentRoundNumber + 1,
    usedCardsThisRound: [] // Reset used cards for new round
  };
}

/**
 * Sort players by total score (descending)
 * Tiebreaker: fewer rounds played
 * @param players - Array of players
 * @returns Sorted array of players
 */
export function sortPlayersByScore(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    // Primary sort: total score (descending)
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    // Tiebreaker: fewer rounds played
    return a.rounds.length - b.rounds.length;
  });
}

