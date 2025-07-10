// Environment Configuration
export const config = {
  // Hugging Face API Token for AI Suggestions
  HF_TOKEN: import.meta.env.VITE_HF_TOKEN || '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',
  
  // Firebase Configuration
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if required environment variables are set
export const validateConfig = () => {
  const required = ['HF_TOKEN'];
  const missing = required.filter(key => !config[key] || config[key] === 'your_huggingface_token_here');
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Please set VITE_HF_TOKEN in your .env file');
    return false;
  }
  return true;
}; 