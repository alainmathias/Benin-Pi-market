// js/utils.js

// AFFICHER LES PRODUITS (avec classes Tailwind)
export function afficherProduits(produits, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!produits || produits.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4 block"></i>
                <p class="text-gray-500">Aucun produit trouvé</p>
            </div>
        `;
        return;
    }

    container.innerHTML = produits.map(produit => `
        <div class="card cursor-pointer group" onclick="window.location.href='produit-detail.html?id=${produit.id}'">
            <div class="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                ${produit.images && produit.images.length > 0 
                    ? `<img src="${produit.images[0]}" alt="${produit.titre}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">` 
                    : `<i class="fas fa-image text-6xl text-gray-300"></i>`
                }
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-dark mb-1 line-clamp-1">${produit.titre}</h3>
                <div class="text-secondary-500 font-bold text-xl">${formatPrix(produit.prix)}</div>
                <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span><i class="fas fa-map-marker-alt mr-1"></i> ${produit.ville}</span>
                    <span><i class="far fa-clock mr-1"></i> ${formatDate(produit.datePublication)}</span>
                </div>
                <div class="mt-2">
                    <span class="badge-success text-xs">Disponible</span>
                </div>
            </div>
        </div>
    `).join('');
}

// FORMATER LE PRIX
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
    const date = new Date(dateString);
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
}

// AFFICHER LES CATÉGORIES
export function afficherCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <a href="produits.html?categorie=${encodeURIComponent(cat.nom)}" 
           class="bg-gray-100 hover:bg-primary-500 hover:text-white p-6 rounded-2xl text-center transition-all duration-300 group">
            <span class="text-4xl block mb-2 group-hover:scale-110 transition">${cat.icone || '📦'}</span>
            <span class="font-medium">${cat.nom}</span>
        </a>
    `).join('');
}

// AFFICHER LES ALERTES
export function showAlert(message, type = 'success', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const alertClass = type === 'success' ? 'alert-success' : 
                       type === 'danger' ? 'alert-danger' : 
                       'alert-warning';

    const alertDiv = document.createElement('div');
    alertDiv.className = `${alertClass} animate-fade-in`;
    alertDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                           type === 'danger' ? 'fa-exclamation-circle' : 
                           'fa-exclamation-triangle'}"></i>
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
    }, 5000);
}

// VALIDER UN FORMULAIRE
export function validateForm(formData, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`Le champ "${field}" est obligatoire`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// AFFICHER UN LOADING
export function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12">
                <div class="spinner"></div>
                <p class="mt-4 text-gray-500">Chargement en cours...</p>
            </div>
        `;
    }
}