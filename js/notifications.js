// js/notifications.js
// ============================================
// SYSTÈME DE NOTIFICATIONS EN TEMPS RÉEL
// ============================================

// Créer le conteneur de notifications
export function initNotifications() {
    const container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none';
    document.body.appendChild(container);
    return container;
}

// Afficher une notification
export function showNotification(message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container') || initNotifications();
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = `pointer-events-auto ${colors[type] || colors.info} text-white rounded-xl shadow-lg p-4 transform transition-all duration-300 translate-x-full opacity-0`;
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="fas ${icons[type] || icons.info} text-xl mt-0.5"></i>
            <div class="flex-1">
                <p class="text-sm font-medium">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white transition">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 100);
    
    // Auto-fermeture
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, duration);
    
    return notification;
}

// Notifications spécifiques
export function notifySuccess(message) {
    return showNotification(message, 'success');
}

export function notifyError(message) {
    return showNotification(message, 'error');
}

export function notifyWarning(message) {
    return showNotification(message, 'warning');
}

export function notifyInfo(message) {
    return showNotification(message, 'info');
}

// Notification de bienvenue
export function notifyWelcome(userName) {
    return showNotification(`👋 Bienvenue ${userName} !`, 'success', 3000);
}

// Notification de nouveau produit
export function notifyProductAdded(productTitle) {
    return showNotification(`✅ "${productTitle}" a été publié !`, 'success', 4000);
}

// Notification de validation de compte
export function notifyAccountValidated() {
    return showNotification('✅ Votre compte a été validé ! Vous pouvez maintenant publier.', 'success', 5000);
}