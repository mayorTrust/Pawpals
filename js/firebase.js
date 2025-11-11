import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCVNhSKNUfZIPu9K_hTzeVSQJIBZKjQ3kc",
  authDomain: "studio-1993939962-a37b8.firebaseapp.com",
  projectId: "studio-1993939962-a37b8",
  storageBucket: "studio-1993939962-a37b8.appspot.com",
  messagingSenderId: "811873347931",
  appId: "1:811873347931:web:4e151322a0b4c05eba127e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
