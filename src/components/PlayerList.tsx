import { Player } from '../types';
import { sortPlayersByScore } from '../utils/gameLogic';

interface PlayerListProps {
  players: Player[];
  currentPlayerId: string | null;
}

export function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  const sortedPlayers = sortPlayersByScore(players);

  if (sortedPlayers.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No players yet. Be the first to join!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      {sortedPlayers.map((player, index) => {
        const isCurrentPlayer = player.id === currentPlayerId;
        return (
          <div
            key={player.id}
            className={`p-4 rounded-lg border-2 ${
              isCurrentPlayer
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-gray-500">
                  #{index + 1}
                </span>
                <span className={`text-lg font-bold ${isCurrentPlayer ? 'text-blue-700' : 'text-gray-900'}`}>
                  {player.name}
                  {isCurrentPlayer && ' (You)'}
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                {player.totalScore} pts
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Round {player.currentRoundNumber || 1}: <span className="font-semibold">{player.currentRoundScore}</span> pts | 
              Total Rounds: <span className="font-semibold">{player.rounds.length}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

