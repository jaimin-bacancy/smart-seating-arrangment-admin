import { useState, useEffect } from 'react';
import { firestore } from '../config/firebaseConfig';
import { WithId } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';
// Generic hook for CRUD operations on Firestore
export const useFirestore = <T>(collection: string) => {
  const [documents, setDocuments] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to add a document
  const addDocument = async (data: T) => {
    try {
      const docRef = await firestore.collection(collection).add({
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Function to update a document
  const updateDocument = async (id: string, data: Partial<T>) => {
    try {
      await firestore.collection(collection).doc(id).update({
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Function to delete a document
  const deleteDocument = async (id: string) => {
    try {
      await firestore.collection(collection).doc(id).delete();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Function to get a single document
  const getDocument = async (id: string): Promise<WithId<T> | null> => {
    try {
      const doc = await firestore.collection(collection).doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { 
        id: doc.id, 
        ...doc.data() 
      } as WithId<T>;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // Load all documents on mount
  useEffect(() => {
    const unsubscribe = firestore.collection(collection)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const results: WithId<T>[] = [];
          snapshot.forEach(doc => {
            results.push({
              id: doc.id,
              ...doc.data()
            } as WithId<T>);
          });
          setDocuments(results);
          setLoading(false);
          setError(null);
        },
        (err) => {
          // console.error(`Error fetching ${collection}:`, err);
          setError(err as Error);
          setLoading(false);
        }
      );

    // Clean up on unmount
    return () => unsubscribe();
  }, [collection]);

  return {
    documents,
    loading,
    error,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument
  };
};