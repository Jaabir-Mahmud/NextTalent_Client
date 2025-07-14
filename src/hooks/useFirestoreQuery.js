import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../AuthContext';

export const useFirestoreQuery = (collectionName, constraints = [], options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Reset data when user changes
  useEffect(() => {
    setData([]);
    setLoading(true);
    setError(null);
  }, [user?.uid]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Firebase is properly initialized
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        setError('Firebase not initialized');
        setLoading(false);
        return;
      }
      
      let q = collection(db, collectionName);
      
      // Apply constraints
      constraints.forEach(constraint => {
        if (constraint.type === 'where') {
          q = query(q, where(constraint.field, constraint.operator, constraint.value));
        } else if (constraint.type === 'orderBy') {
          q = query(q, orderBy(constraint.field, constraint.direction || 'asc'));
        } else if (constraint.type === 'limit') {
          q = query(q, limit(constraint.value));
        }
      });

      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setData(result);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionName, constraints]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export const useFirestoreRealtimeQuery = (collectionName, constraints = [], options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Reset data when user changes
  useEffect(() => {
    setData([]);
    setLoading(true);
    setError(null);
  }, [user?.uid]);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if Firebase is properly initialized
      const db = getFirestore();
      if (!db) {
        console.error('Firebase not initialized');
        setError('Firebase not initialized');
        setLoading(false);
        return;
      }
      
      let q = collection(db, collectionName);
      
      // Apply constraints
      constraints.forEach(constraint => {
        if (constraint.type === 'where') {
          q = query(q, where(constraint.field, constraint.operator, constraint.value));
        } else if (constraint.type === 'orderBy') {
          q = query(q, orderBy(constraint.field, constraint.direction || 'asc'));
        } else if (constraint.type === 'limit') {
          q = query(q, limit(constraint.value));
        }
      });

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const result = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setData(result);
          setLoading(false);
        },
        (err) => {
          console.error(`Error in realtime query for ${collectionName}:`, err);
          setError(err.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error(`Error setting up realtime query for ${collectionName}:`, err);
      setError(err.message);
      setLoading(false);
    }
  }, [collectionName, constraints]);

  return { data, loading, error };
}; 