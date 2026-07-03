// js/firebase-config.js
// ============================================
// 🔑 REMPLACEZ PAR VOS PROPRES CLÉS FIREBASE
// ============================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,        // ✅ AJOUTÉ
  updateProfile,
  sendEmailVerification
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  setDoc,
  serverTimestamp,
  writeBatch,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  uploadString,
  listAll
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// ============================================
// 🔑 METTEZ VOS CLÉS ICI
// ============================================
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_ehKUxOsJ530Ll_64RyDSrAwgn2PMooY",
  authDomain: "pimarket-1cb97.firebaseapp.com",
  projectId: "pimarket-1cb97",
  storageBucket: "pimarket-1cb97.firebasestorage.app",
  messagingSenderId: "330618916054",
  appId: "1:330618916054:web:1adb178215ef8d8d170d77",
  measurementId: "G-WJV0H7WM3S"
};
// ============================================

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================
// ✅ EXPORTATION DE TOUTES LES FONCTIONS
// ============================================
export { 
  app, 
  auth, 
  db, 
  storage,
  
  // Auth
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,      // ✅ MAINTENANT EXPORTÉ
  updateProfile,
  sendEmailVerification,
  
  // Firestore
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp, 
  setDoc,
  serverTimestamp,
  writeBatch,
  runTransaction,
  arrayUnion,
  arrayRemove,
  increment,
  
  // Storage
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject,
  uploadString,
  listAll
};