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
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    query,
    orderBy,
    where,
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
        const userRef = doc(db, 'fastreds.github.io', user.uid);
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
        const userRef = doc(db, 'fastreds.github.io', user.uid);
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
        const userRef = doc(db, 'fastreds.github.io', currentUser.uid);
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
            const userRef = doc(db, 'fastreds.github.io', currentUser.uid);
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


// ==================== NOTES FUNCTIONALITY ====================

// Notes Elements
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const addNoteBtn = document.getElementById('addNoteBtn');
const cancelEditNoteBtn = document.getElementById('cancelEditNoteBtn');
const notesContainer = document.getElementById('notesContainer');
const notesLoading = document.getElementById('notesLoading');

// Notes State
let currentEditingNoteId = null;

// Load Notes
async function loadNotes() {
    if (!currentUser) return;

    notesLoading.classList.remove('hidden');
    notesContainer.innerHTML = '';

    try {
        const notesRef = collection(db, 'fastreds.github.io.notas');
        const q = query(notesRef, where('userId', '==', currentUser.uid), orderBy('updatedAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            displayEmptyNotes();
        } else {
            querySnapshot.forEach((doc) => {
                const noteData = doc.data();
                const noteElement = createNoteElement(doc.id, noteData);
                notesContainer.appendChild(noteElement);
            });
        }
    } catch (error) {
        console.error('Error loading notes:', error);
        displayError('Error al cargar las notas');
    } finally {
        notesLoading.classList.add('hidden');
    }
}

// Display Empty Notes State
function displayEmptyNotes() {
    notesContainer.innerHTML = `
    <div class="notes-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
        <h3>No hay notas aún</h3>
        <p>Crea tu primera nota usando el formulario de arriba</p>
    </div>
    `;
}

// Create Note Element
function createNoteElement(id, noteData) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note-item';
    noteDiv.dataset.noteId = id;

    const date = noteData.updatedAt?.toDate() || new Date();
    const formattedDate = formatDate(date.toISOString());

    noteDiv.innerHTML = `
        <div class="note-header">
            <h3 class="note-title">${noteData.title || 'Sin título'}</h3>
            <div class="note-actions">
                <button class="note-btn edit-btn" onclick="editNote('${id}')" title="Editar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Editar
                </button>
                <button class="note-btn delete-btn" onclick="deleteNote('${id}')" title="Eliminar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Eliminar
                </button>
            </div>
        </div>
        <div class="note-content">${noteData.content || ''}</div>
        <div class="note-footer">
            <span class="note-date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                ${formattedDate}
            </span>
        </div>
    `;

    return noteDiv;
}

// Add/Update Note
addNoteBtn.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();

    if (!title && !content) {
        displayError('Por favor ingresa un título o contenido para la nota');
        return;
    }

    if (!currentUser) return;

    try {
        const noteData = {
            userId: currentUser.uid,
            title: title || 'Sin título',
            content: content,
            updatedAt: serverTimestamp()
        };

        if (currentEditingNoteId) {
            // Update existing note
            const noteRef = doc(db, 'fastreds.github.io.notas', currentEditingNoteId);
            await updateDoc(noteRef, noteData);
            showNotification('Nota actualizada correctamente', 'success');
            currentEditingNoteId = null;
            addNoteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Nota
            `;
            cancelEditNoteBtn.classList.add('hidden');
        } else {
            // Add new note
            noteData.createdAt = serverTimestamp();
            const notesRef = collection(db, 'fastreds.github.io.notas');
            await addDoc(notesRef, noteData);
            showNotification('Nota agregada correctamente', 'success');
        }

        noteTitle.value = '';
        noteContent.value = '';
        await loadNotes();
    } catch (error) {
        console.error('Error saving note:', error);
        displayError('Error al guardar la nota');
    }
});

// Edit Note (make function global)
window.editNote = async (noteId) => {
    if (!currentUser) return;

    try {
        const noteRef = doc(db, 'fastreds.github.io.notas', noteId);
        const noteDoc = await getDoc(noteRef);

        if (noteDoc.exists()) {
            const noteData = noteDoc.data();
            noteTitle.value = noteData.title || '';
            noteContent.value = noteData.content || '';
            currentEditingNoteId = noteId;

            addNoteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Actualizar Nota
            `;
            cancelEditNoteBtn.classList.remove('hidden');

            // Scroll to form
            noteTitle.focus();
            noteTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (error) {
        console.error('Error loading note for edit:', error);
        displayError('Error al cargar la nota');
    }
};

// Cancel Edit
cancelEditNoteBtn.addEventListener('click', () => {
    currentEditingNoteId = null;
    noteTitle.value = '';
    noteContent.value = '';
    addNoteBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Agregar Nota
    `;
    cancelEditNoteBtn.classList.add('hidden');
});

// Delete Note (make function global)
window.deleteNote = async (noteId) => {
    if (!currentUser) return;

    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
        return;
    }

    try {
        const noteRef = doc(db, 'fastreds.github.io.notas', noteId);
        await deleteDoc(noteRef);
        showNotification('Nota eliminada correctamente', 'success');
        await loadNotes();

        // Cancel edit if we're editing the deleted note
        if (currentEditingNoteId === noteId) {
            currentEditingNoteId = null;
            noteTitle.value = '';
            noteContent.value = '';
            addNoteBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Agregar Nota
            `;
            cancelEditNoteBtn.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error deleting note:', error);
        displayError('Error al eliminar la nota');
    }
};

// Load notes when user logs in
const originalShowDashboard = showDashboard;
showDashboard = function () {
    originalShowDashboard();
    loadNotes();
};

