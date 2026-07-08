// js/utils.js
// ============================================
// UTILITY FUNCTIONS - BÉNIN PI MARKET
// ============================================

import { signOut, auth } from './firebase-config.js';
import { getExchangeRate, toPi, formatPi } from './pi-utils.js';

// ============================================
// LOGOUT
// ============================================
export function logout() {
    try {
        signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        alert('Erreur lors de la déconnexion.');
    }
}

// ============================================
// FORMAT PRICE (FCFA)
// ============================================
export function formatPrice(price) {
    if (!price && price !== 0) return '0 FCFA';
    try {
        return new Intl.NumberFormat('fr-BJ', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    } catch (e) {
        return `${price} FCFA`;
    }
}

// ============================================
// FORMAT DATE
// ============================================
export function formatDate(dateString) {
    if (!dateString) return 'Date inconnue';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        if (days < 30) return `Il y a ${Math.floor(days/7)} sem`;
        
        return date.toLocaleDateString('fr-BJ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return 'Date invalide';
    }
}

// ============================================
// DISPLAY PRODUCTS (ENGLISH)
// ============================================
export function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Conteneur "${containerId}" non trouvé`);
        return;
    }

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8 text-gray-500">
                <i class="fas fa-box-open text-3xl block mb-2"></i>
                <p class="text-sm">Aucun produit trouvé</p>
                <p class="text-xs text-gray-400">Soyez le premier à publier !</p>
            </div>
        `;
        return;
    }

    const rate = getExchangeRate();

    container.innerHTML = products.map((product, index) => {
        const priceInPi = toPi(product.price || 0);
        
        return `
            <div class="bg-white border border-gray-100 rounded-2xl p-3 product-card-shadow cursor-pointer hover:shadow-md transition-all duration-300 animate-fade-in" 
                 style="animation-delay: ${index * 0.05}s"
                 onclick="window.location.href='products/detail.html?id=${product.id}'">
                <div class="relative aspect-[4/5] rounded-2xl overflow-hidden mb-3 bg-gray-100">
                    ${product.images && product.images.length > 0 
                        ? `<img src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover" loading="lazy">`
                        : `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fas fa-image text-3xl"></i></div>`
                    }
                    <div class="absolute bottom-2 left-2 bg-primary-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                        ${formatPrice(product.price)}
                    </div>
                    <div class="absolute top-2 right-2 bg-pi-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        ${priceInPi.toFixed(1)} Pi
                    </div>
                    ${product.status === 'pending' ? `
                        <div class="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                            En attente
                        </div>
                    ` : ''}
                </div>
                <h4 class="text-xs font-bold leading-snug line-clamp-2">${product.title || 'Sans titre'}</h4>
                <div class="flex items-center justify-between mt-1">
                    <span class="text-[10px] text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${product.city || '-'}</span>
                    <span class="text-[10px] text-gray-400"><i class="far fa-eye mr-1"></i>${product.views || 0}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// DISPLAY CATEGORIES
// ============================================
export function displayCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                <i class="fas fa-folder-open text-3xl block mb-2"></i>
                Aucune catégorie disponible
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(cat => `
        <a href="products/list.html?category=${encodeURIComponent(cat.name)}" 
           class="bg-gray-100 hover:bg-primary-500 hover:text-white p-4 rounded-2xl text-center transition-all duration-300 group">
            <span class="text-3xl block mb-1 group-hover:scale-110 transition">${cat.icon || '📦'}</span>
            <span class="font-medium text-sm">${cat.name}</span>
        </a>
    `).join('');
}

// ============================================
// SHOW ALERT
// ============================================
export function showAlert(message, type = 'success', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Conteneur d\'alerte non trouvé:', containerId);
        if (type === 'danger') {
            alert('❌ ' + message);
        } else {
            alert('✅ ' + message);
        }
        return;
    }

    const alertClass = type === 'success' ? 'alert-success' : 
                       type === 'danger' ? 'alert-danger' : 
                       'alert-warning';

    const alertDiv = document.createElement('div');
    alertDiv.className = `${alertClass} animate-fade-in`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'danger' ? 'fa-exclamation-circle' : 
                 'fa-exclamation-triangle';
    
    alertDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }, 6000);
}

// ============================================
// AUTRES UTILITAIRES
// ============================================
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function isValidPhone(phone) {
    const re = /^(\+229)?[0-9]{8,10}$/;
    return re.test(phone.replace(/\s/g, ''));
}

export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch {}
        document.body.removeChild(textarea);
    }
}

// ============================================
// ALIAS POUR COMPATIBILITÉ (noms français)
// ============================================
export const afficherProduits = displayProducts;
export const afficherCategories = displayCategories;
export const afficherAlert = showAlert;
export const formaterPrix = formatPrice;
export const formaterDate = formatDate;