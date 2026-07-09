// js/auth.js - Version avec gestion des rôles
// ============================================
//import { db, collection, addDoc, getDocs, query } from './firebase-config.js';

import { addDoc,
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    db, 
    doc, 
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs
} from './firebase-config.js';
import { initRoles } from './roles.js';

let currentUserCache = null;
let currentUserDataCache = null;

// ============================================
// INSCRIPTION
// ============================================
export async function register(email, password, userData) {
    try {
        // Initialiser les rôles si nécessaire
        await initRoles();

        // Vérifier si le téléphone existe déjà
        const phoneQuery = await getDocs(
            query(collection(db, 'users'), where('telephone', '==', userData.telephone))
        );
        if (!phoneQuery.empty) {
            return {
                success: false,
                message: 'Ce numéro de téléphone est déjà utilisé.'
            };
        }

        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ajouter les données dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            nom: userData.nom,
            prenom: userData.prenom,
            telephone: userData.telephone,
            whatsapp: userData.whatsapp || userData.telephone,
            email: email || '',
            photoURL: '',
            adresse: userData.adresse || '',
            ville: userData.ville || '',
            status: 'active',
            // Champs d'activité professionnelle (par défaut false)
            isVendor: false,
            isDelivery: false,
            isServiceProvider: false,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        });


await initRolesIfNeeded();
        return {
            success: true,
            message: '✅ Inscription réussie !',
            user: user
        };

    } catch (error) {
        console.error('Erreur inscription:', error);
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') {
            message = 'Cet email est déjà utilisé.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Le mot de passe doit contenir au moins 6 caractères.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Format d\'email invalide.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// CONNEXION
// ============================================
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            return {
                success: false,
                message: 'Compte non trouvé.'
            };
        }

        const userData = userDoc.data();

        if (userData.status === 'suspended') {
            return {
                success: false,
                message: '🚫 Votre compte a été suspendu.'
            };
        }

        // Mettre à jour la dernière connexion
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date().toISOString()
        });

        currentUserCache = user;
        currentUserDataCache = userData;

        return {
            success: true,
            message: `👋 Bonjour ${userData.prenom} ${userData.nom} !`,
            user: user,
            data: userData
        };

    } catch (error) {
        console.error('Erreur connexion:', error);
        let message = 'Email ou mot de passe incorrect.';
        if (error.code === 'auth/user-not-found') {
            message = 'Aucun compte trouvé.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Mot de passe incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Trop de tentatives. Réessayez plus tard.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// DÉCONNEXION
// ============================================
export async function logout() {
    try {
        await signOut(auth);
        currentUserCache = null;
        currentUserDataCache = null;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

// ============================================
// RÉCUPÉRER L'UTILISATEUR ACTUEL
// ============================================
export function getCurrentUser() {
    return auth.currentUser || currentUserCache;
}

export async function getCurrentUserData() {
    if (currentUserDataCache) {
        return currentUserDataCache;
    }

    const user = auth.currentUser;
    if (!user) return null;
    
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) return null;
        currentUserDataCache = userDoc.data();
        return currentUserDataCache;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
}

export function onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserCache = user;
        } else {
            currentUserCache = null;
            currentUserDataCache = null;
        }
        callback(user);
    });
}

// ============================================
// RÉINITIALISATION MOT DE PASSE
// ============================================
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Un email de réinitialisation a été envoyé.'
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

// js/auth.js - Ajouter cette fonction

//import { db, collection, addDoc, getDocs, query } from './firebase-config.js';

const ROLES = [
    { name: 'Vendeur', slug: 'vendor', icon: 'fas fa-store', description: 'Peut vendre des produits' },
    { name: 'Prestataire', slug: 'service_provider', icon: 'fas fa-tools', description: 'Peut proposer des services' },
    { name: 'Livreur', slug: 'delivery', icon: 'fas fa-truck', description: 'Peut livrer des colis' },
    { name: 'Administrateur', slug: 'admin', icon: 'fas fa-user-shield', description: 'Gère la plateforme' }
];

export async function initRolesIfNeeded() {
    try {
        const snapshot = await getDocs(collection(db, 'roles'));
        if (!snapshot.empty) return;
        
        for (const role of ROLES) {
            await addDoc(collection(db, 'roles'), {
                ...role,
                createdAt: new Date().toISOString()
            });
            console.log(`✅ Rôle "${role.name}" créé`);
        }
    } catch (error) {
        console.error('Erreur initialisation rôles:', error);
    }
}

// Appeler cette fonction dans register() après la création de l'utilisateur
// await initRolesIfNeeded();