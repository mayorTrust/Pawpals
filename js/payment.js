import { db } from './firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getLoggedInUser } from './auth.js';

const paymentModalHTML = `
<div id="payment-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div class="flex justify-between items-center border-b pb-3 mb-4">
            <h3 class="text-xl font-semibold">Payment Details</h3>
            <button id="close-payment-modal" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Billing Address Form -->
            <div>
                <h4 class="text-lg font-medium mb-3">Billing Address</h4>
                <form id="billing-address-form" class="space-y-4">
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
                    <button type="submit" class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90">Save Address</button>
                </form>
            </div>

            <!-- Card Details Form -->
            <div>
                <h4 class="text-lg font-medium mb-3">Card Details</h4>
                <form id="card-details-form" class="space-y-4">
                    <div>
                        <label for="card-number" class="block text-sm font-medium text-gray-700">Card Number</label>
                        <input type="text" id="card-number" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="**** **** **** 1234" maxlength="19" required>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="card-expiry" class="block text-sm font-medium text-gray-700">Expiry Date</label>
                            <input type="text" id="card-expiry" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div>
                            <label for="card-cvv" class="block text-sm font-medium text-gray-700">CVV</label>
                            <input type="text" id="card-cvv" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    <button type="submit" class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90">Save Card</button>
                </form>
                <div id="saved-card-info" class="mt-4 p-3 border rounded-md bg-gray-50 hidden">
                    <h5 class="font-medium">Saved Card:</h5>
                    <p id="display-card-type" class="text-sm text-gray-700"></p>
                    <p id="display-card-number" class="text-sm text-gray-700"></p>
                </div>
            </div>
        </div>
    </div>
</div>
`;

document.addEventListener('DOMContentLoaded', () => {
    const paymentModalContainer = document.getElementById('payment-modal-container');
    if (paymentModalContainer) {
        paymentModalContainer.innerHTML = paymentModalHTML;
        setupPaymentModalListeners();
    }
});

function setupPaymentModalListeners() {
    const addPaymentMethodBtn = document.getElementById('add-payment-method-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModalBtn = document.getElementById('close-payment-modal');
    const billingAddressForm = document.getElementById('billing-address-form');
    const cardDetailsForm = document.getElementById('card-details-form');

    if (addPaymentMethodBtn) {
        addPaymentMethodBtn.addEventListener('click', openPaymentModal);
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

    if (billingAddressForm) {
        billingAddressForm.addEventListener('submit', handleSaveBillingAddress);
    }
    if (cardDetailsForm) {
        cardDetailsForm.addEventListener('submit', handleSaveCardDetails);
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

async function loadPaymentDetails() {
    const user = getLoggedInUser();
    if (!user) {
        console.error("No user logged in to load payment details.");
        return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const userData = userSnap.data();
        // Load Billing Address
        if (userData.billingAddress) {
            document.getElementById('address-street').value = userData.billingAddress.street || '';
            document.getElementById('address-city').value = userData.billingAddress.city || '';
            document.getElementById('address-state').value = userData.billingAddress.state || '';
            document.getElementById('address-zip').value = userData.billingAddress.zip || '';
        } else {
            // Clear form if no address saved
            document.getElementById('address-street').value = '';
            document.getElementById('address-city').value = '';
            document.getElementById('address-state').value = '';
            document.getElementById('address-zip').value = '';
        }

        // Load Card Details (masked)
        const savedCardInfoDiv = document.getElementById('saved-card-info');
        const displayCardType = document.getElementById('display-card-type');
        const displayCardNumber = document.getElementById('display-card-number');

        if (userData.cardDetails && userData.cardDetails.maskedNumber) {
            displayCardType.textContent = `Type: ${userData.cardDetails.type || 'N/A'}`;
            displayCardNumber.textContent = `Number: ${userData.cardDetails.maskedNumber}`;
            savedCardInfoDiv.classList.remove('hidden');
            // Clear card input fields for new entry
            document.getElementById('card-number').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-cvv').value = '';
        } else {
            savedCardInfoDiv.classList.add('hidden');
            displayCardType.textContent = '';
            displayCardNumber.textContent = '';
        }
    }
}

async function handleSaveBillingAddress(event) {
    event.preventDefault();
    const user = getLoggedInUser();
    if (!user) {
        alert("Please log in to save billing address.");
        return;
    }

    const billingAddress = {
        street: document.getElementById('address-street').value,
        city: document.getElementById('address-city').value,
        state: document.getElementById('address-state').value,
        zip: document.getElementById('address-zip').value,
    };

    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { billingAddress: billingAddress }, { merge: true });
        alert("Billing address saved successfully!");
        // Optionally update currentUser in auth.js if needed, or just reload
        // For now, we'll rely on the next auth state change or page reload to update currentUser
    } catch (error) {
        console.error("Error saving billing address:", error);
        alert("Failed to save billing address.");
    }
}

async function handleSaveCardDetails(event) {
    event.preventDefault();
    const user = getLoggedInUser();
    if (!user) {
        alert("Please log in to save card details.");
        return;
    }

    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, ''); // Remove spaces
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;

    // Basic validation (you'd want more robust validation in a real app)
    if (!/^\d{13,19}$/.test(cardNumber)) {
        alert("Please enter a valid card number.");
        return;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExpiry)) {
        alert("Please enter a valid expiry date (MM/YY).");
        return;
    }
    if (!/^\d{3,4}$/.test(cardCvv)) {
        alert("Please enter a valid CVV.");
        return;
    }

    // Determine card type (very basic, can be improved)
    let cardType = 'Unknown';
    if (/^4/.test(cardNumber)) cardType = 'Visa';
    else if (/^5[1-5]/.test(cardNumber)) cardType = 'Mastercard';
    else if (/^3[47]/.test(cardNumber)) cardType = 'American Express';

    // IMPORTANT: In a real application, you would NEVER store full card details in Firestore.
    // This is for demonstration purposes only. You would use a secure payment gateway (e.g., Stripe, PayPal)
    // to tokenize and store card information.
    const cardDetails = {
        type: cardType,
        maskedNumber: `**** **** **** ${cardNumber.slice(-4)}`, // Only store last 4 digits
        // expiry: cardExpiry, // Do not store expiry or CVV for security
        // cvv: cardCvv,
        lastUpdated: new Date().toISOString()
    };

    try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { cardDetails: cardDetails }, { merge: true });
        alert("Card details saved successfully!");
        loadPaymentDetails(); // Reload to show saved masked card info
    } catch (error) {
        console.error("Error saving card details:", error);
        alert("Failed to save card details.");
    }
}
