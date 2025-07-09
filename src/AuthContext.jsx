import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [firstName, setFirstName] = useState(null);
  const [lastName, setLastName] = useState(null);
  const [photoURL, setPhotoURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Add a longer delay to prevent flashing during signup
      setTimeout(async () => {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Fetch user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.role);
            setFirstName(userData.firstName);
            setLastName(userData.lastName);
            setPhotoURL(userData.photoURL || firebaseUser.photoURL);
          } else {
            setRole(null);
            setFirstName(null);
            setLastName(null);
            setPhotoURL(firebaseUser.photoURL);
          }
        } else {
          setRole(null);
          setFirstName(null);
          setLastName(null);
          setPhotoURL(null);
        }
        setLoading(false);
      }, 1000);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <AuthContext.Provider value={{ user, role, firstName, lastName, photoURL, loading }}>
      {children}
    </AuthContext.Provider>
  );
}; 