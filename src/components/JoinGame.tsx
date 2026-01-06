import { useState } from 'react';

interface JoinGameProps {
  onJoin: (playerName: string) => void;
}

export function JoinGame({ onJoin }: JoinGameProps) {
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onJoin(playerName.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Flip 7 Scorecard</h1>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
              Enter your name
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 sm:py-4 text-base border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 sm:py-5 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base sm:text-lg shadow-lg active:scale-95 transition-transform"
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}

