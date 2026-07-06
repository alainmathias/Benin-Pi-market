// js/auth.js
// ============================================
// AUTHENTICATION - EN ANGLES
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

// Cache
let currentUserCache = null;
let currentUserDataCache = null;

// ============================================
// REGISTER
// ============================================
export async function register(email, password, userData) {
    try {
        // Check if phone already exists
        const phoneQuery = await getDocs(
            query(collection(db, 'users'), where('telephone', '==', userData.telephone))
        );
        if (!phoneQuery.empty) {
            return {
                success: false,
                message: 'This phone number is already used.'
            };
        }

        // Check if email exists
        if (email) {
            const emailQuery = await getDocs(
                query(collection(db, 'users'), where('email', '==', email))
            );
            if (!emailQuery.empty) {
                return {
                    success: false,
                    message: 'This email is already used.'
                };
            }
        }

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            ...userData,
            email: email || '',
            status: 'pending',          // pending, active, suspended
            role: 'vendor',             // vendor, admin
            createdAt: new Date().toISOString(),
            photoURL: '',
            lastLogin: new Date().toISOString(),
            productsCount: 0,
            isActive: true
        });

        currentUserDataCache = {
            uid: user.uid,
            ...userData,
            email: email || '',
            status: 'pending',
            role: 'vendor'
        };

        return {
            success: true,
            message: 'Registration successful! Waiting for admin validation.',
            user: user,
            data: currentUserDataCache
        };
    } catch (error) {
        console.error('Register error:', error);
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') {
            message = 'This email is already used.';
        } else if (error.code === 'auth/weak-password') {
            message = 'Password must be at least 6 characters.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email format.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// LOGIN
// ============================================
export async function login(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            return {
                success: false,
                message: 'Account not found in database.'
            };
        }

        const userData = userDoc.data();
        
        // Check status
        if (userData.status === 'suspended') {
            await signOut(auth);
            return {
                success: false,
                message: 'Your account has been suspended. Contact administrator.'
            };
        }

        if (!userData.isActive) {
            await signOut(auth);
            return {
                success: false,
                message: 'Your account is deactivated. Contact administrator.'
            };
        }

        if (userData.status === 'pending') {
            return {
                success: false,
                message: 'Your account is pending validation by administrator.'
            };
        }

        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date().toISOString()
        });

        currentUserCache = user;
        currentUserDataCache = userData;

        const welcomeMessage = userData.role === 'admin' 
            ? '👋 Welcome Admin!' 
            : `👋 Welcome ${userData.prenom} ${userData.nom}!`;

        return {
            success: true,
            message: welcomeMessage,
            user: user,
            data: userData
        };

    } catch (error) {
        console.error('Login error:', error);
        let message = '❌ Invalid email or password.';
        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email.';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Incorrect password.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Too many attempts. Please try again later.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Invalid email format.';
        } else if (error.code === 'auth/user-disabled') {
            message = 'This account has been disabled.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// LOGOUT
// ============================================
export async function logout() {
    try {
        await signOut(auth);
        currentUserCache = null;
        currentUserDataCache = null;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error logging out.');
    }
}

// ============================================
// FORGOT PASSWORD
// ============================================
export async function forgotPassword(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true,
            message: 'Password reset email has been sent.'
        };
    } catch (error) {
        console.error('Forgot password error:', error);
        let message = 'Error sending email.';
        if (error.code === 'auth/user-not-found') {
            message = 'No account found with this email.';
        }
        return {
            success: false,
            message: message
        };
    }
}

// ============================================
// GET CURRENT USER
// ============================================
export function getCurrentUser() {
    return auth.currentUser || currentUserCache;
}

// ============================================
// GET CURRENT USER DATA (with cache)
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
        console.error('Error getting user data:', error);
        return null;
    }
}

// ============================================
// CHECK AUTH STATE
// ============================================
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserCache = user;
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
// VALIDATE USER (Admin)
// ============================================
export async function validateUser(uid) {
    try {
        await updateDoc(doc(db, 'users', uid), {
            status: 'active',
            validatedAt: new Date().toISOString()
        });
        return { success: true, message: 'User validated successfully.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// ============================================
// SUSPEND USER (Admin)
// ============================================
export async function suspendUser(uid) {
    try {
        await updateDoc(doc(db, 'users', uid), {
            status: 'suspended'
        });
        return { success: true, message: 'User suspended.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}