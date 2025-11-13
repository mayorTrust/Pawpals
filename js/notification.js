// js/notification.js

// Function to inject the notification container into the DOM
export function initNotificationContainer() {
    if (document.getElementById('notification-container')) {
        return; // Container already exists
    }

    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-[9999] space-y-3';
    document.body.appendChild(container);
}

/**
 * Displays a custom notification modal.
 * @param {string} message The message to display.
 * @param {'success' | 'error'} type The type of notification ('success' or 'error').
 * @param {number} [duration=5000] How long the notification should be visible in milliseconds.
 */
export function showNotification(message, type, duration = 5000) {
    initNotificationContainer(); // Ensure container exists
    const container = document.getElementById('notification-container');

    const notification = document.createElement('div');
    notification.className = `relative flex items-center justify-between p-4 rounded-lg shadow-lg text-white transform translate-x-full transition-transform ease-out duration-300`;

    let bgColor = '';
    let iconSvg = '';

    if (type === 'success') {
        bgColor = 'bg-green-500';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6 mr-2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    notification.innerHTML = `
        <div class="flex items-center">
            ${iconSvg}
            <span>${message}</span>
        </div>
        <div class="absolute bottom-0 left-0 h-1 ${bgColor} opacity-75" style="width: 100%;" id="notification-progress"></div>
    `;
    notification.classList.add(bgColor);

    container.appendChild(notification);

    // Trigger slide-in animation
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 10); // Small delay to ensure CSS transition applies

    // Animate progress bar
    const progressBar = notification.querySelector('#notification-progress');
    progressBar.style.transition = `width ${duration / 1000}s linear`;
    progressBar.style.width = '0%';

    // Auto-hide after duration
    setTimeout(() => {
        notification.classList.add('translate-x-full'); // Slide out
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true });
    }, duration);
}

export function showSuccessNotification(message, duration) {
    showNotification(message, 'success', duration);
}

export function showErrorNotification(message, errorDetails = '', duration) {
    let fullMessage = message;
    if (errorDetails) {
        fullMessage += `: ${errorDetails}`;
    }
    showNotification(fullMessage, 'error', duration);
}