import { useState } from 'react';
import { Player } from '../types';
import { subtract15FromCurrentRound, bankRound } from '../utils/gameLogic';
import { updatePlayerScore } from '../firebase/mockGameSession';

interface PlayerControlsProps {
  player: Player;
  sessionId: string;
}

export function PlayerControls({ player, sessionId }: PlayerControlsProps) {
  const [selectedCards, setSelectedCards] = useState<number[]>([]); // Cards selected but not yet saved
  const [activeModifiers, setActiveModifiers] = useState<number[]>([]); // Array of modifier values (+2, +4, +6, +8, +10)
  const [x2Active, setX2Active] = useState(false);
  const [showPreviousRounds, setShowPreviousRounds] = useState(false);

  const modifierOptions = [2, 4, 6, 8, 10];
  const usedCards = player.usedCardsThisRound || [];

  const toggleCard = (value: number) => {
    // Can't select a card that's already been used this round
    if (usedCards.includes(value)) {
      return;
    }
    
    if (selectedCards.includes(value)) {
      setSelectedCards(selectedCards.filter(c => c !== value));
    } else {
      setSelectedCards([...selectedCards, value]);
    }
  };

  const toggleModifier = (value: number) => {
    if (activeModifiers.includes(value)) {
      setActiveModifiers(activeModifiers.filter(m => m !== value));
    } else {
      setActiveModifiers([...activeModifiers, value]);
    }
  };

  // Save the selected cards to the current round score
  const handleSaveScore = async () => {
    if (selectedCards.length === 0) return;

    const cardsTotal = selectedCards.reduce((sum, val) => sum + val, 0);
    const modifierTotal = activeModifiers.reduce((sum, val) => sum + val, 0);
    
    // Calculate: (cards) × x2 + modifiers
    let scoreToAdd = cardsTotal;
    if (x2Active) {
      scoreToAdd = scoreToAdd * 2;
    }
    scoreToAdd = scoreToAdd + modifierTotal;
    
    const newScore = player.currentRoundScore + scoreToAdd;
    const newUsedCards = [...usedCards, ...selectedCards];
    
    await updatePlayerScore(sessionId, player.id, {
      currentRoundScore: newScore,
      usedCardsThisRound: newUsedCards
    });
    
    // Reset selections after saving
    setSelectedCards([]);
    setActiveModifiers([]);
    if (x2Active) {
      setX2Active(false);
    }
  };

  // Apply modifiers and x2 to current round score (for existing score)
  const handleApplyModifiers = async () => {
    const modifierTotal = activeModifiers.reduce((sum, val) => sum + val, 0);
    
    // Calculate: (currentRoundScore) × x2 + modifiers
    let newScore = player.currentRoundScore;
    if (x2Active) {
      newScore = newScore * 2;
    }
    newScore = newScore + modifierTotal;
    
    await updatePlayerScore(sessionId, player.id, {
      currentRoundScore: newScore
    });
    
    // Reset modifiers and x2 after applying
    setActiveModifiers([]);
    if (x2Active) {
      setX2Active(false);
    }
  };

  const handleSubtract15 = async () => {
    const updatedPlayer = subtract15FromCurrentRound(player);
    await updatePlayerScore(sessionId, player.id, {
      currentRoundScore: updatedPlayer.currentRoundScore
    });
  };

  const handleBankRound = async () => {
    const updatedPlayer = bankRound(player);
    await updatePlayerScore(sessionId, player.id, {
      totalScore: updatedPlayer.totalScore,
      currentRoundScore: updatedPlayer.currentRoundScore,
      rounds: updatedPlayer.rounds,
      currentRoundNumber: updatedPlayer.currentRoundNumber,
      usedCardsThisRound: updatedPlayer.usedCardsThisRound
    });
  };

  const selectedCardsTotal = selectedCards.reduce((sum, val) => sum + val, 0);
  const modifierTotal = activeModifiers.reduce((sum, val) => sum + val, 0);
  // Calculate: (cards) × x2 + modifiers
  const cardsAfterX2 = x2Active ? selectedCardsTotal * 2 : selectedCardsTotal;
  const finalPreviewScore = cardsAfterX2 + modifierTotal;
  const hasSelection = selectedCards.length > 0;
  const hasModifiersOrX2 = activeModifiers.length > 0 || x2Active;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-500">
      <h3 className="text-xl font-bold mb-4">Your Controls</h3>
      
      {/* Round Number Display */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-600 font-medium">Round {player.currentRoundNumber || 1}</div>
      </div>

      {/* Total Score Display - More Visible */}
      <div className="mb-6 p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
        <div className="text-sm text-gray-600 mb-2">Total Score</div>
        <div className="text-5xl font-bold text-purple-700">{player.totalScore}</div>
        <div className="text-sm text-gray-600 mt-2">Current Round: {player.currentRoundScore} pts</div>
      </div>

      {/* Previous Rounds Toggle */}
      {player.rounds.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowPreviousRounds(!showPreviousRounds)}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-sm"
          >
            {showPreviousRounds ? 'Hide' : 'Show'} Previous Rounds ({player.rounds.length})
          </button>
          {showPreviousRounds && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm font-medium text-gray-700 mb-2">Round History:</div>
              <div className="space-y-1">
                {player.rounds.map((score, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    Round {index + 1}: <span className="font-semibold">{score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Buttons (+1 through +12) - Select cards */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Pick Up Cards</div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => {
            const isUsed = usedCards.includes(value);
            const isSelected = selectedCards.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleCard(value)}
                disabled={isUsed}
                className={`py-2 px-3 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isUsed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-700 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                title={isUsed ? 'Already used this round' : isSelected ? 'Selected' : 'Click to select'}
              >
                +{value}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {selectedCards.length > 0 
            ? `Selected: ${selectedCards.join(', ')} (Total: +${selectedCardsTotal})`
            : 'Click cards to select them'}
        </div>
      </div>

      {/* Modifier Cards */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Modifier Cards</div>
        <div className="grid grid-cols-5 gap-2">
          {modifierOptions.map((value) => (
            <button
              key={value}
              onClick={() => toggleModifier(value)}
              className={`py-2 px-3 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-green-500 ${
                activeModifiers.includes(value)
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              +{value}
            </button>
          ))}
        </div>
        {modifierTotal > 0 && (
          <div className="text-xs text-gray-600 mt-1">Total modifiers: +{modifierTotal}</div>
        )}
      </div>

      {/* x2 Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setX2Active(!x2Active)}
          className={`w-full py-3 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            x2Active
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {x2Active ? 'x2 Active (Will multiply final score)' : 'x2 Card (Inactive)'}
        </button>
      </div>

      {/* Score Preview and Save Button */}
      {hasSelection && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="text-sm text-gray-700 mb-2">
            <div className="font-medium mb-1">Score Preview:</div>
            <div>
              {x2Active ? (
                <>
                  Cards: ({selectedCards.join(' + ')}) × 2 = {cardsAfterX2}
                  {modifierTotal > 0 && ` + Modifiers: ${modifierTotal}`}
                </>
              ) : (
                <>
                  Cards: {selectedCards.join(' + ')} = {selectedCardsTotal}
                  {modifierTotal > 0 && ` + Modifiers: ${modifierTotal}`}
                </>
              )}
              {' = '}
              <span className="font-bold text-lg">{finalPreviewScore}</span>
            </div>
          </div>
          <button
            onClick={handleSaveScore}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold text-lg"
          >
            Save Score (+{finalPreviewScore} pts)
          </button>
        </div>
      )}

      {/* Score Preview and Apply Modifiers Button (for existing score) */}
      {!hasSelection && hasModifiersOrX2 && player.currentRoundScore > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-gray-700 mb-2">
            {x2Active ? (
              <>
                Preview: ({player.currentRoundScore}) × 2 = {player.currentRoundScore * 2}
                {modifierTotal > 0 && ` + ${modifierTotal} = ${(player.currentRoundScore * 2) + modifierTotal}`}
              </>
            ) : (
              <>
                Preview: {player.currentRoundScore} + {modifierTotal} = {player.currentRoundScore + modifierTotal}
              </>
            )}
          </div>
          <button
            onClick={handleApplyModifiers}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-semibold"
          >
            Apply Modifiers {x2Active && '& x2'} ({x2Active ? (player.currentRoundScore * 2) + modifierTotal : player.currentRoundScore + modifierTotal} pts)
          </button>
        </div>
      )}

      {/* -15 Button */}
      <div className="mb-4">
        <button
          onClick={handleSubtract15}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
        >
          -15 (Current Round Only)
        </button>
      </div>

      {/* Bank Round Button */}
      <div>
        <button
          onClick={handleBankRound}
          disabled={player.currentRoundScore === 0}
          className="w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Bank Round ({player.currentRoundScore} pts)
        </button>
      </div>
    </div>
  );
}
