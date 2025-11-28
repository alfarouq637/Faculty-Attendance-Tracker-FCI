import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// ------------------------------------------------------------------
// CONFIGURATION INSTRUCTIONS:
// 1. Go to Firebase Console > Project Settings.
// 2. Copy your "firebaseConfig" object.
// 3. Paste the values directly below.
// ------------------------------------------------------------------

const firebaseConfig = {
  // REPLACE THE STRINGS BELOW WITH YOUR ACTUAL FIREBASE KEYS
  apiKey: "AIzaSy...", 
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (err) {
    console.error("Firebase Initialization Error. Did you paste your keys in services/firebase.ts?", err);
  }
}

export const auth = firebase.auth();
export const db = firebase.firestore();
export const googleProvider = new firebase.auth.GoogleAuthProvider();

export default firebase;