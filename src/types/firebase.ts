import { firebase } from '../config/firebaseConfig';

// Define Firebase-specific types
export type Timestamp = firebase.firestore.Timestamp;
export type FirestoreReference = firebase.firestore.DocumentReference;
export type FirestoreQuery = firebase.firestore.Query;
export type FirestoreCollection = firebase.firestore.CollectionReference;
export type FirestoreDocument = firebase.firestore.DocumentSnapshot;
export type FirestoreData = firebase.firestore.DocumentData;

// Utility type to convert a Firebase document to our app type
export type WithId<T> = T & { id: string };
