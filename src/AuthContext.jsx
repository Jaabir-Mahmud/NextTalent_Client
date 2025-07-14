import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { clearUserData, hasStaleUserData, performFreshStart, forceAppReload } from "./utils/dataCleanup";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const db = getFirestore();

  // Memoized logout function
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      
      // Clear all user-specific data
      clearUserData();
      
      // Reset all state
      setUser(null);
      setRole(null);
      setFirstName(null);
      setLastName(null);
      setPhotoURL(null);
      setNeedsProfileSetup(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }, []);

  // Memoized user data fetching
  const fetchUserData = useCallback(async (firebaseUser, isNewLogin = false) => {
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setRole(userData.role);
        setFirstName(userData.firstName);
        setLastName(userData.lastName);
        setPhotoURL(userData.photoURL || firebaseUser.photoURL);
        setNeedsProfileSetup(false);
        return { isValid: true, needsSetup: false };
      } else {
        // User document doesn't exist
        if (isNewLogin) {
          // For new logins (like Google), this is expected - user needs to complete profile
          console.log('New user detected - no user document found. User needs to complete profile setup.');
          setRole(null);
          setFirstName(firebaseUser.displayName?.split(' ')[0] || null);
          setLastName(firebaseUser.displayName?.split(' ').slice(1).join(' ') || null);
          setPhotoURL(firebaseUser.photoURL);
          setNeedsProfileSetup(true);
          return { isValid: true, needsSetup: true };
        } else {
          // For existing sessions, missing document indicates deleted account
          console.warn('User document not found for existing session. Account may have been deleted.');
          setRole(null);
          setFirstName(null);
          setLastName(null);
          setPhotoURL(null);
          setNeedsProfileSetup(false);
          return { isValid: false, needsSetup: false };
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      // For errors, set default values and return false
      setRole(null);
      setFirstName(null);
      setLastName(null);
      setPhotoURL(firebaseUser.photoURL);
      setNeedsProfileSetup(false);
      return { isValid: false, needsSetup: false };
    }
  }, [db]);

  // Memoized auth state change handler
  const handleAuthStateChange = useCallback(async (firebaseUser) => {
    // Add a longer delay to prevent flashing during signup
    setTimeout(async () => {
      // If user is signing out, clear their data
      if (!firebaseUser) {
        clearUserData();
        setUser(null);
        setRole(null);
        setFirstName(null);
        setLastName(null);
        setPhotoURL(null);
        setNeedsProfileSetup(false);
        setLoading(false);
        return;
      }

      // Check if this might be a new login (no previous user data in localStorage)
      const hasExistingData = localStorage.getItem('user_id') !== null;
      const isNewLogin = !hasExistingData || localStorage.getItem('user_id') !== firebaseUser.uid;

      // If user is signing in, check for stale data and clear if necessary
      if (firebaseUser && hasStaleUserData()) {
        console.log('Detected stale user data, clearing...');
        clearUserData();
      }

      setUser(firebaseUser);
      const userResult = await fetchUserData(firebaseUser, isNewLogin);
      
      // Handle different scenarios based on the result
      if (!userResult.isValid) {
        // Invalid account (existing session with deleted account)
        console.warn('Invalid account detected during auth state change. Logging out...');
        try {
          await signOut(auth);
          clearUserData();
          forceAppReload();
        } catch (error) {
          console.error('Error during forced logout:', error);
          forceAppReload();
        }
        return;
      } else if (userResult.needsSetup) {
        // New user needs to complete profile setup
        console.log('New user needs to complete profile setup');
        // Store user ID to track this session
        localStorage.setItem('user_id', firebaseUser.uid);
        // You can redirect to profile setup page here if needed
      } else {
        // Existing user with valid account
        localStorage.setItem('user_id', firebaseUser.uid);
      }
      
      setLoading(false);
    }, 100);
  }, [fetchUserData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  // Function to check if current user account is still valid
  const validateAccountStatus = useCallback(async () => {
    if (!user) return false;
    
    try {
      // Try to refresh the token to check if account still exists
      await user.getIdToken(true); // Force refresh
      
      // Also check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.warn('User account deleted from Firestore. Logging out...');
        try {
          await signOut(auth);
          clearUserData();
          forceAppReload();
        } catch (error) {
          console.error('Error during logout:', error);
          forceAppReload();
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Account validation failed:', error);
      
      if (error.code === 'auth/user-token-expired' || 
          error.code === 'auth/user-disabled' || 
          error.code === 'auth/user-not-found') {
        console.warn('User account is invalid. Logging out...');
        try {
          await signOut(auth);
          clearUserData();
          forceAppReload();
        } catch (logoutError) {
          console.error('Error during logout:', logoutError);
          forceAppReload();
        }
        return false;
      }
      
      return false;
    }
  }, [user, db]);

  // Periodic account validation (every 5 minutes)
  useEffect(() => {
    if (!user || loading) return;

    let isActive = true; // Flag to prevent state updates after unmount

    const validatePeriodically = async () => {
      if (!isActive) return;
      
      try {
        const isValid = await validateAccountStatus();
        if (!isValid && isActive) {
          console.log('Periodic validation failed - account deleted');
        }
      } catch (error) {
        console.error('Periodic validation error:', error);
      }
    };

    // Validate immediately after login (with delay)
    const initialTimeout = setTimeout(validatePeriodically, 2000);

    // Then validate every 5 minutes
    const interval = setInterval(validatePeriodically, 5 * 60 * 1000);

    return () => {
      isActive = false;
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [user, loading, validateAccountStatus]);

  // Function for complete fresh start (useful for account deletion or reset)
  const freshStart = useCallback(async () => {
    try {
      await signOut(auth);
      performFreshStart();
    } catch (error) {
      console.error('Error performing fresh start:', error);
      // Even if signOut fails, perform data cleanup
      performFreshStart();
    }
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    role,
    firstName,
    lastName,
    photoURL,
    loading,
    needsProfileSetup,
    logout,
    freshStart,
    validateAccountStatus
  }), [user, role, firstName, lastName, photoURL, loading, needsProfileSetup, logout, freshStart, validateAccountStatus]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 