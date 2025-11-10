const PAGE_SIZE = 10;

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.endsWith('/') || path.endsWith('index.html')) {
        renderFeaturedListings();
        setupSearch('search-form-home');
    } else if (path.endsWith('listings.html')) {
        renderListings();
        setupSearch('search-form'); // The listings page search form still has id 'search-form'
    } else if (path.endsWith('listing-detail.html')) {
        renderListingDetail();
    }
});

function setupSearch(formId) {
    const searchForm = document.getElementById(formId);
    const searchInput = searchForm ? searchForm.querySelector('input[type="search"]') : null;
    
    if (searchForm && searchInput) {
        // Set initial value from URL
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
              src="${listing.imageUrls[0]}"
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

function renderFeaturedListings() {
    const grid = document.getElementById('featured-listings');
    if (!grid) return;

    grid.innerHTML = '';
    const featured = mockListings.slice(0, 4);
    featured.forEach(listing => {
        grid.appendChild(createListingCard(listing));
    });
}

function renderListings() {
    const grid = document.getElementById('listing-grid');
    const paginationControls = document.getElementById('pagination-controls');
    if (!grid || !paginationControls) return;

    grid.innerHTML = '';
    paginationControls.innerHTML = '';

    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search')?.toLowerCase() || '';
    const currentPage = parseInt(urlParams.get('page') || '1', 10);

    const filteredListings = mockListings.filter(listing => 
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

    // Render Pagination
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
}

function renderListingDetail() {
    const detailContainer = document.getElementById('listing-detail');
    if (!detailContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get('id');

    const listing = mockListings.find(l => l.id === listingId);

    if (listing) {
        detailContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <img src="${listing.imageUrls[0]}" alt="${listing.name}" class="w-full rounded-lg shadow-lg">
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
                        <button class="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2">
                            Adopt ${listing.name}
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        detailContainer.innerHTML = '<p>Listing not found.</p>';
    }
}
