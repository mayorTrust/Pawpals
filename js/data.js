import { db } from './firebase.js';
import { showNotification } from './notification.js';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Function to fetch all listings
async function getListings() {
    const listingsCol = collection(db, 'listings');
    const listingSnapshot = await getDocs(listingsCol);
    const listingsList = listingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return listingsList;
}

// Function to fetch a single listing by ID
async function getListingById(id) {
    const listingRef = doc(db, 'listings', id);
    const listingSnap = await getDoc(listingRef);
    if (listingSnap.exists()) {
        return { id: listingSnap.id, ...listingSnap.data() };
    } else {
        console.log("No such document!");
        return null;
    }
}

// Function to add a new listing
async function addListing(listingData) {
    try {
        const docRef = await addDoc(collection(db, "listings"), listingData);
        showNotification("Listing added successfully!", false);
        return docRef.id;
    } catch (e) {
        showNotification("Error adding listing: " + e.message, true);
        throw e;
    }
}

// Function to update an existing listing
async function updateListing(id, newData) {
    try {
        const listingRef = doc(db, 'listings', id);
        await updateDoc(listingRef, newData);
        showNotification("Listing updated successfully!", false);
    } catch (e) {
        showNotification("Error updating listing: " + e.message, true);
        throw e;
    }
}

// Function to delete a listing
async function deleteListing(id) {
    try {
        await deleteDoc(doc(db, 'listings', id));
        showNotification("Listing deleted successfully!", false);
    } catch (e) {
        showNotification("Error deleting listing: " + e.message, true);
        throw e;
    }
}

// Function to fetch all users
async function getAllUsers() {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    const usersList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return usersList;
}

// Function to fetch a single user by ID
async function getUserById(id) {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
    } else {
        console.log("No such user document!");
        return null;
    }
}

// Function to fetch global payment settings
async function getPaymentSettings() {
    const settingsRef = doc(db, 'appSettings', 'global');
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
        return settingsSnap.data();
    } else {
        console.log("No global payment settings found.");
        return null;
    }
}

// Function to save global payment settings
async function savePaymentSettings(settingsData) {
    try {
        const settingsRef = doc(db, 'appSettings', 'global');
        await setDoc(settingsRef, settingsData, { merge: true });
        showNotification("Payment settings saved successfully.", false);
    } catch (e) {
        showNotification("Error saving payment settings: " + e.message, true);
        throw e;
    }
}

export { getListings, getListingById, addListing, updateListing, deleteListing, getAllUsers, getUserById, getPaymentSettings, savePaymentSettings };
