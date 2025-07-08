import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDfxb_xP4kGCBhUdA1nClVjZFWOe3w5HcI",
  authDomain: "tearix-2e4e1.firebaseapp.com",
  databaseURL: "https://tearix-2e4e1-default-rtdb.firebaseio.com",
  projectId: "tearix-2e4e1",
  storageBucket: "tearix-2e4e1.firebasestorage.app",
  messagingSenderId: "847821367995",
  appId: "1:847821367995:web:0fe7f350a52902a8ef979e",
  measurementId: "G-SW3TLLGYYF"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;