// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQl_VVhj0PFvQqbx4F4eodrj6TkGi_ey0",
  authDomain: "ezsignatureapp.firebaseapp.com",
  projectId: "ezsignatureapp",
  storageBucket: "ezsignatureapp.appspot.com",
  messagingSenderId: "653014407475",
  appId: "1:653014407475:android:06cf0c3d07ce131f954646"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };