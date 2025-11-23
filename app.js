// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Import Firebase configuration
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const emailLoginForm = document.getElementById('emailLoginForm');
const toggleSignupLink = document.getElementById('toggleSignup');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');

// GitHub Elements
const githubToken = document.getElementById('githubToken');
const githubUsername = document.getElementById('githubUsername');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const loadReposBtn = document.getElementById('loadReposBtn');
const reposContainer = document.getElementById('reposContainer');
const reposLoading = document.getElementById('reposLoading');

// State
let isSignupMode = false;
let currentUser = null;

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        await loadUserData(user);
        showDashboard();
    } else {
        currentUser = null;
        showLogin();
    }
});

// Show/Hide Screens
function showLogin() {
    loginScreen.classList.add('active');
    dashboardScreen.classList.remove('active');
}

function showDashboard() {
    loginScreen.classList.remove('active');
    dashboardScreen.classList.add('active');
}

// Display Error
function displayError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
    setTimeout(() => {
        authError.classList.add('hidden');
    }, 5000);
}

// Email/Password Login/Signup
emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        let result;
        if (isSignupMode) {
            result = await createUserWithEmailAndPassword(auth, email, password);
            await saveUserData(result.user);
        } else {
            result = await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        let errorMessage = 'Error en la autenticación. Intenta de nuevo.';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuario no encontrado. ¿Quieres registrarte?';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Contraseña incorrecta.';
        } else if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email ya está registrado.';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
        }

        displayError(errorMessage);
    }
});

// Toggle Signup/Login
toggleSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignupMode = !isSignupMode;

    const submitBtn = emailLoginForm.querySelector('button[type="submit"]');
    submitBtn.textContent = isSignupMode ? 'Registrarse' : 'Iniciar Sesión';
    toggleSignupLink.textContent = isSignupMode ? 'Iniciar Sesión' : 'Regístrate';

    const toggleText = document.querySelector('.toggle-auth');
    toggleText.childNodes[0].textContent = isSignupMode ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? ';
});

// Logout
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
});

// Save User Data to Firestore
async function saveUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=7877c6&color=fff`,
            lastLogin: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Error guardando datos del usuario:', error);
    }
}

// Load User Data
async function loadUserData(user) {
    try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            userName.textContent = userData.displayName;
            userAvatar.src = userData.photoURL;

            // Load GitHub token if exists
            if (userData.githubToken) {
                githubToken.value = userData.githubToken;
            }
            if (userData.githubUsername) {
                githubUsername.value = userData.githubUsername;
            }
        } else {
            userName.textContent = user.email.split('@')[0];
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=7877c6&color=fff`;
        }
    } catch (error) {
        console.error('Error cargando datos del usuario:', error);
    }
}

// Save GitHub Token
saveTokenBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const token = githubToken.value.trim();
    if (!token) {
        displayError('Por favor ingresa un token válido');
        return;
    }

    try {
        const userRef = doc(db, 'users', currentUser.uid);
        await setDoc(userRef, {
            githubToken: token,
            updatedAt: serverTimestamp()
        }, { merge: true });

        showNotification('Token guardado correctamente', 'success');
    } catch (error) {
        console.error('Error guardando token:', error);
        displayError('Error al guardar el token');
    }
});

// Load GitHub Repositories
loadReposBtn.addEventListener('click', async () => {
    const username = githubUsername.value.trim();
    const token = githubToken.value.trim();

    if (!username) {
        displayError('Por favor ingresa un nombre de usuario de GitHub');
        return;
    }

    // Save username to Firestore
    if (currentUser) {
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                githubUsername: username,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error guardando username:', error);
        }
    }

    await loadRepositories(username, token);
});

// Fetch and Display Repositories
async function loadRepositories(username, token) {
    reposLoading.classList.remove('hidden');
    reposContainer.innerHTML = '';

    try {
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
            headers
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const repos = await response.json();

        if (repos.length === 0) {
            reposContainer.innerHTML = '<p style="text-align: center; color: var(--gray-400);">No se encontraron repositorios</p>';
            return;
        }

        repos.forEach(repo => {
            const repoElement = createRepoElement(repo);
            reposContainer.appendChild(repoElement);
        });

        showNotification(`${repos.length} repositorios cargados`, 'success');
    } catch (error) {
        console.error('Error cargando repositorios:', error);
        displayError('Error al cargar los repositorios. Verifica el usuario y el token.');
    } finally {
        reposLoading.classList.add('hidden');
    }
}

// Create Repository Element
function createRepoElement(repo) {
    const div = document.createElement('div');
    div.className = 'repo-item';
    div.onclick = () => window.open(repo.html_url, '_blank');

    const visibilityClass = repo.private ? 'private' : 'public';
    const visibilityIcon = repo.private ? '🔒' : '🌐';

    div.innerHTML = `
        <div class="repo-header">
            <div class="repo-name">${repo.name}</div>
            <div class="repo-visibility ${visibilityClass}">
                ${visibilityIcon} ${repo.private ? 'Privado' : 'Público'}
            </div>
        </div>
        ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
        <div class="repo-stats">
            <div class="repo-stat">
                <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"/>
                </svg>
                ${repo.stargazers_count}
            </div>
            <div class="repo-stat">
                <svg viewBox="0 0 16 16" fill="currentColor">
                    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a2.25 2.25 0 01-2.25 2.25h-1.5v2.128a2.251 2.251 0 11-1.5 0V8.5h-1.5A2.25 2.25 0 013 6.25v-.878a2.25 2.25 0 111.5 0zM5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm6.75.75a.75.75 0 100-1.5.75.75 0 000 1.5zm-3 8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"/>
                </svg>
                ${repo.forks_count}
            </div>
            ${repo.language ? `
                <div class="repo-stat">
                    <span style="width: 12px; height: 12px; border-radius: 50%; background: ${getLanguageColor(repo.language)}; display: inline-block;"></span>
                    ${repo.language}
                </div>
            ` : ''}
            <div class="repo-stat">
                📅 ${formatDate(repo.updated_at)}
            </div>
        </div>
    `;

    return div;
}

// Get Language Color
function getLanguageColor(language) {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C#': '#178600',
        'PHP': '#4F5D95',
        'Ruby': '#701516',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'Swift': '#ffac45',
        'Kotlin': '#F18E33',
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'Vue': '#41b883',
        'React': '#61dafb'
    };
    return colors[language] || '#8b949e';
}

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
    return `Hace ${Math.floor(diffDays / 365)} años`;
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'};
        border: 1px solid ${type === 'success' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(59, 130, 246, 0.5)'};
        color: ${type === 'success' ? '#86efac' : '#93c5fd'};
        border-radius: 0.75rem;
        backdrop-filter: blur(20px);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-size: 0.9rem;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
