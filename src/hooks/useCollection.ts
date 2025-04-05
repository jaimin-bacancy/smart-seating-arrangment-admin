// import { useState, useEffect } from 'react';
// import { firestore } from '../config/firebaseConfig';
// import { FirestoreQuery, WithId } from '../types/firebase';

// // Hook for querying collections with filters
// export const useCollection = <T>(
//   collectionName: string,
//   queries: { field: string; operator: firebase.firestore.WhereFilterOp; value: any }[] = [],
//   orderBy?: { field: string; direction: 'asc' | 'desc' },
//   limit?: number
// ) => {
//   const [documents, setDocuments] = useState<WithId<T>[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);

//   console.log('queries::', queries)
//   useEffect(() => {
//     let collectionRef: FirestoreQuery = firestore.collection(collectionName);

//     // Apply queries (where clauses)
//     queries.forEach(({ field, operator, value }) => {
//       collectionRef = collectionRef.where(field, operator, value);
//     });

//     // Apply order by
//     if (orderBy) {
//       collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction);
//     }

//     // Apply limit
//     if (limit) {
//       collectionRef = collectionRef.limit(limit);
//     }

//     // Set up the snapshot listener
//     const unsubscribe = collectionRef.onSnapshot(
//       (snapshot) => {
//         const results: WithId<T>[] = [];
//         snapshot.forEach(doc => {
//           results.push({
//             id: doc.id,
//             ...doc.data()
//           } as WithId<T>);
//         });
//         setDocuments(results);
//         setLoading(false);
//         setError(null);
//       },
//       (err) => {
//         // console.error(`Error querying ${collectionName}:`, err);
//         setError(err as Error);
//         setLoading(false);
//       }
//     );

//     // Clean up on unmount
//     return () => unsubscribe();
//   }, [collectionName, JSON.stringify(queries), orderBy?.field, orderBy?.direction, limit]);

//   return { documents, loading, error };
// };

// export default useCollection;

// hooks/useCollection.ts
import { useState, useEffect } from 'react';
import { firestore } from '../config/firebaseConfig';
import { FirestoreQuery, WithId } from '../types/firebase';

type Query<T> = {
  field: string;
  operator: firebase.firestore.WhereFilterOp;
  value: any;
};

// Hook for querying collections with filters
export const useCollection = <T>(
  collectionName: string,
  queries: Query<T>[] = [],
  orderBy?: { field: string; direction: 'asc' | 'desc' },
  limit?: number
) => {
  const [documents, setDocuments] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Create a stable dependency string for queries
  const queryDeps = queries
    .map(q => `${q.field}:${q.operator}:${q.value?.path || q.value}`)
    .join('|');

  useEffect(() => {
    let collectionRef: FirestoreQuery = firestore.collection(collectionName);

    // Prevent running query if values are invalid (e.g., undefined or null)
    if (!queries.every(q => q.value !== undefined && q.value !== null)) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    // Apply filters
    queries.forEach(({ field, operator, value }) => {
      collectionRef = collectionRef.where(field, operator, value);
    });

    // Apply ordering
    if (orderBy) {
      collectionRef = collectionRef.orderBy(orderBy.field, orderBy.direction);
    }

    // Apply limit
    if (limit) {
      collectionRef = collectionRef.limit(limit);
    }

    // Real-time snapshot listener
    const unsubscribe = collectionRef.onSnapshot(
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
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, queryDeps, orderBy?.field, orderBy?.direction, limit]);

  return { documents, loading, error };
};

export default useCollection;
