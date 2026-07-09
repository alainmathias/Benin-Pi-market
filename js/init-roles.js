// js/init-roles.js
// ============================================
// SCRIPT D'INITIALISATION DES RÔLES
// EXÉCUTER CE SCRIPT UNE SEULE FOIS
// ============================================

import { db, collection, addDoc, getDocs, query } from './firebase-config.js';

const ROLES = [
    {
        name: 'Vendeur',
        slug: 'vendor',
        icon: 'fas fa-store',
        description: 'Peut vendre des produits'
    },
    {
        name: 'Prestataire',
        slug: 'service_provider',
        icon: 'fas fa-tools',
        description: 'Peut proposer des services'
    },
    {
        name: 'Livreur',
        slug: 'delivery',
        icon: 'fas fa-truck',
        description: 'Peut livrer des colis'
    },
    {
        name: 'Administrateur',
        slug: 'admin',
        icon: 'fas fa-user-shield',
        description: 'Gère la plateforme'
    }
];

async function initRoles() {
    try {
        // Vérifier si les rôles existent déjà
        const snapshot = await getDocs(collection(db, 'roles'));
        
        if (!snapshot.empty) {
            console.log('✅ Les rôles existent déjà !');
            return;
        }

        // Créer les rôles
        for (const role of ROLES) {
            await addDoc(collection(db, 'roles'), {
                ...role,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Rôle "${role.name}" créé`);
        }
        
        console.log('✅ Tous les rôles ont été créés avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation des rôles:', error);
    }
}

// Exécuter l'initialisation
initRoles();