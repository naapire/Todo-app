// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSKgXINrXbxl0JsBGHeqCEL0nfgECnJYE",
  authDomain: "to-do-app-518d5.firebaseapp.com",
  projectId: "to-do-app-518d5",
  storageBucket: "to-do-app-518d5.firebasestorage.app",
  messagingSenderId: "938481138001",
  appId: "1:938481138001:web:b2fe8e7044158fa2adbb70"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);


export default app;