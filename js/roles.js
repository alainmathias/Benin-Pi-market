// js/roles.js
// ============================================
// GESTION DES RÔLES UTILISATEURS
// ============================================

import { db, collection, doc, getDoc, getDocs, addDoc, updateDoc, query, where, setDoc } from './firebase-config.js';

// ============================================
// RÔLES PRÉDÉFINIS
// ============================================
export const ROLES = {
    VENDOR: {
        id: 'vendor',
        name: 'Vendeur',
        slug: 'vendor',
        icon: 'fas fa-store',
        description: 'Peut vendre des produits'
    },
    DELIVERY: {
        id: 'delivery',
        name: 'Livreur',
        slug: 'delivery',
        icon: 'fas fa-truck',
        description: 'Peut livrer des colis'
    },
    SERVICE: {
        id: 'service_provider',
        name: 'Prestataire',
        slug: 'service_provider',
        icon: 'fas fa-tools',
        description: 'Propose des services'
    },
    ADMIN: {
        id: 'admin',
        name: 'Administrateur',
        slug: 'admin',
        icon: 'fas fa-user-shield',
        description: 'Gère la plateforme'
    }
};

// ============================================
// INITIALISER LES RÔLES DANS FIRESTORE
// ============================================
export async function initRoles() {
    try {
        const rolesRef = collection(db, 'roles');
        const snapshot = await getDocs(rolesRef);
        
        if (snapshot.empty) {
            // Créer les rôles par défaut
            for (const [key, role] of Object.entries(ROLES)) {
                await addDoc(collection(db, 'roles'), {
                    ...role,
                    createdAt: new Date().toISOString()
                });
                console.log(`✅ Rôle "${role.name}" créé`);
            }
        }
    } catch (error) {
        console.error('Erreur initialisation rôles:', error);
    }
}

// ============================================
// AJOUTER UN RÔLE À UN UTILISATEUR
// ============================================
export async function addRoleToUser(userId, roleSlug) {
    try {
        // Vérifier si l'utilisateur existe
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        // Récupérer l'ID du rôle
        const rolesRef = collection(db, 'roles');
        const q = query(rolesRef, where('slug', '==', roleSlug));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, message: 'Rôle non trouvé' };
        }

        const roleDoc = snapshot.docs[0];
        const roleId = roleDoc.id;

        // Vérifier si l'utilisateur a déjà ce rôle
        const userRolesRef = collection(db, 'user_roles');
        const userRoleQuery = query(
            userRolesRef,
            where('userId', '==', userId),
            where('roleId', '==', roleId)
        );
        const existing = await getDocs(userRoleQuery);
        
        if (!existing.empty) {
            return { success: false, message: 'Ce rôle est déjà attribué' };
        }

        // Ajouter le rôle
        await addDoc(collection(db, 'user_roles'), {
            userId,
            roleId,
            status: 'pending', // pending, active, suspended
            createdAt: new Date().toISOString(),
            validatedAt: null
        });

        // Mettre à jour le champ correspondant dans l'utilisateur
        const fieldMap = {
            'vendor': 'isVendor',
            'delivery': 'isDelivery',
            'service_provider': 'isServiceProvider',
            'admin': 'isAdmin'
        };
        
        const field = fieldMap[roleSlug];
        if (field) {
            await updateDoc(doc(db, 'users', userId), {
                [field]: true,
                updatedAt: new Date().toISOString()
            });
        }

        return { 
            success: true, 
            message: `Rôle "${roleSlug}" ajouté avec succès. En attente de validation.` 
        };

    } catch (error) {
        console.error('Erreur ajout rôle:', error);
        return { success: false, message: error.message };
    }
}

// ============================================
// VALIDER UN RÔLE (Admin)
// ============================================
export async function validateUserRole(userId, roleId) {
    try {
        const userRolesRef = collection(db, 'user_roles');
        const q = query(
            userRolesRef,
            where('userId', '==', userId),
            where('roleId', '==', roleId)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, message: 'Rôle non trouvé' };
        }

        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
            status: 'active',
            validatedAt: new Date().toISOString()
        });

        return { success: true, message: 'Rôle validé avec succès' };

    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ============================================
// RÉCUPÉRER LES RÔLES D'UN UTILISATEUR
// ============================================
export async function getUserRoles(userId) {
    try {
        const userRolesRef = collection(db, 'user_roles');
        const q = query(userRolesRef, where('userId', '==', userId));
        const snapshot = await getDocs(q);
        
        const roles = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const roleDoc = await getDoc(doc(db, 'roles', data.roleId));
            if (roleDoc.exists()) {
                roles.push({
                    id: data.roleId,
                    status: data.status,
                    ...roleDoc.data()
                });
            }
        }
        
        return roles;
    } catch (error) {
        console.error('Erreur récupération rôles:', error);
        return [];
    }
}

// ============================================
// VÉRIFIER SI UN UTILISATEUR A UN RÔLE
// ============================================
export async function hasRole(userId, roleSlug) {
    try {
        const roles = await getUserRoles(userId);
        return roles.some(r => r.slug === roleSlug && r.status === 'active');
    } catch {
        return false;
    }
}

// ============================================
// SUPPRIMER UN RÔLE (Admin ou auto)
// ============================================
export async function removeRoleFromUser(userId, roleId) {
    try {
        const userRolesRef = collection(db, 'user_roles');
        const q = query(
            userRolesRef,
            where('userId', '==', userId),
            where('roleId', '==', roleId)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return { success: false, message: 'Rôle non trouvé' };
        }

        await deleteDoc(snapshot.docs[0].ref);

        // Mettre à jour le champ dans l'utilisateur
        const roleDoc = await getDoc(doc(db, 'roles', roleId));
        if (roleDoc.exists()) {
            const roleData = roleDoc.data();
            const fieldMap = {
                'vendor': 'isVendor',
                'delivery': 'isDelivery',
                'service_provider': 'isServiceProvider',
                'admin': 'isAdmin'
            };
            const field = fieldMap[roleData.slug];
            if (field) {
                await updateDoc(doc(db, 'users', userId), {
                    [field]: false,
                    updatedAt: new Date().toISOString()
                });
            }
        }

        return { success: true, message: 'Rôle supprimé avec succès' };

    } catch (error) {
        return { success: false, message: error.message };
    }
}