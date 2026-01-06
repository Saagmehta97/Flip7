export interface Player {
  id: string;
  name: string;
  totalScore: number;
  currentRoundScore: number;
  rounds: number[];
  currentRoundNumber: number;
  usedCardsThisRound: number[]; // Cards (1-12) that have been used this round
}

export interface GameSession {
  id: string;
  players: Record<string, Player>;
  createdAt: number;
}

