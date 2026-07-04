// js/auth.js - Version améliorée pour la connexion

import { 
    auth, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    db, 
    doc, 
    getDoc,
    updateDoc
} from './firebase-config.js';

// Cache utilisateur
let currentUserCache = null;
let currentUserDataCache = null;

// ============================================
// CONNEXION (version améliorée)
// ============================================
export async function connexion(email, password) {
    try {
        // Tenter la connexion
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Récupérer les données depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
            return {
                success: false,
                message: 'Compte non trouvé dans la base de données.'
            };
        }

        const userData = userDoc.data();

        // Vérifier le statut du compte
        if (userData.statut === 'suspendu') {
            // Déconnecter l'utilisateur
            await signOut(auth);
            return {
                success: false,
                message: '❌ Votre compte a été suspendu. Contactez l\'administrateur.'
            };
        }

        if (!userData.compteActive) {
            await signOut(auth);
            return {
                success: false,
                message: '❌ Votre compte est désactivé. Contactez l\'administrateur.'
            };
        }

        if (userData.statut === 'en_attente') {
            return {
                success: false,
                message: '⏳ Votre compte est en attente de validation par l\'administrateur. Veuillez patienter.'
            };
        }

        // Mettre à jour la date de dernière connexion
        await updateDoc(doc(db, 'users', user.uid), {
            dateDerniereConnexion: new Date().toISOString()
        });

        // Mettre en cache
        currentUserCache = user;
        currentUserDataCache = userData;

        // Message de bienvenue
        const welcomeMessage = userData.role === 'admin' 
            ? '👋 Bienvenue Administrateur !' 
            : `👋 Bonjour ${userData.prenom} ${userData.nom} !`;

        return {
            success: true,
            message: welcomeMessage,
            user: user,
            data: userData
        };

    } catch (error) {
        console.error('Erreur connexion:', error);
        
        let message = '❌ Email ou mot de passe incorrect.';
        if (error.code === 'auth/user-not-found') {
            message = '❌ Aucun compte trouvé avec cet email.';
        } else if (error.code === 'auth/wrong-password') {
            message = '❌ Mot de passe incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
            message = '⏳ Trop de tentatives. Réessayez dans quelques minutes.';
        } else if (error.code === 'auth/invalid-email') {
            message = '❌ Format d\'email invalide.';
        } else if (error.code === 'auth/user-disabled') {
            message = '❌ Ce compte a été désactivé.';
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
export async function deconnexion() {
    try {
        await signOut(auth);
        currentUserCache = null;
        currentUserDataCache = null;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur déconnexion:', error);
        alert('Erreur lors de la déconnexion.');
    }
}

// ============================================
// RÉINITIALISATION DU MOT DE PASSE
// ============================================
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Un email de réinitialisation a été envoyé.'
        };
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        let message = 'Erreur lors de l\'envoi.';
        if (error.code === 'auth/user-not-found') {
            message = 'Aucun compte trouvé avec cet email.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// VÉRIFIER L'ÉTAT DE L'AUTHENTIFICATION
// ============================================
export function verifierAuth(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserCache = user;
            // Récupérer les données en arrière-plan
            getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
                if (docSnap.exists()) {
                    currentUserDataCache = docSnap.data();
                }
            }).catch(() => {});
        } else {
            currentUserCache = null;
            currentUserDataCache = null;
        }
        callback(user);
    });
}

// ============================================
// RÉCUPÉRER LES DONNÉES DE L'UTILISATEUR
// ============================================
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
        console.error('Erreur récupération données:', error);
        return null;
    }
}

// ============================================
// RÉCUPÉRER L'UTILISATEUR ACTUEL
// ============================================
export function getCurrentUser() {
    return auth.currentUser || currentUserCache;
}