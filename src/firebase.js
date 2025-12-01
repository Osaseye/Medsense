import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvGHS1G1LcrAA8OGhDv0JjoUuSPCXw8y0",
  authDomain: "medsense-ff07d.firebaseapp.com",
  projectId: "medsense-ff07d",
  storageBucket: "medsense-ff07d.firebasestorage.app",
  messagingSenderId: "430540157650",
  appId: "1:430540157650:web:27a26eb656e8f2b339730b",
  measurementId: "G-KSSMV6BXSG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code == 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab at a a time.
    console.log('Persistence failed: Multiple tabs open');
  } else if (err.code == 'unimplemented') {
    // The current browser does not support all of the features required to enable persistence
    console.log('Persistence failed: Browser not supported');
  }
});

export { app, analytics, auth, db };
