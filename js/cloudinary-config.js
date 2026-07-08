// js/cloudinary-config.js
// ============================================
// CONFIGURATION CLOUDINARY - BÉNIN PI MARKET
// ============================================

const CLOUDINARY_CONFIG = {
    cloudName: 'djnqwtapp',
    uploadPreset: 'militant',
    resourceType: 'auto'
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
    
    if (options.folder) {
        formData.append('folder', options.folder);
    }
    if (options.publicId) {
        formData.append('public_id', options.publicId);
    }
    if (options.tags) {
        formData.append('tags', options.tags);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        });
        
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
// GÉNÉRER UNE URL OPTIMISÉE
// ============================================
export function getOptimizedCloudinaryUrl(publicId, options = {}) {
    const { cloudName } = CLOUDINARY_CONFIG;
    
    let url = `https://res.cloudinary.com/${cloudName}/image/upload/`;
    
    const transformations = [];
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    if (transformations.length > 0) {
        url += transformations.join(',') + '/';
    }
    url += publicId;
    
    return url;
}

export default {
    uploadToCloudinary,
    uploadMultipleToCloudinary,
    getOptimizedCloudinaryUrl,
    CLOUDINARY_CONFIG
};