import { initializeApp } from "firebase/app";

import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

console.log("Imported GoogleAuthProvider:", GoogleAuthProvider); // Debug: Check if GoogleAuthProvider is imported

const firebaseConfig = {
  apiKey: "AIzaSyA-gdC6UHzE_RpadQTBSMzuZHYLxYcPRDw",
  authDomain: "synapshare-9ec62.firebaseapp.com",
  projectId: "synapshare-9ec62",
  storageBucket: "synapshare-9ec62.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "1:54834987056:web:37634bec61ea0201d92df5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
console.log("Exported googleProvider:", googleProvider); // Debug: Check the exported instance
