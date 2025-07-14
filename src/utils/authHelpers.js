import { doc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

/**
 * Create a user document in Firestore for new users
 * @param {Object} firebaseUser - The Firebase user object
 * @param {Object} additionalData - Additional user data (role, etc.)
 * @returns {Promise<boolean>} - Success status
 */
export const createUserDocument = async (firebaseUser, additionalData = {}) => {
  if (!firebaseUser) return false;
  
  try {
    const db = getFirestore();
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      firstName: additionalData.firstName || firebaseUser.displayName?.split(' ')[0] || '',
      lastName: additionalData.lastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
      photoURL: additionalData.photoURL || firebaseUser.photoURL,
      role: additionalData.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...additionalData
    };
    
    await setDoc(userRef, userData);
    console.log('User document created successfully');
    return true;
  } catch (error) {
    console.error('Error creating user document:', error);
    return false;
  }
};

/**
 * Check if a user needs to complete profile setup
 * @param {Object} user - The Firebase user object
 * @param {string} role - The user's role
 * @param {string} firstName - The user's first name
 * @returns {boolean} - Whether profile setup is needed
 */
export const needsProfileSetup = (user, role, firstName) => {
  if (!user) return false;
  
  // If no role or no firstName, user needs to complete setup
  return !role || !firstName;
};
