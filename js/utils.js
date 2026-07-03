// js/utils.js
// ============================================
// FONCTIONS UTILITAIRES
// ============================================

// FORMATER LE PRIX (FCFA)
export function formatPrix(prix) {
    return new Intl.NumberFormat('fr-BJ', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(prix);
}

// FORMATER LA DATE
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

// AFFICHER LES PRODUITS
export function afficherProduits(produits, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!produits || produits.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4 block"></i>
                <p class="text-gray-500 text-lg">Aucun produit trouvé</p>
                <p class="text-gray-400 text-sm mt-2">Soyez le premier à publier un produit !</p>
            </div>
        `;
        return;
    }

    container.innerHTML = produits.map((produit, index) => `
        <div class="bg-white rounded-2xl shadow-card hover:shadow-card-hover overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 group animate-fade-in" 
             style="animation-delay: ${index * 0.05}s"
             onclick="window.location.href='produit-detail.html?id=${produit.id}'">
            <div class="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                ${produit.images && produit.images.length > 0 
                    ? `<img src="${produit.images[0]}" alt="${produit.titre}" 
                           class="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                           loading="lazy"
                           onerror="this.style.display='none'">` 
                    : `<i class="fas fa-image text-6xl text-gray-300"></i>`
                }
                ${produit.statut === 'en_attente' ? `
                    <span class="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                        En attente
                    </span>
                ` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-dark mb-1 line-clamp-1">${produit.titre || 'Sans titre'}</h3>
                <div class="text-secondary-500 font-bold text-xl">${formatPrix(produit.prix || 0)}</div>
                <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span><i class="fas fa-map-marker-alt mr-1"></i> ${produit.ville || 'Non spécifié'}</span>
                    <span><i class="far fa-clock mr-1"></i> ${formatDate(produit.datePublication)}</span>
                </div>
                <div class="mt-2">
                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Disponible</span>
                </div>
            </div>
        </div>
    `).join('');
}

// AFFICHER LES CATÉGORIES
export function afficherCategories(categories, containerId) {
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
        <a href="produits.html?categorie=${encodeURIComponent(cat.nom)}" 
           class="bg-gray-100 hover:bg-primary-500 hover:text-white p-6 rounded-2xl text-center transition-all duration-300 group">
            <span class="text-4xl block mb-2 group-hover:scale-110 transition">${cat.icone || '📦'}</span>
            <span class="font-medium">${cat.nom}</span>
        </a>
    `).join('');
}

// AFFICHER UNE ALERTE
export function showAlert(message, type = 'success', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Conteneur d\'alerte non trouvé:', containerId);
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

// VALIDER UN FORMULAIRE
export function validateForm(formData, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
        const value = formData[field];
        if (value === undefined || value === null || value.toString().trim() === '') {
            errors.push(`Le champ "${field}" est obligatoire`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// AFFICHER UN LOADING
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

// MASQUER LE LOADING
export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
}

// TRONQUER UN TEXTE
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// VALIDER UN EMAIL
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// VALIDER UN NUMÉRO DE TÉLÉPHONE
export function isValidPhone(phone) {
    // Format Bénin: +229 XX XX XX XX ou XX XX XX XX
    const re = /^(\+229)?[0-9]{8,10}$/;
    return re.test(phone.replace(/\s/g, ''));
}

// COPIER DANS LE PRESSE-PAPIER
export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {});
    } else {
        // Fallback
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