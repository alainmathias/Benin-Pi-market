// js/utils.js
// ============================================
// UTILITY FUNCTIONS - EN ANGLAIS
// ============================================

// FORMAT PRICE (FCFA)
export function formatPrice(price) {
    return new Intl.NumberFormat('fr-BJ', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

// FORMAT DATE
export function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days} days ago`;
        if (days < 30) return `${Math.floor(days/7)} weeks ago`;
        
        return date.toLocaleDateString('fr-BJ', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return 'Invalid date';
    }
}

// DISPLAY PRODUCTS
export function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-box-open text-6xl text-gray-300 mb-4 block"></i>
                <p class="text-gray-500 text-lg">No products found</p>
                <p class="text-gray-400 text-sm mt-2">Be the first to publish a product!</p>
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
                        Pending
                    </span>
                ` : ''}
            </div>
            <div class="p-4">
                <h3 class="font-bold text-lg text-dark mb-1 line-clamp-1">${product.title || 'Untitled'}</h3>
                <div class="text-secondary-500 font-bold text-xl">${formatPrice(product.price || 0)}</div>
                <div class="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <span><i class="fas fa-map-marker-alt mr-1"></i> ${product.city || 'Not specified'}</span>
                    <span><i class="far fa-clock mr-1"></i> ${formatDate(product.createdAt)}</span>
                </div>
                <div class="mt-2">
                    <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">Available</span>
                </div>
            </div>
        </div>
    `).join('');
}

// DISPLAY CATEGORIES
export function displayCategories(categories, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                <i class="fas fa-folder-open text-3xl block mb-2"></i>
                No categories available
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

// SHOW ALERT
export function showAlert(message, type = 'success', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Alert container not found:', containerId);
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

// VALIDATE FORM
export function validateForm(formData, requiredFields) {
    const errors = [];
    
    for (const field of requiredFields) {
        const value = formData[field];
        if (value === undefined || value === null || value.toString().trim() === '') {
            errors.push(`"${field}" is required`);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// SHOW LOADING
export function showLoading(containerId, message = 'Loading...') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16">
            <div class="spinner"></div>
            <p class="mt-4 text-gray-500">${message}</p>
        </div>
    `;
}

// HIDE LOADING
export function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
}

// TRUNCATE TEXT
export function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// VALIDATE EMAIL
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// VALIDATE PHONE (Benin format)
export function isValidPhone(phone) {
    const re = /^(\+229)?[0-9]{8,10}$/;
    return re.test(phone.replace(/\s/g, ''));
}