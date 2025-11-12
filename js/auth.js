import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { updateAuthNav } from './layout.js'; // Import updateAuthNav

let currentUser = null; // To store the current logged-in user's data
let authReadyPromiseResolver;
const authReady = new Promise(resolve => {
    authReadyPromiseResolver = resolve;
});

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => { // Use onAuthStateChanged from v9
    if (user) {
        // User is signed in, fetch their data from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            currentUser = { uid: user.uid, ...userSnap.data() };
        } else {
            console.error("User data not found in Firestore for UID:", user.uid);
            currentUser = { uid: user.uid, email: user.email, role: 'user' }; // Fallback
        }

        // Resolve the authReady promise once currentUser is set
        authReadyPromiseResolver(user);

        // Redirect logged-in users from login/signup pages
        const path = window.location.pathname;
        if (path.endsWith('/login.html') || path.endsWith('/signup.html')) {
            if (currentUser.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/profile.html';
            }
        }
    } else {
        // User is signed out
        currentUser = null;
        authReadyPromiseResolver(null); // Resolve with null if user is signed out
    }
    // Update UI elements that depend on auth state (e.g., header nav)
    updateAuthNav(); // Call updateAuthNav directly
});

async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('Login successful for:', user.email);
        // Redirection is now handled by onAuthStateChanged listener
        return currentUser;
    } catch (error) {
        console.error('Login failed:', error.message);
        alert('Login failed: ' + error.message);
        return null;
    }
}

async function signup(name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: 'user' // Default role for new users
        });

        console.log('Signup successful for:', user.email);
        // Redirection is now handled by onAuthStateChanged listener
        return currentUser;
    } catch (error) {
        console.error('Signup failed:', error.message);
        alert('Signup failed: ' + error.message);
        return null;
    }
}

async function logout() {
    try {
        await signOut(auth);
        console.log('User logged out.');
        // currentUser will be set to null by onAuthStateChanged listener
        window.location.href = '/login.html'; // Redirect after logout
    } catch (error) {
        console.error('Logout failed:', error.message);
        alert('Logout failed: ' + error.message);
    }
}

function getLoggedInUser() {
    return currentUser;
}

function isLoggedIn() {
    return currentUser !== null;
}

function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

export { login, signup, logout, getLoggedInUser, isLoggedIn, isAdmin, authReady };