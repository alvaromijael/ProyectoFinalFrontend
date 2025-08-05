// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAcuHDAdvFt-nIXGzLHWIndpr5YEqshh24",
  authDomain: "material-project-ui.firebaseapp.com",
  projectId: "material-project-ui",
  storageBucket: "material-project-ui.firebasestorage.app",
  messagingSenderId: "508295060740",
  appId: "1:508295060740:web:c29a66a7c75a3b4aa90451",
  measurementId: "G-8CF9EHCM1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);