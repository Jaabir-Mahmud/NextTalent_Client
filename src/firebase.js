// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAyqtFD9_oYmHLFSTONDE6uYiqab8ANT0",
  authDomain: "nexttalent-72519.firebaseapp.com",
  projectId: "nexttalent-72519",
  storageBucket: "nexttalent-72519.firebasestorage.app",
  messagingSenderId: "955096311098",
  appId: "1:955096311098:web:707bbbe4ea3f5cde871c03"
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

export { auth, db };
export default app;