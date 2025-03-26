import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA8MfjDAbDUPF4OAMaczLJkuI4QyPp7P-Y",
  authDomain: "alarm-3da75.firebaseapp.com",
  projectId: "alarm-3da75",
  storageBucket: "alarm-3da75.firebasestorage.app",
  messagingSenderId: "108963910943",
  appId: "1:108963910943:web:55c38292e5cc465a328c2a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
