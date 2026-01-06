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

  const handleBusted = async () => {
    // Clear entire current round score and reset used cards
    await updatePlayerScore(sessionId, player.id, {
      currentRoundScore: 0,
      usedCardsThisRound: [] // Reset used cards so they can pick them again
    });
    // Also clear any selected cards and modifiers since the round is busted
    setSelectedCards([]);
    setActiveModifiers([]);
    if (x2Active) {
      setX2Active(false);
    }
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
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border-2 border-blue-500">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Controls</h3>
      
      {/* Round Number Display */}
      <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm sm:text-base text-blue-600 font-medium">Round {player.currentRoundNumber || 1}</div>
      </div>

      {/* Total Score Display - More Visible with Score Preview */}
      <div className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border-2 border-purple-300">
        <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Total Score</div>
        <div className="text-4xl sm:text-5xl font-bold text-purple-700">{player.totalScore}</div>
        <div className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-3 mb-2 sm:mb-3 border-t border-purple-200 pt-2 sm:pt-3">
          <div className="font-semibold text-gray-700 mb-1">Current Round: {player.currentRoundScore} pts</div>
          {hasSelection && (
            <div className="text-xs sm:text-sm text-gray-700 mt-2 bg-white/50 p-2 rounded">
              <div className="font-medium mb-1">Preview:</div>
              <div className="leading-relaxed">
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
                <span className="font-bold text-base sm:text-lg text-green-700">{finalPreviewScore}</span>
              </div>
            </div>
          )}
          {!hasSelection && hasModifiersOrX2 && player.currentRoundScore > 0 && (
            <div className="text-xs sm:text-sm text-gray-700 mt-2 bg-white/50 p-2 rounded">
              <div className="font-medium mb-1">Preview:</div>
              <div className="leading-relaxed">
                {x2Active ? (
                  <>
                    ({player.currentRoundScore}) × 2 = {player.currentRoundScore * 2}
                    {modifierTotal > 0 && ` + ${modifierTotal} = ${(player.currentRoundScore * 2) + modifierTotal}`}
                  </>
                ) : (
                  <>
                    {player.currentRoundScore} + {modifierTotal} = {player.currentRoundScore + modifierTotal}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Previous Rounds Toggle */}
      {player.rounds.length > 0 && (
        <div className="mb-3 sm:mb-4">
          <button
            onClick={() => setShowPreviousRounds(!showPreviousRounds)}
            className="w-full bg-gray-200 text-gray-700 py-2 px-3 sm:px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-xs sm:text-sm"
          >
            {showPreviousRounds ? 'Hide' : 'Show'} Previous Rounds ({player.rounds.length})
          </button>
          {showPreviousRounds && (
            <div className="mt-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Round History:</div>
              <div className="space-y-1">
                {player.rounds.map((score, index) => (
                  <div key={index} className="text-xs sm:text-sm text-gray-600">
                    Round {index + 1}: <span className="font-semibold">{score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons - x2, -15, Bank Round on one line */}
      <div className="mb-4">
        <div className="grid grid-cols-3 gap-2">
          {/* x2 Toggle */}
          <button
            onClick={() => setX2Active(!x2Active)}
            className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-md font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 active:scale-95 transition-transform ${
              x2Active
                ? 'bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
            }`}
          >
            {x2Active ? 'x2 Active' : 'x2 Card'}
          </button>
          
          {/* -15 Button */}
          <button
            onClick={handleSubtract15}
            className="bg-red-600 text-white py-2.5 sm:py-3 px-2 sm:px-3 rounded-md hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform"
          >
            -15
          </button>
          
          {/* Bank Round Button */}
          <button
            onClick={handleBankRound}
            disabled={player.currentRoundScore === 0}
            className="bg-purple-600 text-white py-2.5 sm:py-3 px-2 sm:px-3 rounded-md hover:bg-purple-700 active:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
          >
            Bank
          </button>
        </div>
      </div>

      {/* Card Buttons (+1 through +12) - Select cards */}
      <div className="mb-4">
        <div className="text-sm sm:text-base font-medium text-gray-700 mb-2">Pick Up Cards</div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((value) => {
            const isUsed = usedCards.includes(value);
            const isSelected = selectedCards.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleCard(value)}
                disabled={isUsed}
                className={`py-3 sm:py-4 px-2 sm:px-3 rounded-md font-bold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-95 transition-transform ${
                  isUsed
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-700 text-white shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                }`}
                title={isUsed ? 'Already used this round' : isSelected ? 'Selected' : 'Click to select'}
              >
                +{value}
              </button>
            );
          })}
        </div>
        <div className="text-xs sm:text-sm text-gray-500 mt-2">
          {selectedCards.length > 0 
            ? `Selected: ${selectedCards.join(', ')} (Total: +${selectedCardsTotal})`
            : 'Tap cards to select them'}
        </div>
      </div>

      {/* Modifier Cards - Underneath card selection */}
      <div className="mb-4">
        <div className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5">Modifier Cards</div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {modifierOptions.map((value) => (
            <button
              key={value}
              onClick={() => toggleModifier(value)}
              className={`py-2 sm:py-2.5 px-2 rounded-md font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95 transition-transform ${
                activeModifiers.includes(value)
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400'
              }`}
            >
              +{value}
            </button>
          ))}
        </div>
        {modifierTotal > 0 && (
          <div className="text-xs text-gray-600 mt-1">Total: +{modifierTotal}</div>
        )}
      </div>

      {/* Busted Button */}
      <div className="mb-4">
        <button
          onClick={handleBusted}
          disabled={player.currentRoundScore === 0}
          className="w-full bg-red-800 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-md hover:bg-red-900 active:bg-red-950 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-transform disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          BUSTED (Clear Round)
        </button>
      </div>

      {/* Save Score Button - Only show when cards are selected */}
      {hasSelection && (
        <div className="mb-4">
          <button
            onClick={handleSaveScore}
            className="w-full bg-green-600 text-white py-3 sm:py-4 px-4 rounded-md hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform"
          >
            Save Score (+{finalPreviewScore} pts)
          </button>
        </div>
      )}

      {/* Apply Modifiers Button - Only show when modifiers/x2 active and no cards selected */}
      {!hasSelection && hasModifiersOrX2 && player.currentRoundScore > 0 && (
        <div className="mb-4">
          <button
            onClick={handleApplyModifiers}
            className="w-full bg-green-600 text-white py-3 sm:py-4 px-4 rounded-md hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm sm:text-base shadow-md active:scale-95 transition-transform"
          >
            Apply Modifiers {x2Active && '& x2'} ({x2Active ? (player.currentRoundScore * 2) + modifierTotal : player.currentRoundScore + modifierTotal} pts)
          </button>
        </div>
      )}
    </div>
  );
}
