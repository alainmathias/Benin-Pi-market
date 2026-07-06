<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Bénin Pi Market</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="../css/style.css">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: { 500: '#1a73e8', 600: '#1557b0' },
                        secondary: { 500: '#ff6b00' }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans min-h-screen flex flex-col">

    <header class="bg-white shadow-md sticky top-0 z-50">
        <nav class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="../index.html" class="flex items-center gap-3">
                <img src="../images/logo.png" alt="Bénin Pi Market" class="h-12" onerror="this.style.display='none'">
                <span class="text-2xl font-bold text-primary-500">Bénin Pi Market</span>
            </a>
            <div class="flex items-center gap-4">
                <a href="../index.html" class="text-gray-600 hover:text-primary-500 transition">
                    <i class="fas fa-home"></i> Accueil
                </a>
                <a href="register.html" class="bg-primary-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary-600 transition">
                    <i class="fas fa-user-plus mr-2"></i> S'inscrire
                </a>
            </div>
        </nav>
    </header>

    <div class="flex-1 flex items-center justify-center py-12 px-4">
        <div class="bg-white rounded-2xl shadow-card max-w-md w-full p-8 animate-fade-in">
            <div class="text-center mb-8">
                <div class="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-sign-in-alt text-3xl text-primary-500"></i>
                </div>
                <h2 class="text-3xl font-bold text-dark">Login</h2>
                <p class="text-gray-500 mt-2">Connectez-vous à votre compte</p>
            </div>

            <div id="alert-container"></div>

            <form id="loginForm" class="space-y-5">
                <div>
                    <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                        <i class="fas fa-envelope text-primary-500 mr-2"></i> Email or Phone
                    </label>
                    <input type="text" id="email" 
                           class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
                           placeholder="example@email.com or +229 XX XX XX XX" required>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-2">
                        <label for="password" class="block text-sm font-semibold text-gray-700">
                            <i class="fas fa-lock text-primary-500 mr-2"></i> Password
                        </label>
                        <a href="forgot-password.html" class="text-sm text-primary-500 hover:underline">
                            Forgot password ?
                        </a>
                    </div>
                    <div class="relative">
                        <input type="password" id="password" 
                               class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition pr-12"
                               placeholder="••••••••" required minlength="6">
                        <button type="button" id="togglePassword" 
                                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="rememberMe" class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500">
                        <span class="text-sm text-gray-600">Remember me</span>
                    </label>
                </div>

                <button type="submit" id="loginBtn" 
                        class="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold hover:bg-primary-600 transform hover:-translate-y-1 transition shadow-md hover:shadow-lg text-lg flex items-center justify-center gap-2">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </form>

            <div class="mt-8 text-center">
                <p class="text-gray-600">
                    Don't have an account ? 
                    <a href="register.html" class="text-primary-500 font-semibold hover:underline">
                        Create account
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
        import { auth, onAuthStateChanged } from '../js/firebase-config.js';
        import { login } from '../js/auth.js';
        import { showAlert } from '../js/utils.js';

        onAuthStateChanged(auth, (user) => {
            if (user) {
                window.location.href = '../dashboard/vendor.html';
            }
        });

        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.querySelector('i').classList.toggle('fa-eye');
            togglePassword.querySelector('i').classList.toggle('fa-eye-slash');
        });

        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            if (!emailInput || !password) {
                showAlert('Please fill in all fields.', 'danger');
                return;
            }

            let loginEmail = emailInput;
            if (emailInput.match(/^[\+\d\s\-]+$/)) {
                const phone = emailInput.replace(/\s/g, '').replace(/-/g, '');
                loginEmail = `${phone}@beninpimarket.com`;
            }

            const loginBtn = document.getElementById('loginBtn');
            const originalText = loginBtn.innerHTML;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Logging in...';
            loginBtn.disabled = true;

            const result = await login(loginEmail, password);

            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;

            if (result.success) {
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', emailInput);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
                showAlert('✅ ' + result.message, 'success');
                setTimeout(() => {
                    window.location.href = result.data?.role === 'admin' 
                        ? '../dashboard/admin.html' 
                        : '../dashboard/vendor.html';
                }, 1500);
            } else {
                showAlert('❌ ' + result.message, 'danger');
            }
        });

        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.getElementById('rememberMe').checked = true;
        }
    </script>
</body>
</html>