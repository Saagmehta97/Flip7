import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JoinGame } from './components/JoinGame';
import { PlayerList } from './components/PlayerList';
import { PlayerControls } from './components/PlayerControls';
import { GameSession } from './types';
import { 
  createGameSession, 
  getGameSession, 
  subscribeToGameSession,
  addPlayerToSession 
} from './firebase/mockGameSession';

function GameScreen({ sessionId, currentPlayerId }: { sessionId: string; currentPlayerId: string }) {
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = subscribeToGameSession(sessionId, (updatedSession) => {
      setSession(updatedSession);
    });

    return () => unsubscribe();
  }, [sessionId]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading game session...</div>
      </div>
    );
  }

  const players = Object.values(session.players);
  const currentPlayer = players.find(p => p.id === currentPlayerId);

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Flip 7 Scorecard</h1>
        
        <div className="mb-4 sm:mb-6 text-center">
          <div className="inline-block bg-white px-3 sm:px-4 py-2 rounded-lg shadow">
            <span className="text-xs sm:text-sm text-gray-600">Game ID: </span>
            <span className="font-mono font-semibold text-xs sm:text-sm">{sessionId}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              className="ml-2 text-blue-600 hover:text-blue-700 active:text-blue-800 text-xs sm:text-sm font-semibold py-1 px-2 rounded active:bg-blue-50"
            >
              Copy Link
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {currentPlayer && (
            <div>
              <PlayerControls player={currentPlayer} sessionId={sessionId} />
            </div>
          )}
          <div>
            <PlayerList players={players} currentPlayerId={currentPlayerId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { sessionId } = useParams<{ sessionId?: string }>();
  const navigate = useNavigate();
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If no sessionId in URL, create a new game session
    if (!sessionId) {
      createGameSession().then((newSessionId) => {
        navigate(`/${newSessionId}`, { replace: true });
      });
      return;
    }

    // Check if session exists
    getGameSession(sessionId).then((fetchedSession) => {
      if (!fetchedSession) {
        // Session doesn't exist, create new one
        createGameSession().then((newSessionId) => {
          navigate(`/${newSessionId}`, { replace: true });
        });
      } else {
        setLoading(false);
        
        // Check if stored playerId exists in this session
        const storedPlayerId = localStorage.getItem('currentPlayerId');
        if (storedPlayerId && fetchedSession.players[storedPlayerId]) {
          setCurrentPlayerId(storedPlayerId);
        } else {
          // Clear invalid playerId from localStorage
          localStorage.removeItem('currentPlayerId');
        }
      }
    });

    // Subscribe to session updates to verify player still exists
    const unsubscribe = subscribeToGameSession(sessionId, (updatedSession) => {
      if (updatedSession && currentPlayerId && !updatedSession.players[currentPlayerId]) {
        // Player no longer exists in session, clear and show join screen
        setCurrentPlayerId(null);
        localStorage.removeItem('currentPlayerId');
      }
    });

    return () => unsubscribe();
  }, [sessionId, navigate, currentPlayerId]);

  const handleJoin = async (playerName: string) => {
    if (!sessionId) return;

    // Generate a unique player ID
    const playerId = `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    await addPlayerToSession(sessionId, playerId, playerName);
    
    // Store player ID in localStorage
    localStorage.setItem('currentPlayerId', playerId);
    setCurrentPlayerId(playerId);
  };

  if (loading || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If player hasn't joined yet, show join screen
  if (!currentPlayerId) {
    return <JoinGame onJoin={handleJoin} />;
  }

  return <GameScreen sessionId={sessionId} currentPlayerId={currentPlayerId} />;
}

export default App;

