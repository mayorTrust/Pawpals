// js/notification.js

// Function to show a notification
export function showNotification(message, isError = false, duration = 5000) {
    // Create the notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-5 right-5 bg-white shadow-lg rounded-lg p-4 z-50 transform translate-x-full transition-transform duration-300 ease-out`;
    
    const progressBar = document.createElement('div');
    progressBar.className = `absolute bottom-0 left-0 h-1 ${isError ? 'bg-red-500' : 'bg-green-500'}`;
    progressBar.style.width = '100%';

    const messageElement = document.createElement('p');
    messageElement.className = `text-sm ${isError ? 'text-red-700' : 'text-green-700'}`;
    messageElement.textContent = message;

    notification.appendChild(messageElement);
    notification.appendChild(progressBar);
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Animate progress bar
    let startTime = Date.now();
    let animationFrameId;

    function updateProgressBar() {
        const elapsedTime = Date.now() - startTime;
        const progress = 1 - (elapsedTime / duration);
        progressBar.style.width = `${progress * 100}%`;

        if (progress > 0) {
            animationFrameId = requestAnimationFrame(updateProgressBar);
        }
    }

    animationFrameId = requestAnimationFrame(updateProgressBar);

    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        cancelAnimationFrame(animationFrameId);
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
}


// Function to show a confirmation dialog
export function showConfirmation(message, onConfirm, onCancel) {
    // Create the modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50';

    // Create the modal content
    const modal = document.createElement('div');
    modal.className = 'bg-white rounded-lg shadow-xl p-6 w-full max-w-sm';

    // Message
    const messageElement = document.createElement('p');
    messageElement.className = 'text-lg';
    messageElement.textContent = message;

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'mt-6 flex justify-end space-x-4';

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300';
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = () => {
        if (onCancel) onCancel();
        document.body.removeChild(overlay);
    };

    // Confirm button
    const confirmButton = document.createElement('button');
    confirmButton.className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700';
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = () => {
        if (onConfirm) onConfirm();
        document.body.removeChild(overlay);
    };

    buttonsContainer.appendChild(cancelButton);
    buttonsContainer.appendChild(confirmButton);
    modal.appendChild(messageElement);
    modal.appendChild(buttonsContainer);
    overlay.appendChild(modal);

    document.body.appendChild(overlay);
}