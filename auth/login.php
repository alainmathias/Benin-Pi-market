<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mot de passe oublié - Bénin Pi Market</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="css/style.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { 500: '#1a73e8', 600: '#1557b0' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans min-h-screen flex flex-col">

    <header class="bg-white shadow-md sticky top-0 z-50">
        <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="index.html" class="flex items-center gap-3">
                <img src="images/logo.png" alt="Bénin Pi Market" class="h-12" onerror="this.style.display='none'">
                <span class="text-2xl font-bold text-primary-500">Bénin Pi Market</span>
            </a>
            <a href="connexion.html" class="text-gray-600 hover:text-primary-500 transition">
                <i class="fas fa-arrow-left mr-2"></i> Retour à la connexion
            </a>
        </nav>
    </header>

    <div class="flex-1 flex items-center justify-center py-12 px-4">
        <div class="bg-white rounded-2xl shadow-card max-w-md w-full p-8 animate-fade-in">
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-key text-3xl text-yellow-600"></i>
                </div>
                <h2 class="text-3xl font-bold text-dark">Mot de passe oublié</h2>
                <p class="text-gray-500 mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>
            </div>

            <div id="alert-container"></div>

            <form id="resetForm" class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-envelope text-primary-500 mr-2"></i> Email
                    </label>
                    <input type="email" id="email" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                           placeholder="votre@email.com"
                           required>
                </div>

                <button type="submit" id="resetBtn" 
                        class="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transition shadow-md hover:shadow-lg text-lg">
                    <i class="fas fa-paper-plane mr-2"></i> Envoyer le lien
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-gray-600">
                    <a href="connexion.html" class="text-primary-500 font-semibold hover:underline">
                        <i class="fas fa-arrow-left mr-1"></i> Retour à la connexion
                    </a>
                </p>
            </div>
        </div>
    </div>

    <footer class="bg-dark text-white py-6 mt-auto">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <p class="text-sm text-gray-400">&copy; 2026 Bénin Pi Market</p>
        </div>
    </footer>

    <script type="module">
        import { sendPasswordResetEmail, auth } from './js/firebase-config.js';
        import { showAlert } from './js/utils.js';

        document.getElementById('resetForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            
            if (!email) {
                showAlert('Veuillez entrer votre email.', 'danger');
                return;
            }

            const resetBtn = document.getElementById('resetBtn');
            const originalText = resetBtn.innerHTML;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Envoi en cours...';
            resetBtn.disabled = true;

            try {
                await sendPasswordResetEmail(auth, email);
                showAlert('✅ Un email de réinitialisation a été envoyé à ' + email, 'success');
                document.getElementById('email').value = '';
                
                setTimeout(() => {
                    window.location.href = 'connexion.html';
                }, 4000);
            } catch (error) {
                console.error('Erreur:', error);
                let message = 'Erreur lors de l\'envoi.';
                if (error.code === 'auth/user-not-found') {
                    message = 'Aucun compte trouvé avec cet email.';
                } else if (error.code === 'auth/invalid-email') {
                    message = 'Format d\'email invalide.';
                }
                showAlert('❌ ' + message, 'danger');
            }

            resetBtn.innerHTML = originalText;
            resetBtn.disabled = false;
        });
    </script>
</body>
</html>