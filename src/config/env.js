// src/config/env.js

export const config = {
  // Hugging Face API Token for AI Suggestions
  HF_TOKEN: import.meta.env.VITE_HF_TOKEN,

  // Firebase Configuration - Now hardcoded in firebase.js
  FIREBASE_API_KEY: "AIzaSyCAyqtFD9_oYmHLFSTONDE6uYiqab8ANT0",
  FIREBASE_AUTH_DOMAIN: "nexttalent-72519.firebaseapp.com",
  FIREBASE_PROJECT_ID: "nexttalent-72519",
  FIREBASE_STORAGE_BUCKET: "nexttalent-72519.firebasestorage.app",
  FIREBASE_MESSAGING_SENDER_ID: "955096311098",
  FIREBASE_APP_ID: "1:955096311098:web:707bbbe4ea3f5cde871c03",
};

// Check if required environment variables are set
export const validateConfig = () => {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID',
  ];

  const missing = required.filter(key => !config[key] || config[key].includes('your_'));

  if (missing.length > 0) {
    console.warn('🚨 Missing Firebase configuration:', missing);
    return false;
  }
  
  console.log('✅ Firebase configuration validated successfully');
  return true;
};
