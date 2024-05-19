// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQl_VVhj0PFvQqbx4F4eodrj6TkGi_ey0",
  authDomain: "ezsignatureapp.firebaseapp.com",
  projectId: "ezsignatureapp",
  storageBucket: "ezsignatureapp.appspot.com",
  messagingSenderId: "653014407475",
  appId: "1:653014407475:android:06cf0c3d07ce131f954646"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { app, auth };
