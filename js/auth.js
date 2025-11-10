// --- Authentication Simulation ---

// In a real app, you'd have a more robust user object and session management.
// For this simulation, we'll use localStorage.

function login(email, password) {
    // Find a user from our mock data
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (user) {
        console.log('Login successful for:', user.email);
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        // Redirect based on role
        if (user.role === 'admin') {
            window.location.href = '/admin/dashboard.html';
        } else {
            window.location.href = '/profile.html';
        }
        return user;
    } else {
        console.log('Login failed for:', email);
        localStorage.removeItem('loggedInUser');
        return null;
    }
}

function logout() {
    console.log('User logged out.');
    localStorage.removeItem('loggedInUser');
}

function getLoggedInUser() {
    try {
        return JSON.parse(localStorage.getItem('loggedInUser'));
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return getLoggedInUser() !== null;
}

function isAdmin() {
    const user = getLoggedInUser();
    return user && user.role === 'admin';
}

// --- Mock Users ---
// In a real app, this would come from a database.
const mockUsers = [
    { id: 'user-1', name: 'Admin User', email: 'admin@pawpals.com', password: 'password123', role: 'admin' },
    { id: 'user-3', name: 'Regular User', email: 'user@pawpals.com', password: 'password123', role: 'user' },
];
