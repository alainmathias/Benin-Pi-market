// js/utils.js
// ============================================
// UTILITY FUNCTIONS - EN ANGLAIS
// ============================================

import { signOut, auth } from './firebase-config.js';

// ============================================
// LOGOUT - AJOUTÉ ICI
// ============================================
export async function logout() {
    try {
        await signOut(auth);
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
    return new Intl.NumberFormat('fr-BJ', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
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
// DISPLAY PRODUCTS
// ============================================
export function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4 block"></i>
                <p class="text-gray-500 text-lg">Aucun produit trouvé</p>
                <p class="text-gray-400 text-sm mt-2">Soyez le premier à publier un produit !</p>
            </div>
        `;
        return;
    }

    container.innerHTML = products.map((product, index) => `
        <div class="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 group animate-fade-in" 
             style="animation-delay: ${index * 0.05}s"
             onclick="window.location.href='products/detail.html?id=${product.id}'">
            <div class="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                ${product.images && product.images.length > 0 
                    ? `<img src="${product.images[0]}" alt="${product.title}" 
                           class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                           loading="lazy"
                           onerror="this.style.display='none'">` 
                    : `<i class="fas fa-image text-6xl text-gray-300"></i>`
                }
                ${product.status === 'pending' ? `
                    <span class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                        En attente
                    </span>
                ` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-dark mb-1 line-clamp-1">${product.title || 'Sans titre'}</h3>
                <div class="text-secondary-500 font-bold text-xl">${formatPrice(product.price || 0)}</div>
                <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span><i class="fas fa-map-marker-alt mr-1"></i> ${product.city || 'Non spécifié'}</span>
                    <span><i class="far fa-clock mr-1"></i> ${formatDate(product.createdAt)}</span>
                </div>
                <div class="mt-2">
                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Disponible</span>
                </div>
            </div>
        </div>
    `).join('');
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
           class="bg-gray-100 hover:bg-primary-500 hover:text-white p-6 rounded-2xl text-center transition-all duration-300 group">
            <span class="text-4xl block mb-2 group-hover:scale-110 transition">${cat.icon || '📦'}</span>
            <span class="font-medium">${cat.name}</span>
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
        // Fallback: afficher dans une popup
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
    
    // Auto-fermeture après 6 secondes
    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }, 6000);
}

// ============================================
// VALIDATE FORM
// ============================================
export function validateForm(formData, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
        const value = formData[field];
        if (value === undefined || value === null || value.toString().trim() === '') {
            errors.push(`"${field}" est obligatoire`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// ============================================
// SHOW LOADING
// ============================================
export function showLoading(containerId, message = 'Chargement...') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16">
            <div class="spinner"></div>
            <p class="mt-4 text-gray-500">${message}</p>
        </div>
    `;
}

// ============================================
// HIDE LOADING
// ============================================
export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
}

// ============================================
// TRUNCATE TEXT
// ============================================
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// VALIDATE EMAIL
// ============================================
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ============================================
// VALIDATE PHONE (Benin format)
// ============================================
export function isValidPhone(phone) {
    const re = /^(\+229)?[0-9]{8,10}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
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
// GET URL PARAMETERS
// ============================================
export function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// ============================================
// SCROLL TO TOP
// ============================================
export function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}