# Quick Setup Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Firebase Setup

1. Go to https://console.firebase.google.com/
2. Click "Add project" or select an existing project
3. Enable **Firestore Database**:
   - Go to "Build" > "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose a location

4. Get your Firebase config:
   - Go to Project Settings (gear icon)
   - Scroll to "Your apps"
   - Click the web icon (`</>`) to add a web app
   - Copy the config values

5. Create `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

6. Set Firestore Security Rules (for development):
   - Go to Firestore Database > Rules
   - Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gameSessions/{sessionId} {
      allow read, write: if true;
    }
  }
}
```
   - Click "Publish"

## 3. Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 4. Test It

1. Open the app - a new game session will be created
2. Enter your name and join
3. Copy the game link
4. Open the link in another browser/incognito window
5. Enter a different name
6. Try adding scores - you should see real-time updates!

## Production Deployment

### Vercel

1. Push code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. Add environment variables (same as `.env` file)
5. Deploy!

The app will automatically work with the shared game links.

