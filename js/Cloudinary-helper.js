// js/cloudinary-helpers.js
// ============================================
// FONCTIONS AIDES POUR CLOUDINARY
// ============================================

// Générer une URL de transformation
export function getTransformedUrl(publicId, transformations) {
    const { cloudName } = CLOUDINARY_CONFIG;
    const transforms = Object.entries(transformations)
        .map(([key, value]) => `${key}_${value}`)
        .join(',');
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}

// Générer une URL pour image responsive
export function getResponsiveImageUrl(publicId, sizes = [300, 600, 900]) {
    return sizes.map(size => ({
        size,
        url: getTransformedUrl(publicId, { w: size, q: 80, f: 'webp' })
    }));
}

// Générer une URL de vidéo
export function getVideoUrl(publicId, options = {}) {
    const { cloudName } = CLOUDINARY_CONFIG;
    let url = `https://res.cloudinary.com/${cloudName}/video/upload/`;
    
    if (options.controls) {
        url += `c_${options.crop || 'fit'},w_${options.width || 800}/`;
    }
    
    url += publicId;
    return url;
}

// Extraire le publicId d'une URL
export function extractPublicIdFromUrl(url) {
    const matches = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return matches ? matches[1] : null;
}

// Vérifier si une URL est Cloudinary
export function isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
}

// Optimiser une image existante
export function optimizeCloudinaryImage(url, options = {}) {
    if (!isCloudinaryUrl(url)) return url;
    
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    
    if (transformations.length === 0) return url;
    
    // Injecter les transformations dans l'URL
    const parts = url.split('/upload/');
    return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
}

export default {
    getTransformedUrl,
    getResponsiveImageUrl,
    getVideoUrl,
    extractPublicIdFromUrl,
    isCloudinaryUrl,
    optimizeCloudinaryImage
};