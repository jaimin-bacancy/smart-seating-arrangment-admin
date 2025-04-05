import { useState, useEffect } from 'react';
import { firestore } from '../config/firebaseConfig';
import { WithId } from '../types/firebase';
import { Timestamp } from 'firebase/firestore';
// Hook for fetching and tracking a single document
export const useDocument = <T>(collection: string, id: string | null) => {
  const [document, setDocument] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setDocument(null);
      setLoading(false);
      return;
    }

    const unsubscribe = firestore.collection(collection).doc(id).onSnapshot(
      (doc) => {
        if (doc.exists) {
          setDocument({
            id: doc.id,
            ...doc.data()
          } as WithId<T>);
        } else {
          setDocument(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error fetching document ${id} from ${collection}:`, err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Clean up on unmount
    return () => unsubscribe();
  }, [collection, id]);

  // Function to update the document
  const updateDocument = async (data: Partial<T>) => {
    if (!id) return;
    
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

  // Function to delete the document
  const deleteDocument = async () => {
    if (!id) return;
    
    try {
      await firestore.collection(collection).doc(id).delete();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { 
    document, 
    loading, 
    error,
    updateDocument,
    deleteDocument
  };
};

export default useDocument;
