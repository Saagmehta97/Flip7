# Flip7

A multiplayer score tracker and leaderboard application for the card game Flip 7.

## Description

Flip7 is a real-time score tracking system that allows multiple players to record and compare their game scores. The application features:

- **Real-time Score Tracking**: Add and record scores for all players with live updates
- **Live Leaderboard**: View all players ranked by their highest scores, automatically updating
- **Interactive Controls**: Use buttons to easily add new scores to the tracker
- **Shared Game Sessions**: Multiple friends can join the same game via a shared link
- **No Login Required**: Players simply enter their name to join

Players can input their scores through the interface, and the leaderboard will automatically update in real-time to show rankings from highest to lowest score.

## Features

### Scoring System
- **Current Round Score**: Accumulate points during a round
- **Bank Round**: Save current round score to total score
- **Score Buttons**: Quick buttons to add +1, +2, +5, or +10 points
- **x2 Card**: Toggle to double the next score added (auto-resets after use)
- **-15 Penalty**: Subtract 15 points from current round only (never goes below 0)

### Multiplayer
- Shared game link for easy access
- Real-time synchronization across all players
- Each player can only control their own score
- View-only access to other players' scores

## Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase account (free tier works)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Flip7
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project (or use existing)
   - Enable Firestore Database (start in test mode for development)
   - Go to Project Settings > General
   - Scroll down to "Your apps" and add a web app
   - Copy the Firebase configuration

4. Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

5. Configure Firestore Security Rules (for development):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gameSessions/{sessionId} {
      allow read, write: if true; // Open for development - restrict in production
    }
  }
}
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` file is already configured for client-side routing.

## Usage

1. **Create/Join Game**: Open the app - a new game session is created automatically, or use a shared link
2. **Enter Name**: Enter your display name to join the game
3. **Share Link**: Copy the game link and share with friends
4. **Add Scores**: Use the score buttons (+1, +2, +5, +10) to add points to your current round
5. **Use x2 Card**: Toggle x2 before adding a score to double it
6. **Apply -15 Penalty**: Click -15 to subtract from current round only
7. **Bank Round**: Click "Bank Round" to save your current round score to your total
8. **View Leaderboard**: See all players ranked by total score in real-time

## Game Rules

- **Current Round Score**: Points accumulated during the current round
- **Total Score**: Sum of all banked round scores
- **Banking**: Moves current round score to total, resets current round to 0
- **x2 Card**: Doubles the next score addition, then automatically deactivates
- **-15 Penalty**: Only affects current round score, cannot go below 0

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase Firestore (real-time database)
- **Build Tool**: Vite
- **Routing**: React Router
- **Deployment**: Vercel-ready

## Project Structure

```
Flip7/
├── src/
│   ├── components/       # React components
│   │   ├── JoinGame.tsx
│   │   ├── PlayerList.tsx
│   │   └── PlayerControls.tsx
│   ├── firebase/         # Firebase configuration and functions
│   │   ├── config.ts
│   │   └── gameSession.ts
│   ├── utils/            # Game logic utilities
│   │   └── gameLogic.ts
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

## License

MIT

