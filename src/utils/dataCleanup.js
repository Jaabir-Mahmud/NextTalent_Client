/**
 * Utility functions for managing user data and localStorage cleanup
 */

/**
 * Force reload the current page to clear all app state
 * Useful for handling deleted accounts or major state issues
 */
export const forceAppReload = () => {
  console.log('Forcing app reload to clear all state...');
  window.location.reload();
};

/**
 * Clear all user-specific data from localStorage
 * This should be called when user logs out or deletes account
 */
export const clearUserData = () => {
  try {
    // Clear resume-specific data
    localStorage.removeItem('resumeTemplates');
    localStorage.removeItem('uploadedResumeFiles');
    
    // Clear any other user-specific data
    // Note: We preserve theme preference as it's user preference, not account data
    
    console.log('User data cleared from localStorage');
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

/**
 * Clear all localStorage data (including theme)
 * Use this for complete reset/fresh start
 */
export const clearAllLocalData = () => {
  try {
    localStorage.clear();
    console.log('All localStorage data cleared');
  } catch (error) {
    console.error('Error clearing all local data:', error);
  }
};

/**
 * Clear session storage
 */
export const clearSessionData = () => {
  try {
    sessionStorage.clear();
    console.log('All sessionStorage data cleared');
  } catch (error) {
    console.error('Error clearing session data:', error);
  }
};

/**
 * Complete data cleanup for fresh start
 * Clears localStorage, sessionStorage, and any cached component state
 */
export const performFreshStart = () => {
  clearAllLocalData();
  clearSessionData();
  
  // Force page reload to ensure all component state is reset
  setTimeout(() => {
    window.location.reload();
  }, 100);
};

/**
 * Check if user data exists in localStorage
 * Useful for detecting stale data
 */
export const hasStaleUserData = () => {
  try {
    const resumeTemplates = localStorage.getItem('resumeTemplates');
    const uploadedFiles = localStorage.getItem('uploadedResumeFiles');
    
    return !!(resumeTemplates || uploadedFiles);
  } catch {
    return false;
  }
};
