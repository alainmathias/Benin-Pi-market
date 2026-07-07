// js/reviews.js
// ============================================
// SYSTÈME D'AVIS ET NOTES
// ============================================

import { db, collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, getDoc } from './firebase-config.js';
import { showNotification } from './notifications.js';

// Ajouter un avis
export async function addReview(productId, userId, rating, comment) {
    try {
        // Vérifier si l'utilisateur a déjà donné un avis
        const existingQuery = query(
            collection(db, 'reviews'),
            where('productId', '==', productId),
            where('userId', '==', userId)
        );
        const existing = await getDocs(existingQuery);
        
        if (!existing.empty) {
            return {
                success: false,
                message: 'Vous avez déjà donné un avis pour ce produit.'
            };
        }
        
        // Ajouter l'avis
        const reviewData = {
            productId,
            userId,
            rating: Math.min(Math.max(rating, 1), 5), // Entre 1 et 5
            comment: comment.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, 'reviews'), reviewData);
        
        // Mettre à jour la note moyenne du produit
        await updateProductRating(productId);
        
        return {
            success: true,
            message: 'Votre avis a été publié !',
            id: docRef.id,
            data: reviewData
        };
    } catch (error) {
        console.error('Erreur ajout avis:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Récupérer les avis d'un produit
export async function getProductReviews(productId) {
    try {
        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', productId),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const reviews = [];
        querySnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        return reviews;
    } catch (error) {
        console.error('Erreur récupération avis:', error);
        return [];
    }
}

// Mettre à jour la note moyenne du produit
export async function updateProductRating(productId) {
    try {
        const reviews = await getProductReviews(productId);
        
        if (reviews.length === 0) {
            await updateDoc(doc(db, 'products', productId), {
                averageRating: 0,
                totalReviews: 0
            });
            return;
        }
        
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const average = totalRating / reviews.length;
        
        await updateDoc(doc(db, 'products', productId), {
            averageRating: Math.round(average * 10) / 10,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('Erreur mise à jour note:', error);
    }
}

// Supprimer un avis (Admin ou auteur)
export async function deleteReview(reviewId, userId, isAdmin = false) {
    try {
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await getDoc(reviewRef);
        
        if (!reviewDoc.exists()) {
            return {
                success: false,
                message: 'Avis non trouvé.'
            };
        }
        
        const reviewData = reviewDoc.data();
        
        if (!isAdmin && reviewData.userId !== userId) {
            return {
                success: false,
                message: 'Vous n\'êtes pas autorisé à supprimer cet avis.'
            };
        }
        
        await deleteDoc(reviewRef);
        
        // Mettre à jour la note du produit
        await updateProductRating(reviewData.productId);
        
        return {
            success: true,
            message: 'Avis supprimé avec succès.'
        };
    } catch (error) {
        console.error('Erreur suppression avis:', error);
        return {
            success: false,
            message: error.message
        };
    }
}

// Générer le HTML des étoiles
export function renderStars(rating, maxStars = 5) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
    
    let html = '';
    for (let i = 0; i < fullStars; i++) {
        html += '<i class="fas fa-star text-yellow-400"></i>';
    }
    if (hasHalfStar) {
        html += '<i class="fas fa-star-half-alt text-yellow-400"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        html += '<i class="far fa-star text-gray-300"></i>';
    }
    return html;
}

// Générer le HTML des étoiles cliquables
export function renderStarRatingInput(selectedRating = 0) {
    let html = '<div class="flex gap-1">';
    for (let i = 1; i <= 5; i++) {
        const isSelected = i <= selectedRating;
        html += `
            <button type="button" onclick="selectRating(${i})" 
                    class="text-2xl transition hover:scale-110 focus:outline-none rating-star ${isSelected ? 'text-yellow-400' : 'text-gray-300'}">
                <i class="fas fa-star"></i>
            </button>
        `;
    }
    html += '</div>';
    return html;
}