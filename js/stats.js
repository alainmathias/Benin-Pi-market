// js/stats.js
// ============================================
// STATISTIQUES AVANCÉES
// ============================================

import { db, collection, getDocs, query, where, doc, getDoc } from './firebase-config.js';

// Récupérer les statistiques globales (Admin)
export async function getGlobalStats() {
    try {
        // Utilisateurs
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = [];
        usersSnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        
        // Produits
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const products = [];
        productsSnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Avis
        const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
        const reviews = [];
        reviewsSnapshot.forEach((doc) => {
            reviews.push({ id: doc.id, ...doc.data() });
        });
        
        // Statistiques
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const pendingUsers = users.filter(u => u.status === 'pending').length;
        const suspendedUsers = users.filter(u => u.status === 'suspended').length;
        
        const totalProducts = products.length;
        const publishedProducts = products.filter(p => p.status === 'published').length;
        const pendingProducts = products.filter(p => p.status === 'pending').length;
        const rejectedProducts = products.filter(p => p.status === 'rejected').length;
        
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        const totalReviews = reviews.length;
        const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 0;
        
        // Top vendeurs
        const sellerStats = {};
        products.forEach(p => {
            if (!sellerStats[p.sellerId]) {
                sellerStats[p.sellerId] = {
                    sellerId: p.sellerId,
                    sellerName: p.sellerName || 'Inconnu',
                    products: 0,
                    views: 0,
                    sales: 0
                };
            }
            sellerStats[p.sellerId].products++;
            sellerStats[p.sellerId].views += (p.views || 0);
        });
        
        const topSellers = Object.values(sellerStats)
            .sort((a, b) => b.products - a.products)
            .slice(0, 5);
        
        // Évolution par mois
        const monthlyData = {};
        products.forEach(p => {
            const date = new Date(p.createdAt);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { products: 0, views: 0 };
            }
            monthlyData[monthKey].products++;
            monthlyData[monthKey].views += (p.views || 0);
        });
        
        const monthly = Object.entries(monthlyData)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, data]) => ({
                month,
                products: data.products,
                views: data.views
            }));
        
        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                pending: pendingUsers,
                suspended: suspendedUsers
            },
            products: {
                total: totalProducts,
                published: publishedProducts,
                pending: pendingProducts,
                rejected: rejectedProducts
            },
            views: totalViews,
            reviews: {
                total: totalReviews,
                averageRating: Math.round(averageRating * 10) / 10
            },
            topSellers: topSellers,
            monthly: monthly
        };
    } catch (error) {
        console.error('Erreur statistiques:', error);
        return null;
    }
}

// Récupérer les statistiques d'un vendeur
export async function getVendorStats(vendorId) {
    try {
        // Produits du vendeur
        const q = query(
            collection(db, 'products'),
            where('sellerId', '==', vendorId)
        );
        const productsSnapshot = await getDocs(q);
        const products = [];
        productsSnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        const totalProducts = products.length;
        const publishedProducts = products.filter(p => p.status === 'published').length;
        const pendingProducts = products.filter(p => p.status === 'pending').length;
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        
        // Avis sur les produits du vendeur
        let totalReviews = 0;
        let totalRating = 0;
        for (const product of products) {
            const reviewsSnapshot = await getDocs(
                query(collection(db, 'reviews'), where('productId', '==', product.id))
            );
            reviewsSnapshot.forEach((doc) => {
                const review = doc.data();
                totalReviews++;
                totalRating += review.rating;
            });
        }
        
        const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;
        
        // Produits les plus vus
        const topProducts = products
            .filter(p => p.status === 'published')
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
            .map(p => ({
                id: p.id,
                title: p.title,
                views: p.views || 0,
                price: p.price
            }));
        
        return {
            products: {
                total: totalProducts,
                published: publishedProducts,
                pending: pendingProducts
            },
            views: totalViews,
            reviews: {
                total: totalReviews,
                averageRating: Math.round(averageRating * 10) / 10
            },
            topProducts: topProducts
        };
    } catch (error) {
        console.error('Erreur statistiques vendeur:', error);
        return null;
    }
}

// Générer un graphique en barres (HTML + CSS)
export function renderBarChart(data, options = {}) {
    const {
        width = '100%',
        height = '200px',
        barColor = '#1a73e8',
        label = 'Valeurs'
    } = options;
    
    if (!data || data.length === 0) {
        return '<p class="text-gray-500 text-center">Aucune donnée disponible</p>';
    }
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    return `
        <div class="w-full" style="height: ${height}">
            <div class="flex items-end justify-between h-full gap-2">
                ${data.map(d => `
                    <div class="flex-1 flex flex-col items-center">
                        <div class="w-full bg-primary-100 rounded-t-lg transition-all duration-500 hover:bg-primary-200"
                             style="height: ${(d.value / maxValue) * 80}%; min-height: 10px;">
                            <div class="w-full bg-primary-500 rounded-t-lg transition-all duration-500"
                                 style="height: ${(d.value / maxValue) * 80}%; min-height: 10px;"></div>
                        </div>
                        <span class="text-xs text-gray-500 mt-1 truncate w-full text-center">${d.label}</span>
                        <span class="text-xs font-semibold text-primary-500">${d.value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}