import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { updateAuthNav } from './layout.js'; // Import updateAuthNav
import { showNotification } from './notification.js';
import { sendTemplatedEmail, getAdminEmail } from './email.js'; // Import sendTemplatedEmail and getAdminEmail

let currentUser = null; // To store the current logged-in user's data
let authReadyPromiseResolver;
const authReady = new Promise(resolve => {
    authReadyPromiseResolver = resolve;
});

// Listen for auth state changes
onAuthStateChanged(auth, async (user) => {
    try {
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

            // Send admin notification email for user login, only once per session
            if (!localStorage.getItem('adminLoginEmailSent')) {
                const adminEmail = await getAdminEmail();
                if (adminEmail) {
                    sendTemplatedEmail(
                        adminEmail,
                        'User Login Notification',
                        '/email_templates/admin_user_login.html',
                        {
                            userName: currentUser.name || currentUser.email,
                            userEmail: currentUser.email,
                            loginTime: new Date().toLocaleString()
                        }
                    );
                    localStorage.setItem('adminLoginEmailSent', 'true'); // Set flag
                }
            }

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
            localStorage.removeItem('adminLoginEmailSent'); // Clear flag on logout
        }
    } catch (error) {
        console.error("Error during auth state change:", error);
        currentUser = null; // Ensure user is logged out on error
    } finally {
        // Resolve the authReady promise once everything is done
        authReadyPromiseResolver(currentUser);
        // Update UI elements that depend on auth state (e.g., header nav)
        updateAuthNav();
    }
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
        showNotification('Login failed: ' + error.message, true);
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
        showNotification('Signup successful!', false);

        // Send welcome email to user
        sendTemplatedEmail(
            email,
            'Welcome to PawPals!',
            '/email_templates/welcome.html',
            { userName: name }
        );
        
        // Redirection is now handled by onAuthStateChanged listener
        return currentUser;
    } catch (error) {
        console.error('Signup failed:', error.message);
        showNotification('Signup failed: ' + error.message, true);
        return null;
    }
}

async function logout() {
    try {
        await signOut(auth);
        console.log('User logged out.');
        localStorage.removeItem('adminLoginEmailSent'); // Clear flag on logout
        // currentUser will be set to null by onAuthStateChanged listener
        window.location.href = '/login.html'; // Redirect after logout
    } catch (error) {
        console.error('Logout failed:', error.message);
        showNotification('Logout failed: ' + error.message, true);
    }
}

async function sendPasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        showNotification('Password reset email sent! Please check your inbox.', false);
    } catch (error) {
        console.error('Password reset failed:', error.message);
        showNotification('Password reset failed: ' + error.message, true);
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

export { login, signup, logout, sendPasswordReset, getLoggedInUser, isLoggedIn, isAdmin, authReady };