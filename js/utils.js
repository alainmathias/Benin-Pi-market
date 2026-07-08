// js/pi-utils.js
// ============================================
// UTILITAIRES POUR CRYPTO PI
// ============================================

// Taux de conversion (à mettre à jour régulièrement)
let EXCHANGE_RATE = 1000; // 1 Pi = 1000 FCFA

// ============================================
// TAUX DE CHANGE
// ============================================
export function setExchangeRate(rate) {
    if (rate && rate > 0) {
        EXCHANGE_RATE = rate;
    }
    return EXCHANGE_RATE;
}

export function getExchangeRate() {
    return EXCHANGE_RATE;
}

// ============================================
// CONVERSIONS
// ============================================
export function toPi(amountFCFA) {
    if (!amountFCFA || amountFCFA <= 0) return 0;
    return amountFCFA / EXCHANGE_RATE;
}

export function toFCFA(amountPi) {
    if (!amountPi || amountPi <= 0) return 0;
    return amountPi * EXCHANGE_RATE;
}

// ============================================
// FORMATAGE
// ============================================
export function formatPi(amountPi) {
    if (!amountPi && amountPi !== 0) return '0 Pi';
    return `${amountPi.toFixed(2)} Pi`;
}

export function formatFCFA(amountFCFA) {
    if (!amountFCFA && amountFCFA !== 0) return '0 FCFA';
    try {
        return new Intl.NumberFormat('fr-BJ', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amountFCFA);
    } catch (e) {
        return `${amountFCFA} FCFA`;
    }
}

// ============================================
// MESSAGE WHATSAPP
// ============================================
export function generatePiPaymentMessage(productData, sellerData) {
    if (!productData) return 'Bonjour, je souhaite acheter votre produit.';
    
    const priceInPi = toPi(productData.price || 0).toFixed(2);
    const productName = productData.title || 'le produit';
    
    return `Bonjour 👋

Je souhaite acheter votre produit : "${productName}" sur Bénin Pi Market.

💰 Prix en Pi : ${priceInPi} Pi (soit ${formatFCFA(productData.price || 0)})

Je suis prêt(e) à effectuer le paiement en Crypto Pi. 
Pouvez-vous me confirmer votre adresse Pi pour le paiement ?

Merci 🙏`;
}

// ============================================
// VALIDATION POREFEUILLE PI
// ============================================
export function isValidPiWallet(address) {
    if (!address) return false;
    // Format Pi Wallet: G + 25 caractères alphanumériques
    return /^G[A-Z0-9]{25}$/.test(address.toUpperCase());
}

// ============================================
// LIEN WHATSAPP
// ============================================
export function getPiWhatsAppLink(sellerWhatsapp, productData) {
    if (!sellerWhatsapp) return '#';
    const message = generatePiPaymentMessage(productData);
    const phone = sellerWhatsapp.replace(/\s/g, '').replace(/^\+/, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// ============================================
// PRIX PI SUGGÉRÉ
// ============================================
export function suggestPiPrice(priceFCFA) {
    if (!priceFCFA || priceFCFA <= 0) return 0;
    const piPrice = toPi(priceFCFA);
    return Math.round(piPrice * 10) / 10;
}

// ============================================
// FORMATTER LE PRIX EN FCFA
// ============================================
export function formatFCFAPrice(price) {
    if (!price && price !== 0) return '0 FCFA';
    try {
        return new Intl.NumberFormat('fr-BJ', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    } catch (e) {
        return `${price} FCFA`;
    }
}

// ============================================
// AFFICHER LE PRIX EN PI ET FCFA
// ============================================
export function displayPriceInPiAndFCFA(priceFCFA) {
    if (!priceFCFA && priceFCFA !== 0) return { pi: '0 Pi', fcfa: '0 FCFA' };
    return {
        pi: formatPi(toPi(priceFCFA)),
        fcfa: formatFCFA(priceFCFA)
    };
}

// ============================================
// EXPORT PAR DÉFAUT
// ============================================
export default {
    setExchangeRate,
    getExchangeRate,
    toPi,
    toFCFA,
    formatPi,
    formatFCFA,
    generatePiPaymentMessage,
    isValidPiWallet,
    getPiWhatsAppLink,
    suggestPiPrice,
    formatFCFAPrice,
    displayPriceInPiAndFCFA
};