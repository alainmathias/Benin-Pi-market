// js/cloudinary-config.js
// ============================================
// CONFIGURATION CLOUDINARY
// ============================================

const CLOUDINARY_CONFIG = {
    cloudName: 'djnqwtapp',
    uploadPreset: 'militant',
    apiKey: 'VOTRE_API_KEY', // Optionnel pour les uploads signés
    resourceType: 'auto' // auto, image, video, raw
};

// ============================================
// UPLOAD VERS CLOUDINARY
// ============================================
export async function uploadToCloudinary(file, onProgress, options = {}) {
    const { cloudName, uploadPreset, resourceType } = CLOUDINARY_CONFIG;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('resource_type', options.resourceType || resourceType || 'auto');
    
    // Options supplémentaires
    if (options.folder) {
        formData.append('folder', options.folder);
    }
    if (options.publicId) {
        formData.append('public_id', options.publicId);
    }
    if (options.tags) {
        formData.append('tags', options.tags);
    }
    if (options.context) {
        formData.append('context', options.context);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progression
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        });
        
        // Réponse
        xhr.onload = () => {
            if (xhr.status === 200) {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (data.secure_url) {
                        resolve({
                            url: data.secure_url,
                            publicId: data.public_id,
                            format: data.format,
                            width: data.width,
                            height: data.height,
                            bytes: data.bytes,
                            createdAt: data.created_at,
                            ...data
                        });
                    } else {
                        reject(new Error('Erreur: Réponse Cloudinary invalide'));
                    }
                } catch (e) {
                    reject(new Error('Erreur lors du parsing de la réponse'));
                }
            } else {
                reject(new Error(`Erreur HTTP ${xhr.status}: ${xhr.statusText}`));
            }
        };
        
        xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload'));
        xhr.ontimeout = () => reject(new Error('Timeout lors de l\'upload'));
        
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${options.resourceType || resourceType || 'auto'}/upload`);
        xhr.send(formData);
    });
}

// ============================================
// UPLOAD MULTIPLE FICHIERS
// ============================================
export async function uploadMultipleToCloudinary(files, onProgress, options = {}) {
    const results = [];
    const total = files.length;
    let completed = 0;

    for (const file of files) {
        try {
            const result = await uploadToCloudinary(file, (percent) => {
                const totalPercent = ((completed + (percent / 100)) / total) * 100;
                if (onProgress) onProgress(Math.round(totalPercent));
            }, options);
            
            results.push(result);
            completed++;
            
            if (onProgress) {
                onProgress(Math.round((completed / total) * 100));
            }
        } catch (error) {
            console.error('Erreur upload:', error);
            results.push({ error: error.message, file: file.name });
        }
    }

    return results;
}

// ============================================
// SUPPRIMER UN FICHIER DE CLOUDINARY
// ============================================
export async function deleteFromCloudinary(publicId, options = {}) {
    // Note: La suppression nécessite une API signée
    // Vous pouvez utiliser une fonction Cloud Function ou backend
    // Pour l'instant, cette fonction est un placeholder
    
    console.warn('⚠️ Suppression Cloudinary nécessite une API signée');
    return {
        success: false,
        message: 'La suppression directe n\'est pas supportée depuis le client'
    };
}

// ============================================
// GÉNÉRER UNE URL OPTIMISÉE
// ============================================
export function getOptimizedCloudinaryUrl(publicId, options = {}) {
    const { cloudName } = CLOUDINARY_CONFIG;
    
    // Construire l'URL de base
    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    
    // Options de transformation
    const transformations = [];
    
    if (options.width) {
        transformations.push(`w_${options.width}`);
    }
    if (options.height) {
        transformations.push(`h_${options.height}`);
    }
    if (options.crop) {
        transformations.push(`c_${options.crop}`);
    }
    if (options.quality) {
        transformations.push(`q_${options.quality}`);
    }
    if (options.format) {
        transformations.push(`f_${options.format}`);
    }
    if (options.gravity) {
        transformations.push(`g_${options.gravity}`);
    }
    
    if (transformations.length > 0) {
        url += transformations.join(',') + '/';
    }
    
    url += publicId;
    
    return url;
}

// ============================================
// GÉNÉRER UNE URL DE VIGNETTE
// ============================================
export function getThumbnailUrl(publicId, width = 300, height = 300) {
    return getOptimizedCloudinaryUrl(publicId, {
        width,
        height,
        crop: 'fill',
        gravity: 'center',
        quality: 80,
        format: 'webp'
    });
}

export default {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    deleteFromCloudinary,
    getOptimizedCloudinaryUrl,
    getThumbnailUrl,
    CLOUDINARY_CONFIG
};