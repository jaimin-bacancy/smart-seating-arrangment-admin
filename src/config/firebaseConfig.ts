import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID
// };
const firebaseConfig = {
  apiKey: "AIzaSyCL4hlrQsTgfPbrHPA8QV1oTxp_gAkgprY",
  authDomain: "smart-seating-app-7a1b6.firebaseapp.com",
  projectId: "smart-seating-app-7a1b6",
  storageBucket: "smart-seating-app-7a1b6.firebasestorage.app",
  messagingSenderId: "775435955084",
  appId: "1:775435955084:web:59bbadf55c02fd0224c4a9",
  measurementId: "G-40433J9K9W"
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const firestore = firebase.firestore();
const auth = firebase.auth();

export { firebase, firestore, auth };
