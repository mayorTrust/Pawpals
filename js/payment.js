import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getLoggedInUser } from './auth.js';
import { getPaymentSettings } from './data.js'; // Import getPaymentSettings
import { showLoadingOverlay, hideLoadingOverlay } from './loading.js'; // Import loading functions

export const paymentModalHTML = `
<div id="payment-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
            <h3 class="text-xl font-semibold">Payment Details</h3>
            <button id="close-payment-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <form id="payment-options-form" class="space-y-6">
            <!-- Default Payment Mode Selection -->
            <div>
                <h4 class="text-lg font-medium mb-3">Default Payment Mode</h4>
                <div class="flex space-x-4">
                    <label class="inline-flex items-center">
                        <input type="radio" name="defaultPaymentMode" value="card" class="form-radio text-primary" checked>
                        <span class="ml-2">Card</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="defaultPaymentMode" value="paypal" class="form-radio text-primary">
                        <span class="ml-2">PayPal</span>
                    </label>
                    <label class="inline-flex items-center">
                        <input type="radio" name="defaultPaymentMode" value="crypto" class="form-radio text-primary">
                        <span class="ml-2">Crypto</span>
                    </label>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Billing Address Form -->
                <div>
                    <h4 class="text-lg font-medium mb-3">Billing Address</h4>
                    <div class="space-y-4">
                        <div>
                            <label for="address-street" class="block text-sm font-medium text-gray-700">Street</label>
                            <input type="text" id="address-street" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        </div>
                        <div>
                            <label for="address-city" class="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="address-city" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        </div>
                        <div>
                            <label for="address-state" class="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="address-state" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        </div>
                        <div>
                            <label for="address-zip" class="block text-sm font-medium text-gray-700">Zip Code</label>
                            <input type="text" id="address-zip" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                        </div>
                    </div>
                </div>

                <!-- Payment Method Details -->
                <div>
                    <!-- Card Details Section -->
                    <div id="card-details-section" class="space-y-4">
                        <h4 class="text-lg font-medium mb-3">Card Details</h4>
                        <div>
                            <label for="card-type" class="block text-sm font-medium text-gray-700">Card Type</label>
                            <select id="card-type" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                                <option value="">Select Card Type</option>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="American Express">American Express</option>
                                <option value="Discover">Discover</option>
                            </select>
                        </div>
                        <div>
                            <label for="card-number" class="block text-sm font-medium text-gray-700">Card Number</label>
                            <input type="text" id="card-number" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="**** **** **** 1234" maxlength="19">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="card-expiry" class="block text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="text" id="card-expiry" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div>
                                <label for="card-cvv" class="block text-sm font-medium text-gray-700">CVV</label>
                                <input type="text" id="card-cvv" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <div id="saved-card-info" class="mt-4 p-3 border rounded-md bg-gray-50 hidden">
                            <h5 class="font-medium">Saved Card:</h5>
                            <p id="display-card-type" class="text-sm text-gray-700"></p>
                            <p id="display-card-number" class="text-sm text-gray-700"></p>
                        </div>
                    </div>

                    <!-- PayPal Details Section -->
                    <div id="paypal-details-section" class="space-y-4 hidden">
                        <h4 class="text-lg font-medium mb-3">PayPal Details</h4>
                        <p class="text-sm text-muted-foreground">Send payment to: <strong id="paypal-email-display"></strong></p>
                        <p class="text-sm text-muted-foreground">Tag/Note: <strong id="paypal-tag-display"></strong></p>
                        <div>
                            <label for="paypal-transaction-id" class="block text-sm font-medium text-gray-700">Transaction ID</label>
                            <input type="text" id="paypal-transaction-id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="PayPal Transaction ID">
                        </div>
                        <div>
                            <label for="paypal-proof-upload" class="block text-sm font-medium text-gray-700">Upload Payment Proof</label>
                            <input type="file" id="paypal-proof-upload" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90">
                            <div id="paypal-proof-preview" class="mt-2 grid grid-cols-2 gap-2"></div>
                            <div id="saved-paypal-proof" class="mt-2 p-3 border rounded-md bg-gray-50 hidden">
                                <h5 class="font-medium">Saved Proof:</h5>
                                <img id="display-paypal-proof" src="" alt="PayPal Proof" class="w-24 h-24 object-cover rounded-md">
                            </div>
                        </div>
                    </div>

                    <!-- Crypto Details Section -->
                    <div id="crypto-details-section" class="space-y-4 hidden">
                        <h4 class="text-lg font-medium mb-3">Crypto Details</h4>
                        <p class="text-sm text-muted-foreground">Send payment to:</p>
                        <p class="text-sm text-muted-foreground">Address: <strong id="crypto-address-display"></strong></p>
                        <p class="text-sm text-muted-foreground">Tag/Memo: <strong id="crypto-tag-display"></strong></p>
                        <div>
                            <label for="crypto-transaction-id" class="block text-sm font-medium text-gray-700">Transaction ID</label>
                            <input type="text" id="crypto-transaction-id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Crypto Transaction ID">
                        </div>
                        <div>
                            <label for="crypto-proof-upload" class="block text-sm font-medium text-gray-700">Upload Payment Proof</label>
                            <input type="file" id="crypto-proof-upload" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90">
                            <div id="crypto-proof-preview" class="mt-2 grid grid-cols-2 gap-2"></div>
                            <div id="saved-crypto-proof" class="mt-2 p-3 border rounded-md bg-gray-50 hidden">
                                <h5 class="font-medium">Saved Proof:</h5>
                                <img id="display-crypto-proof" src="" alt="Crypto Proof" class="w-24 h-24 object-cover rounded-md">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="submit" class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90">Save Payment Options</button>
        </form>
    </div>
</div>

<!-- PIN Entry Modal -->
<div id="pin-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
            <h3 class="text-xl font-semibold">Enter Card PIN</h3>
            <button id="close-pin-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="space-y-4">
            <div>
                <label for="card-pin" class="block text-sm font-medium text-gray-700">PIN</label>
                <input type="password" id="card-pin" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" maxlength="4" inputmode="numeric" pattern="[0-9]*" required>
            </div>
            <div class="flex justify-end space-x-2">
                <button id="cancel-pin-entry" type="button" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">Cancel</button>
                <button id="confirm-pin-entry" type="button" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2">Confirm</button>
            </div>
        </div>
    </div>
</div>
`;

let selectedPayPalProofFile = null;
let selectedCryptoProofFile = null;
let resolvePinPromise = null; // To resolve the PIN entry promise

export function setupPaymentModalListeners() {
    const addPaymentMethodBtn = document.getElementById('add-payment-method-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    const paymentOptionsForm = document.getElementById('payment-options-form');

    const defaultPaymentModeRadios = document.querySelectorAll('input[name="defaultPaymentMode"]');
    const cardDetailsSection = document.getElementById('card-details-section');
    const paypalDetailsSection = document.getElementById('paypal-details-section');
    const cryptoDetailsSection = document.getElementById('crypto-details-section');

    const paypalProofUpload = document.getElementById('paypal-proof-upload');
    const paypalProofPreview = document.getElementById('paypal-proof-preview');
    const cryptoProofUpload = document.getElementById('crypto-proof-upload');
    const cryptoProofPreview = document.getElementById('crypto-proof-preview');

    // PIN Modal elements
    const pinModal = document.getElementById('pin-modal');
    const closePinModalBtn = document.getElementById('close-pin-modal');
    const cardPinInput = document.getElementById('card-pin');
    const cancelPinEntryBtn = document.getElementById('cancel-pin-entry');
    const confirmPinEntryBtn = document.getElementById('confirm-pin-entry');


    if (addPaymentMethodBtn) {
        addPaymentMethodBtn.addEventListener('click', openPaymentModal);
    } else {
        console.error('payment.js: addPaymentMethodBtn not found!');
    }
    if (closePaymentModalBtn) {
        closePaymentModalBtn.addEventListener('click', closePaymentModal);
    }
    if (paymentModal) {
        paymentModal.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                closePaymentModal();
            }
        });
    }

    // Handle payment mode selection
    defaultPaymentModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const mode = event.target.value;
            cardDetailsSection.classList.add('hidden');
            paypalDetailsSection.classList.add('hidden');
            cryptoDetailsSection.classList.add('hidden');

            if (mode === 'card') {
                cardDetailsSection.classList.remove('hidden');
            } else if (mode === 'paypal') {
                paypalDetailsSection.classList.remove('hidden');
            } else if (mode === 'crypto') {
                cryptoDetailsSection.classList.remove('hidden');
            }
        });
    });

    // Handle PayPal proof upload preview
    if (paypalProofUpload) {
        paypalProofUpload.addEventListener('change', (event) => {
            paypalProofPreview.innerHTML = '';
            selectedPayPalProofFile = event.target.files[0];
            if (selectedPayPalProofFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'w-24 h-24 object-cover rounded-md';
                    paypalProofPreview.appendChild(img);
                };
                reader.readAsDataURL(selectedPayPalProofFile);
            }
        });
    }

    // Handle Crypto proof upload preview
    if (cryptoProofUpload) {
        cryptoProofUpload.addEventListener('change', (event) => {
            cryptoProofPreview.innerHTML = '';
            selectedCryptoProofFile = event.target.files[0];
            if (selectedCryptoProofFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'w-24 h-24 object-cover rounded-md';
                    cryptoProofPreview.appendChild(img);
                };
                reader.readAsDataURL(selectedCryptoProofFile);
            }
        });
    }

    // PIN Modal Listeners
    if (pinModal) {
        closePinModalBtn.addEventListener('click', () => {
            pinModal.classList.add('hidden');
            if (resolvePinPromise) resolvePinPromise(null); // Resolve with null on close/cancel
        });
        cancelPinEntryBtn.addEventListener('click', () => {
            pinModal.classList.add('hidden');
            if (resolvePinPromise) resolvePinPromise(null); // Resolve with null on close/cancel
        });
        confirmPinEntryBtn.addEventListener('click', () => {
            const pin = cardPinInput.value;
            if (pin.length === 4 && /^\d+$/.test(pin)) {
                pinModal.classList.add('hidden');
                if (resolvePinPromise) resolvePinPromise(pin);
            } else {
                alert('Please enter a valid 4-digit PIN.');
            }
        });
    }

    if (paymentOptionsForm) {
        paymentOptionsForm.addEventListener('submit', handleSavePaymentOptions);
    }
}

export async function openPaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.remove('hidden');
        await loadPaymentDetails();
    }
}

export function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.add('hidden');
    }
}

async function uploadProofImage(file) {
    if (!file) return null;

    const formData = new FormData();
    formData.append('images[]', file); // Use 'images[]' as expected by upload.php

    try {
        const response = await fetch('/upload.php', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.errors ? errorData.errors.join(', ') : 'Proof image upload failed');
        }

        const result = await response.json();
        return result.urls[0]; // Assuming single file upload for proof
    } catch (error) {
        console.error("Error uploading proof image: ", error);
        alert('Error uploading proof image: ' + error.message);
        throw error; // Re-throw to stop further processing
    }
}

// Function to show PIN entry modal and return a Promise that resolves with the PIN
function promptForPin() {
    const pinModal = document.getElementById('pin-modal');
    const cardPinInput = document.getElementById('card-pin');
    cardPinInput.value = ''; // Clear previous PIN
    pinModal.classList.remove('hidden');

    return new Promise(resolve => {
        resolvePinPromise = resolve;
    });
}


async function loadPaymentDetails() {
    const user = getLoggedInUser();
    if (!user) {
        console.error("No user logged in to load payment details.");
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const globalSettings = await getPaymentSettings(); // Fetch global settings

    if (userSnap.exists()) {
        const userData = userSnap.data();

        // Load Default Payment Mode
        const defaultPaymentMode = userData.defaultPaymentMode || 'card';
        document.querySelector(`input[name="defaultPaymentMode"][value="${defaultPaymentMode}"]`).checked = true;
        // Trigger change event to show correct section
        document.querySelector(`input[name="defaultPaymentMode"][value="${defaultPaymentMode}"]`).dispatchEvent(new Event('change'));

        // Load Billing Address
        if (userData.billingAddress) {
            document.getElementById('address-street').value = userData.billingAddress.street || '';
            document.getElementById('address-city').value = userData.billingAddress.city || '';
            document.getElementById('address-state').value = userData.billingAddress.state || '';
            document.getElementById('address-zip').value = userData.billingAddress.zip || '';
        } else {
            document.getElementById('address-street').value = '';
            document.getElementById('address-city').value = '';
            document.getElementById('address-state').value = '';
            document.getElementById('address-zip').value = '';
        }

        // Load Card Details
        const savedCardInfoDiv = document.getElementById('saved-card-info');
        const displayCardType = document.getElementById('display-card-type');
        const displayCardNumber = document.getElementById('display-card-number');
        const cardTypeSelect = document.getElementById('card-type');

        if (userData.cardDetails) {
            cardTypeSelect.value = userData.cardDetails.type || '';
            document.getElementById('card-number').value = userData.cardDetails.number || '';
            document.getElementById('card-expiry').value = userData.cardDetails.expiry || '';
            document.getElementById('card-cvv').value = userData.cardDetails.cvv || ''; // Load CVV
            // PIN is not loaded into input for security reasons, even in dev

            displayCardType.textContent = `Type: ${userData.cardDetails.type || 'N/A'}`;
            displayCardNumber.textContent = `Number: ${userData.cardDetails.number ? `**** **** **** ${userData.cardDetails.number.slice(-4)}` : 'N/A'}`;
            savedCardInfoDiv.classList.remove('hidden');
        } else {
            cardTypeSelect.value = '';
            document.getElementById('card-number').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-cvv').value = '';
            savedCardInfoDiv.classList.add('hidden');
            displayCardType.textContent = '';
            displayCardNumber.textContent = '';
        }

        // Load PayPal Details
        const savedPayPalProofDiv = document.getElementById('saved-paypal-proof');
        const displayPayPalProof = document.getElementById('display-paypal-proof');
        if (userData.paypalDetails) {
            document.getElementById('paypal-transaction-id').value = userData.paypalDetails.transactionId || '';
            if (userData.paypalDetails.proofUrl) {
                displayPayPalProof.src = userData.paypalDetails.proofUrl;
                savedPayPalProofDiv.classList.remove('hidden');
            } else {
                savedPayPalProofDiv.classList.add('hidden');
            }
        } else {
            document.getElementById('paypal-transaction-id').value = '';
            savedPayPalProofDiv.classList.add('hidden');
        }
        // Set dynamic PayPal details
        document.getElementById('paypal-email-display').textContent = globalSettings?.paypalEmail || 'N/A';
        document.getElementById('paypal-tag-display').textContent = globalSettings?.paypalTag || 'N/A';


        // Load Crypto Details
        const savedCryptoProofDiv = document.getElementById('saved-crypto-proof');
        const displayCryptoProof = document.getElementById('display-crypto-proof');
        if (userData.cryptoDetails) {
            document.getElementById('crypto-transaction-id').value = userData.cryptoDetails.transactionId || '';
            if (userData.cryptoDetails.proofUrl) {
                displayCryptoProof.src = userData.cryptoDetails.proofUrl;
                savedCryptoProofDiv.classList.remove('hidden');
            } else {
                savedCryptoProofDiv.classList.add('hidden');
            }
        } else {
            document.getElementById('crypto-transaction-id').value = '';
            savedCryptoProofDiv.classList.add('hidden');
        }
        // Set dynamic Crypto details
        document.getElementById('crypto-address-display').textContent = globalSettings?.cryptoAddress || 'N/A';
        document.getElementById('crypto-tag-display').textContent = globalSettings?.cryptoTag || 'N/A';
    }
}

async function handleSavePaymentOptions(event) {
    event.preventDefault();
    const user = getLoggedInUser();
    if (!user) {
        alert("Please log in to save payment options.");
        return;
    }

    const userRef = doc(db, "users", user.uid);
    let updateData = {};

    // Billing Address
    const billingAddress = {
        street: document.getElementById('address-street').value,
        city: document.getElementById('address-city').value,
        state: document.getElementById('address-state').value,
        zip: document.getElementById('address-zip').value,
    };
    updateData.billingAddress = billingAddress;

    // Default Payment Mode
    const defaultPaymentMode = document.querySelector('input[name="defaultPaymentMode"]:checked').value;
    updateData.defaultPaymentMode = defaultPaymentMode;

    // Card Details
    if (defaultPaymentMode === 'card') {
        const cardType = document.getElementById('card-type').value;
        const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;

        if (!cardType) { alert("Please select a card type."); return; }
        if (!/^\d{13,19}$/.test(cardNumber)) { alert("Please enter a valid card number."); return; }
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) { alert("Please enter a valid expiry date (MM/YY)."); return; }
        if (!/^\d{3,4}$/.test(cardCvv)) { alert("Please enter a valid CVV."); return; }

        // Prompt for PIN
        const pin = await promptForPin(); // No loading overlay here

        if (pin === null) { // User cancelled PIN entry
            alert("Card details not saved. PIN entry cancelled.");
            return;
        }

        updateData.cardDetails = {
            type: cardType,
            number: cardNumber, // Storing full card number
            expiry: cardExpiry, // Storing expiry date
            cvv: cardCvv,       // Storing CVV
            pin: pin,           // Storing PIN
            lastUpdated: new Date().toISOString()
        };
    } else {
        updateData.cardDetails = null; // Clear card details if not default
    }

    // PayPal Details
    if (defaultPaymentMode === 'paypal') {
        let paypalProofUrl = null;
        try {
            showLoadingOverlay(); // Show loading overlay for PayPal proof upload
            paypalProofUrl = await uploadProofImage(selectedPayPalProofFile);
        } catch (error) { 
            hideLoadingOverlay(); // Hide on error
            return; 
        } finally {
            hideLoadingOverlay(); // Ensure it's hidden after upload attempt
        }

        updateData.paypalDetails = {
            transactionId: document.getElementById('paypal-transaction-id').value,
            proofUrl: paypalProofUrl || (user.paypalDetails ? user.paypalDetails.proofUrl : null), // Retain old if no new upload
            lastUpdated: new Date().toISOString()
        };
    } else {
        updateData.paypalDetails = null; // Clear PayPal details if not default
    }

    // Crypto Details
    if (defaultPaymentMode === 'crypto') {
        let cryptoProofUrl = null;
        try {
            showLoadingOverlay(); // Show loading overlay for Crypto proof upload
            cryptoProofUrl = await uploadProofImage(selectedCryptoProofFile);
        } catch (error) { 
            hideLoadingOverlay(); // Hide on error
            return; 
        } finally {
            hideLoadingOverlay(); // Ensure it's hidden after upload attempt
        }

        updateData.cryptoDetails = {
            transactionId: document.getElementById('crypto-transaction-id').value,
            proofUrl: cryptoProofUrl || (user.cryptoDetails ? user.cryptoDetails.proofUrl : null), // Retain old if no new upload
            lastUpdated: new Date().toISOString()
        };
    } else {
        updateData.cryptoDetails = null; // Clear Crypto details if not default
    }

    try {
        showLoadingOverlay(); // Show loading overlay for the Firestore save
        await setDoc(userRef, updateData, { merge: true });
        alert("Payment options saved successfully!");
        closePaymentModal();
    } catch (error) {
        console.error("Error saving payment options:", error);
        alert("Failed to save payment options.");
    } finally {
        hideLoadingOverlay(); // Ensure loading overlay is hidden
    }
}