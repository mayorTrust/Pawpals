import { getListings, getListingById, getUserById } from './data.js';
import { showLoadingOverlay, hideLoadingOverlay } from './loading.js';
import { showNotification } from './notification.js';
import { getLoggedInUser } from './auth.js';
import { openPaymentModal, paymentModalHTML, setupPaymentModalListeners } from './payment.js';
import { db } from './firebase.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { sendTemplatedEmail, getAdminEmail } from './email.js';

const PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('/') || path.endsWith('index.html')) {
        renderFeaturedListings();
        setupSearch('search-form-home');
    } else if (path.endsWith('listings.html')) {
        renderListings();
        setupSearch('search-form');
    } else if (path.endsWith('listing-detail.html')) {
        renderListingDetail();
    }
});

function setupSearch(formId) {
    const searchForm = document.getElementById(formId);
    const searchInput = searchForm ? searchForm.querySelector('input[type="search"]') : null;
    
    if (searchForm && searchInput) {
        const urlParams = new URLSearchParams(window.location.search);
        searchInput.value = urlParams.get('search') || '';

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            const params = new URLSearchParams();
            if (query) {
                params.set('search', query);
            }
            params.set('page', '1');
            window.location.href = `/listings.html?${params.toString()}`;
        });
    }
}

function createListingCard(listing) {
    const cardLink = document.createElement('a');
    cardLink.href = `listing-detail.html?id=${listing.id}`;
    cardLink.className = "group";

    cardLink.innerHTML = `
      <div class="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 border rounded-lg">
        <div class="aspect-[3/2] relative">
            <img
              src="${listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls[0] : 'https://via.placeholder.com/400x300'}"
              alt="${listing.name || 'A cute dog'}"
              class="object-cover w-full h-full"
            />
        </div>
        <div class="p-4">
            <div class="flex justify-between items-start">
              <h3 class="font-headline text-lg font-bold">${listing.name}</h3>
              <div class="capitalize text-xs font-semibold py-1 px-2 rounded-full bg-secondary text-secondary-foreground">${listing.status}</div>
            </div>
            <p class="text-sm text-muted-foreground">${listing.breed}</p>
            <p class="mt-2 font-semibold text-base">$${listing.price.toLocaleString()}</p>
        </div>
      </div>
    `;
    return cardLink;
}

async function renderFeaturedListings() {
    const grid = document.getElementById('featured-listings');
    if (!grid) return;

    showLoadingOverlay();
    try {
        grid.innerHTML = '';
        const allListings = await getListings();
        const featured = allListings.slice(0, 4);
        featured.forEach(listing => {
            grid.appendChild(createListingCard(listing));
        });
    } catch (error) {
        showNotification("Error rendering featured listings: " + error.message, true);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading featured listings.</p>';
    } finally {
        hideLoadingOverlay();
    }
}

async function renderListings() {
    const grid = document.getElementById('listing-grid');
    const paginationControls = document.getElementById('pagination-controls');
    if (!grid || !paginationControls) return;

    showLoadingOverlay();
    try {
        grid.innerHTML = '';
        paginationControls.innerHTML = '';

        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search')?.toLowerCase() || '';
        const currentPage = parseInt(urlParams.get('page') || '1', 10);

        const allListings = await getListings();
        const filteredListings = allListings.filter(listing => 
            listing.name.toLowerCase().includes(searchQuery) || 
            listing.breed.toLowerCase().includes(searchQuery)
        );

        const totalPages = Math.ceil(filteredListings.length / PAGE_SIZE);
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const paginatedListings = filteredListings.slice(startIndex, startIndex + PAGE_SIZE);

        if (paginatedListings.length > 0) {
            paginatedListings.forEach(listing => {
                grid.appendChild(createListingCard(listing));
            });
        } else {
            grid.innerHTML = '<p class="col-span-full text-center">No pups found matching your search.</p>';
        }

        if (totalPages > 1) {
            const prevDisabled = currentPage <= 1;
            const nextDisabled = currentPage >= totalPages;

            const createPageLink = (page, text, disabled) => {
                const params = new URLSearchParams(urlParams);
                params.set('page', page);
                const link = document.createElement('a');
                link.href = `listings.html?${params.toString()}`;
                link.textContent = text;
                link.className = `inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`;
                return link;
            };

            const prevButton = createPageLink(currentPage - 1, 'Previous', prevDisabled);
            const pageIndicator = document.createElement('span');
            pageIndicator.className = "text-sm font-medium";
            pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
            const nextButton = createPageLink(currentPage + 1, 'Next', nextDisabled);

            paginationControls.append(prevButton, pageIndicator, nextButton);
        }
    } catch (error) {
        showNotification("Error rendering listings: " + error.message, true);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Error loading listings.</p>';
    } finally {
        hideLoadingOverlay();
    }
}

async function renderListingDetail() {
    const detailContainer = document.getElementById('listing-detail');
    if (!detailContainer) return;

    showLoadingOverlay();
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const listingId = urlParams.get('id');

        const listing = await getListingById(listingId);

        if (listing) {
            updateSEOTags(listing);
            addStructuredData(listing);
            const imageUrls = listing.imageUrls && listing.imageUrls.length > 0 ? listing.imageUrls : ['https://via.placeholder.com/600x400'];
            let currentImageIndex = 0;

            detailContainer.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="relative">
                        <img id="main-listing-image" src="${imageUrls[currentImageIndex]}" alt="${listing.name}" class="w-full rounded-lg shadow-lg object-cover aspect-square">
                        ${imageUrls.length > 1 ? `
                        <button id="prev-image" class="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button id="next-image" class="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md focus:outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                        ` : ''}
                    </div>
                    <div>
                        <h1 class="text-4xl font-bold">${listing.name}</h1>
                        <p class="text-xl text-muted-foreground mt-2">${listing.breed}</p>
                        <p class="text-3xl font-bold text-primary mt-4">$${listing.price.toLocaleString()}</p>
                        <div class="mt-6">
                            <h2 class="text-2xl font-semibold">Details</h2>
                            <ul class="mt-2 space-y-2 text-muted-foreground">
                                <li><strong>Age:</strong> ${listing.age} months</li>
                                <li><strong>Vaccinated:</strong> ${listing.healthInfo.vaccinated ? 'Yes' : 'No'}</li>
                                <li><strong>Dewormed:</strong> ${listing.healthInfo.dewormed ? 'Yes' : 'No'}</li>
                            </ul>
                        </div>
                        <div class="mt-6">
                            <h2 class="text-2xl font-semibold">Description</h2>
                            <p class="mt-2 text-lg text-muted-foreground">${listing.description}</p>
                        </div>
                        <div class="mt-8">
                            <button id="purchase-button" class="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2">
                                Purchase ${listing.name}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Inject payment modal HTML and setup listeners
            const paymentModalContainer = document.getElementById('payment-modal-container');
            if (paymentModalContainer) {
                paymentModalContainer.innerHTML = paymentModalHTML;
                setupPaymentModalListeners();
            }

            // Order Confirmation Modal Logic
            const orderConfirmModal = document.getElementById('order-confirm-modal');
            const closeOrderModalBtn = document.getElementById('close-order-modal');
            const orderSummaryDiv = document.getElementById('order-summary');
            const purchaseButton = document.getElementById('purchase-button');
            const addPaymentBtn = document.getElementById('add-payment-btn');
            const makePaymentBtn = document.getElementById('make-payment-btn');

            let selectedPaymentMethod = null;

            if (purchaseButton) {
                purchaseButton.addEventListener('click', () => {
                    const user = getLoggedInUser();
                    if (!user) {
                        showNotification("Please log in to purchase a pet.", true);
                        return;
                    }

                    // Send email to admin
                    getAdminEmail().then(adminEmail => {
                        if (adminEmail) {
                            sendTemplatedEmail(
                                adminEmail,
                                'User Purchase Intent',
                                '/email_templates/admin_purchase_intent.html',
                                {
                                    userName: user.displayName || user.email,
                                    userEmail: user.email,
                                    listingName: listing.name,
                                    listingPrice: listing.price.toLocaleString(),
                                }
                            );
                        }
                    });

                    // Check for existing default payment method and set it
                    let paymentMethodDisplay = 'Not selected';
                    if (user.defaultPaymentMode) {
                        selectedPaymentMethod = user.defaultPaymentMode;
                        paymentMethodDisplay = `${selectedPaymentMethod} <span class="text-green-600">(Saved)</span>`;
                    } else {
                        selectedPaymentMethod = null;
                    }

                    // Populate order summary
                    orderSummaryDiv.innerHTML = `
                        <p><strong>Pet:</strong> ${listing.name}</p>
                        <p><strong>Breed:</strong> ${listing.breed}</p>
                        <p><strong>Price:</strong> ${listing.price.toLocaleString()}</p>
                        <p><strong>Your Email:</strong> ${user.email}</p>
                        <p id="selected-payment-display"><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
                    `;
                    orderConfirmModal.classList.remove('hidden');
                });
            }

            if (closeOrderModalBtn) {
                closeOrderModalBtn.addEventListener('click', () => {
                    orderConfirmModal.classList.add('hidden');
                });
            }

            if (orderConfirmModal) {
                orderConfirmModal.addEventListener('click', (e) => {
                    if (e.target === orderConfirmModal) {
                        orderConfirmModal.classList.add('hidden');
                    }
                });
            }

            if (addPaymentBtn) {
                addPaymentBtn.addEventListener('click', async () => {
                    const initialUser = getLoggedInUser();
                    if (!initialUser) {
                        showNotification("Please log in first.", true);
                        return;
                    }

                    await openPaymentModal();
                    
                    // After payment modal closes, refetch the user data to get updates.
                    const updatedUser = await getUserById(initialUser.uid);

                    if (updatedUser && updatedUser.defaultPaymentMode) {
                        selectedPaymentMethod = updatedUser.defaultPaymentMode;
                        document.getElementById('selected-payment-display').innerHTML = `<strong>Payment Method:</strong> ${selectedPaymentMethod} <span class="text-green-600">(Saved)</span>`;
                        showNotification(`Payment method set to ${selectedPaymentMethod}.`, false);
                    } else {
                        document.getElementById('selected-payment-display').innerHTML = `<strong>Payment Method:</strong> Not selected`;
                        selectedPaymentMethod = null;
                    }
                });
            }

            if (makePaymentBtn) {
                makePaymentBtn.addEventListener('click', async () => {
                    const user = getLoggedInUser();
                    if (!user) {
                        showNotification("Please log in to make a payment.", true);
                        return;
                    }
                    if (!selectedPaymentMethod) {
                        showNotification("Please select a payment method first.", true);
                        return;
                    }

                    showLoadingOverlay();
                    orderConfirmModal.classList.add('hidden'); // Hide modal immediately

                    try {
                        const orderData = {
                            listingId: listing.id,
                            listingName: listing.name,
                            listingPrice: listing.price,
                            userId: user.uid,
                            userEmail: user.email,
                            paymentMethod: selectedPaymentMethod,
                            status: 'pending', // Initial status
                            orderDate: new Date().toISOString()
                        };

                        const docRef = await addDoc(collection(db, "orders"), orderData);
                        
                        // Redirect immediately after order creation
                        window.location.href = `/payment.html?orderId=${docRef.id}`;

                        // Send email in the background after redirect has been initiated
                        sendTemplatedEmail(
                            user.email,
                            'Your PawPals Order is Being Processed',
                            '/email_templates/order_processing.html',
                            {
                                userName: user.name || user.email,
                                orderId: docRef.id,
                                listingName: listing.name,
                                listingPrice: listing.price.toLocaleString(),
                                paymentMethod: selectedPaymentMethod,
                                orderStatus: 'pending'
                            }
                        ).catch(err => console.error("Error sending processing email:", err));

                    } catch (error) {
                        showNotification("Error placing order: " + error.message, true);
                        hideLoadingOverlay(); // Only hide overlay if there's an error
                    }
                });
            }

            if (imageUrls.length > 1) {
                const mainImage = document.getElementById('main-listing-image');
                const prevButton = document.getElementById('prev-image');
                const nextButton = document.getElementById('next-image');

                const updateImage = () => {
                    mainImage.src = imageUrls[currentImageIndex];
                };

                prevButton.addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
                    updateImage();
                });

                nextButton.addEventListener('click', () => {
                    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                    updateImage();
                });

                // Basic swipe detection
                let touchStartX = 0;
                let touchEndX = 0;
                const minSwipeDistance = 50; // pixels

                mainImage.addEventListener('touchstart', (e) => {
                    touchStartX = e.touches[0].clientX;
                });

                mainImage.addEventListener('touchmove', (e) => {
                    touchEndX = e.touches[0].clientX;
                });

                mainImage.addEventListener('touchend', () => {
                    if (touchEndX < touchStartX - minSwipeDistance) {
                        // Swiped left
                        currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
                        updateImage();
                    }
                    if (touchEndX > touchStartX + minSwipeDistance) {
                        // Swiped right
                        currentImageIndex = (currentImageIndex - 1 + imageUrls.length) % imageUrls.length;
                        updateImage();
                    }
                    touchStartX = 0;
                    touchEndX = 0;
                });
            }

        } else {
            detailContainer.innerHTML = '<p>Listing not found.</p>';
        }
    } catch (error) {
        showNotification("Error rendering listing detail: " + error.message, true);
        detailContainer.innerHTML = '<p class="text-red-500">Error loading listing details.</p>';
    } finally {
        hideLoadingOverlay();
    }
}

function updateSEOTags(listing) {
    document.title = `PawPals - Adopt ${listing.name}, the ${listing.breed}`;
    document.querySelector('meta[name="description"]').setAttribute('content', `Meet ${listing.name}, a charming ${listing.breed} looking for a loving home. Learn more about their personality, health, and how to adopt them on PawPals.`);
    document.querySelector('meta[name="keywords"]').setAttribute('content', `${listing.breed}, ${listing.name}, dog adoption, buy puppy, adopt ${listing.breed}`);
    
    const pageUrl = window.location.href;
    const imageUrl = listing.imageUrls && listing.imageUrls.length > 0 ? new URL(listing.imageUrls[0], window.location.origin).href : new URL('/pawpals.png', window.location.origin).href;

    document.querySelector('meta[property="og:title"]').setAttribute('content', document.title);
    document.querySelector('meta[property="og:description"]').setAttribute('content', document.querySelector('meta[name="description"]').getAttribute('content'));
    document.querySelector('meta[property="og:url"]').setAttribute('content', pageUrl);
    document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);

    document.querySelector('meta[property="twitter:title"]').setAttribute('content', document.title);
    document.querySelector('meta[property="twitter:description"]').setAttribute('content', document.querySelector('meta[name="description"]').getAttribute('content'));
    document.querySelector('meta[property="twitter:url"]').setAttribute('content', pageUrl);
    document.querySelector('meta[property="twitter:image"]').setAttribute('content', imageUrl);
}

function addStructuredData(listing) {
    const existingSchema = document.querySelector('script[type="application/ld+json"]');
    if (existingSchema) {
        existingSchema.remove();
    }

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": listing.name,
        "image": listing.imageUrls,
        "description": listing.description,
        "sku": listing.id,
        "brand": {
            "@type": "Brand",
            "name": "PawPals"
        },
        "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "USD",
            "price": listing.price,
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "PawPals"
            }
        }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
}