// js/auth.js
// ============================================
// GESTION DE L'AUTHENTIFICATION
// ============================================

import { 
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

// Cache utilisateur
let currentUserCache = null;
let currentUserDataCache = null;

// INSCRIPTION
export async function inscription(email, password, userData) {
    try {
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

        // Vérifier si l'email existe déjà
        if (email) {
            const emailQuery = await getDocs(
                query(collection(db, 'users'), where('email', '==', email))
            );
            if (!emailQuery.empty) {
                return {
                    success: false,
                    message: 'Cet email est déjà utilisé.'
                };
            }
        }

        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Ajouter les données dans Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            ...userData,
            email: email || '',
            statut: 'en_attente',
            role: 'vendeur',
            dateInscription: new Date().toISOString(),
            photoProfil: '',
            dateDerniereConnexion: new Date().toISOString(),
            produitsPublies: 0,
            compteActive: true
        });

        currentUserDataCache = {
            uid: user.uid,
            ...userData,
            email: email || '',
            statut: 'en_attente',
            role: 'vendeur'
        };

        return {
            success: true,
            message: 'Inscription réussie ! En attente de validation par l\'administrateur.',
            user: user,
            data: currentUserDataCache
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

// CONNEXION
export async function connexion(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            return {
                success: false,
                message: 'Compte non trouvé dans la base de données.'
            };
        }

        const userData = userDoc.data();
        if (userData.statut === 'suspendu') {
            return {
                success: false,
                message: 'Votre compte a été suspendu. Contactez l\'administrateur.'
            };
        }

        if (!userData.compteActive) {
            return {
                success: false,
                message: 'Votre compte est désactivé. Contactez l\'administrateur.'
            };
        }

        // Mettre à jour la date de dernière connexion
        await updateDoc(doc(db, 'users', user.uid), {
            dateDerniereConnexion: new Date().toISOString()
        });

        currentUserCache = user;
        currentUserDataCache = userData;

        return {
            success: true,
            message: 'Connexion réussie !',
            user: user,
            data: userData
        };
    } catch (error) {
        console.error('Erreur connexion:', error);
        let message = 'Email ou mot de passe incorrect.';
        if (error.code === 'auth/user-not-found') {
            message = 'Aucun compte trouvé avec cet email.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Mot de passe incorrect.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Trop de tentatives. Réessayez plus tard.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Format d\'email invalide.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// DÉCONNEXION
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

// VÉRIFIER L'ÉTAT DE L'AUTHENTIFICATION
export function verifierAuth(callback) {
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

// RÉCUPÉRER LES DONNÉES DE L'UTILISATEUR (avec cache)
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

// RÉCUPÉRER L'UTILISATEUR ACTUEL
export function getCurrentUser() {
    return auth.currentUser || currentUserCache;
}

// ENVOYER UN EMAIL DE RÉINITIALISATION
export async function resetPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Un email de réinitialisation a été envoyé.'
        };
    } catch (error) {
        console.error('Erreur réinitialisation:', error);
        let message = 'Erreur lors de l\'envoi de l\'email.';
        if (error.code === 'auth/user-not-found') {
            message = 'Aucun compte trouvé avec cet email.';
        }
        return {
            success: false,
            message: message
        };
    }
}