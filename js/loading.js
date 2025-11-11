// js/loading.js
const loadingOverlay = document.createElement('div');
loadingOverlay.id = 'loading-overlay';
loadingOverlay.innerHTML = `
    <div class="spinner"></div>
`;
loadingOverlay.style.opacity = '0'; // Hide initially
loadingOverlay.style.visibility = 'hidden'; // Hide initially
document.body.appendChild(loadingOverlay);

export function showLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '1';
        loadingOverlay.style.visibility = 'visible';
    }
}

export function hideLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        loadingOverlay.style.visibility = 'hidden';
    }
}