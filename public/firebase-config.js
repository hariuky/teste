import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc,         
  doc,
  getDoc,
  updateDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD583M1OZeoNOyqxuwf9zSEFzElEwub3y0",
  authDomain: "loja-de-celulares.firebaseapp.com",
  projectId: "loja-de-celulares",
  storageBucket: "loja-de-celulares.appspot.com",
  messagingSenderId: "610593951973",
  appId: "1:610593951973:web:7d00e519ad5611440c",
  measurementId: "G-7SJKRQEYWR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { 
  auth, 
  db, 
  collection, 
  getDocs, 
  addDoc,      
  doc,
  getDoc,
  updateDoc,
  deleteDoc
};
