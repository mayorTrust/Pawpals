import { db } from './firebase.js';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

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
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
}

// Function to update an existing listing
async function updateListing(id, newData) {
    try {
        const listingRef = doc(db, 'listings', id);
        await updateDoc(listingRef, newData);
        console.log("Document updated with ID: ", id);
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
}

// Function to delete a listing
async function deleteListing(id) {
    try {
        await deleteDoc(doc(db, 'listings', id));
        console.log("Document deleted with ID: ", id);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
}

export { getListings, getListingById, addListing, updateListing, deleteListing };
