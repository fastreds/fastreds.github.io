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

import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- State Management ---
const state = {
    user: null,
    repos: [],
    projects: [],
    view: 'dashboard',
    modals: {
        active: null
    }
};

// --- DOM Elements ---
const els = {
    authScreen: document.getElementById('authScreen'),
    appContainer: document.getElementById('appContainer'),
    authForm: document.getElementById('authForm'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    authTitle: document.getElementById('authTitle'),
    authBtnText: document.getElementById('authBtnText'),
    authToggleLink: document.getElementById('authToggleLink'),
    authError: document.getElementById('authError'),
    
    userName: document.getElementById('userName'),
    userAvatar: document.getElementById('userAvatar'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    navItems: document.querySelectorAll('.nav-item'),
    sections: document.querySelectorAll('.view-section'),
    
    ghUsername: document.getElementById('ghUsername'),
    ghToken: document.getElementById('ghToken'),
    saveGhConfig: document.getElementById('saveGhConfig'),
    loadReposBtn: document.getElementById('loadReposBtn'),
    projectsLoading: document.getElementById('projectsLoading'),
    projectsGrid: document.getElementById('projectsGrid'),
    
    vaultGrid: document.getElementById('vaultGrid'),
    notesGrid: document.getElementById('notesGrid'),
    
    modalOverlay: document.getElementById('modalOverlay'),
    closeModalBtns: document.querySelectorAll('.closeModalBtn'),
    
    openNewProjectModal: document.getElementById('openNewProjectModal'),
    projName: document.getElementById('projName'),
    projRepoSelect: document.getElementById('projRepoSelect'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    
    envVarsModal: document.getElementById('envVarsModal'),
    envVarsProjName: document.getElementById('envVarsProjName'),
    envVarsList: document.getElementById('envVarsList'),
    addEnvVarBtn: document.getElementById('addEnvVarBtn'),
    
    openNewSecretModal: document.getElementById('openNewSecretModal'),
    secretTitle: document.getElementById('secretTitle'),
    secretContent: document.getElementById('secretContent'),
    secretCategory: document.getElementById('secretCategory'),
    saveSecretBtn: document.getElementById('saveSecretBtn'),
    
    openNewNoteModal: document.getElementById('openNewNoteModal'),
    noteTitle: document.getElementById('noteTitle'),
    noteContent: document.getElementById('noteContent'),
    saveNoteBtn: document.getElementById('saveNoteBtn'),
    
    projCount: document.getElementById('projCount'),
    vaultCount: document.getElementById('vaultCount'),
    notesCount: document.getElementById('notesCount')
};

// --- Initialization ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        state.user = user;
        els.authScreen.classList.add('hidden');
        els.appContainer.classList.remove('hidden');
        await loadInitialData();
        setupDashboard();
    } else {
        state.user = null;
        els.authScreen.classList.remove('hidden');
        els.appContainer.classList.add('hidden');
    }
});

// --- Auth Functions ---
let isSignupMode = false;

els.authToggleLink.addEventListener('click', (e) => {
    e.preventDefault();
    isSignupMode = !isSignupMode;
    els.authTitle.textContent = isSignupMode ? 'Crear Cuenta' : 'Bienvenido';
    els.authBtnText.textContent = isSignupMode ? 'Registrarse' : 'Entrar';
    els.authToggleLink.textContent = isSignupMode ? 'Inicia Sesión' : 'Regístrate';
    document.getElementById('authToggleText').textContent = isSignupMode ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?';
});

els.authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = els.authEmail.value;
    const password = els.authPassword.value;
    els.authError.classList.add('hidden');

    try {
        if (isSignupMode) {
            await createUserWithEmailAndPassword(auth, email, password);
        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
    } catch (error) {
        els.authError.textContent = error.message;
        els.authError.classList.remove('hidden');
    }
});

els.logoutBtn.addEventListener('click', () => signOut(auth));

// --- Navigation ---
els.navItems.forEach(item => {
    item.addEventListener('click', () => {
        const view = item.dataset.view;
        if (!view) return; // For links like "Calculadora"
        
        els.navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        els.sections.forEach(s => s.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');
        state.view = view;
        
        loadViewData(view);
    });
});

// --- Modal Management ---
function openModal(modalId) {
    els.modalOverlay.classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
    state.modals.active = modalId;
}

function closeModal() {
    els.modalOverlay.classList.add('hidden');
    if (state.modals.active) {
        document.getElementById(state.modals.active).classList.add('hidden');
        state.modals.active = null;
    }
}

els.closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) closeModal();
});

// --- User & GitHub Config ---
async function loadInitialData() {
    const userRef = doc(db, 'fastreds.github.io', state.user.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
        const data = userDoc.data();
        els.userName.textContent = data.displayName || state.user.email.split('@')[0];
        els.userAvatar.src = data.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(els.userName.textContent)}&background=6366f1&color=fff`;
        els.ghUsername.value = data.githubUsername || '';
        els.ghToken.value = data.githubToken || '';
        
        if (data.githubUsername) {
            await fetchGitHubRepos(data.githubUsername, data.githubToken);
        }
    }
}

els.saveGhConfig.addEventListener('click', async () => {
    const userRef = doc(db, 'fastreds.github.io', state.user.uid);
    await setDoc(userRef, {
        githubUsername: els.ghUsername.value,
        githubToken: els.ghToken.value,
        updatedAt: serverTimestamp()
    }, { merge: true });
    showNotification('Configuración guardada', 'success');
});

els.loadReposBtn.addEventListener('click', () => fetchGitHubRepos(els.ghUsername.value, els.ghToken.value));

async function fetchGitHubRepos(username, token) {
    if (!username) return;
    els.projectsLoading.classList.remove('hidden');
    
    try {
        const headers = {'Accept': 'application/vnd.github.v3+json'};
        if (token) headers['Authorization'] = `token ${token}`;
        
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers });
        if (response.ok) {
            state.repos = await response.json();
            updateRepoSelect();
            if (state.view === 'projects') renderProjects();
        }
    } catch (e) {
        console.error('Error fetching repos:', e);
    } finally {
        els.projectsLoading.classList.add('hidden');
    }
}

function updateRepoSelect() {
    els.projRepoSelect.innerHTML = '<option value="">Ninguno</option>';
    state.repos.forEach(repo => {
        const opt = document.createElement('option');
        opt.value = repo.full_name;
        opt.textContent = repo.name;
        els.projRepoSelect.appendChild(opt);
    });
}

// --- Projects Logic ---
function setupDashboard() {
    // Initial counts
    updateCounts();
}

async function updateCounts() {
    // This is inefficient but keep it simple for now
    const projs = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'projects'));
    els.projCount.textContent = projs.size;
    
    const secrets = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'vault'));
    els.vaultCount.textContent = secrets.size;
    
    const notes = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'notes'));
    els.notesCount.textContent = notes.size;
}

els.openNewProjectModal.addEventListener('click', () => {
    els.projName.value = '';
    els.projRepoSelect.value = '';
    openModal('projectModal');
});

els.saveProjectBtn.addEventListener('click', async () => {
    const name = els.projName.value;
    const repo = els.projRepoSelect.value;
    if (!name) return;
    
    const projId = name.toLowerCase().replace(/ /g, '-');
    await setDoc(doc(db, 'fastreds.github.io', state.user.uid, 'projects', projId), {
        name,
        repo,
        createdAt: serverTimestamp()
    });
    
    closeModal();
    renderProjects();
    updateCounts();
});

async function renderProjects() {
    els.projectsGrid.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'projects'));
    
    querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card project-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${data.name}</span>
                <div class="item-actions">
                    <button class="btn btn-icon btn-secondary btn-small del-proj" data-id="${docSnap.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    <button class="btn btn-icon btn-primary btn-small edit-env" data-id="${docSnap.id}" data-name="${data.name}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                    </button>
                </div>
            </div>
            ${data.repo ? `<div class="badge badge-primary" style="margin-bottom: 12px; display: inline-block;">${data.repo}</div>` : ''}
            <div id="env-preview-${docSnap.id}" class="text-dim" style="font-size: 0.8rem;">Cargando variables...</div>
        `;
        els.projectsGrid.appendChild(card);
        
        loadEnvPreview(docSnap.id);
        
        card.querySelector('.edit-env').onclick = () => openEnvVars(docSnap.id, data.name);
        card.querySelector('.del-proj').onclick = async (e) => {
            e.stopPropagation();
            if(confirm('¿Eliminar proyecto y sus variables?')) {
                await deleteDoc(doc(db, 'fastreds.github.io', state.user.uid, 'projects', docSnap.id));
                renderProjects();
                updateCounts();
            }
        };
    });
}

async function loadEnvPreview(projId) {
    const envs = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'projects', projId, 'envVars'));
    const container = document.getElementById(`env-preview-${projId}`);
    if (envs.empty) {
        container.textContent = 'Sin variables configuradas';
    } else {
        container.textContent = `${envs.size} variables de entorno`;
    }
}

// --- Env Vars Logic ---
let currentProjId = null;

async function openEnvVars(projId, projName) {
    currentProjId = projId;
    els.envVarsProjName.textContent = projName;
    openModal('envVarsModal');
    renderEnvVars();
}

async function renderEnvVars() {
    els.envVarsList.innerHTML = '';
    const envs = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'projects', currentProjId, 'envVars'));
    
    envs.forEach(docSnap => {
        const data = docSnap.data();
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <div class="item-info">
                <div class="item-name">${data.key}</div>
                <div class="item-value">••••••••</div>
            </div>
            <div class="item-actions">
                <button class="btn btn-icon btn-secondary btn-small copy-btn" data-val="${data.value}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                </button>
                <button class="btn btn-icon btn-secondary btn-small del-env" data-id="${docSnap.id}">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `;
        els.envVarsList.appendChild(row);
        
        row.querySelector('.copy-btn').onclick = () => {
            navigator.clipboard.writeText(data.value);
            showNotification('Copiado al portapapeles', 'success');
        };
        row.querySelector('.del-env').onclick = async () => {
            await deleteDoc(doc(db, 'fastreds.github.io', state.user.uid, 'projects', currentProjId, 'envVars', docSnap.id));
            renderEnvVars();
        };
    });
}

els.addEnvVarBtn.addEventListener('click', async () => {
    const key = prompt('Nombre de la variable (ej. API_KEY):');
    if (!key) return;
    const value = prompt('Valor:');
    if (!value) return;
    
    await addDoc(collection(db, 'fastreds.github.io', state.user.uid, 'projects', currentProjId, 'envVars'), {
        key,
        value,
        createdAt: serverTimestamp()
    });
    renderEnvVars();
});

// --- Vault Logic ---
els.openNewSecretModal.addEventListener('click', () => {
    els.secretTitle.value = '';
    els.secretContent.value = '';
    els.secretCategory.value = '';
    openModal('secretModal');
});

els.saveSecretBtn.addEventListener('click', async () => {
    const title = els.secretTitle.value;
    const content = els.secretContent.value;
    const category = els.secretCategory.value || 'General';
    if (!title || !content) return;
    
    await addDoc(collection(db, 'fastreds.github.io', state.user.uid, 'vault'), {
        title,
        content,
        category,
        updatedAt: serverTimestamp()
    });
    
    closeModal();
    renderVault();
    updateCounts();
});

async function renderVault() {
    els.vaultGrid.innerHTML = '';
    const secrets = await getDocs(collection(db, 'fastreds.github.io', state.user.uid, 'vault'));
    
    secrets.forEach(docSnap => {
        const data = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card secret-card';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${data.title}</span>
                <span class="badge badge-success">${data.category}</span>
            </div>
            <div class="item-row" style="margin-top: 10px;">
                <code class="item-value">••••••••••••</code>
                <div class="item-actions">
                    <button class="btn btn-icon btn-secondary btn-small copy-secret">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button class="btn btn-icon btn-secondary btn-small del-secret">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </div>
        `;
        els.vaultGrid.appendChild(card);
        
        card.querySelector('.copy-secret').onclick = () => {
            navigator.clipboard.writeText(data.content);
            showNotification('Secreto copiado', 'success');
        };
        card.querySelector('.del-secret').onclick = async () => {
             if(confirm('¿Eliminar secreto?')) {
                await deleteDoc(doc(db, 'fastreds.github.io', state.user.uid, 'vault', docSnap.id));
                renderVault();
                updateCounts();
             }
        };
    });
}

// --- Notes Logic ---
els.openNewNoteModal.addEventListener('click', () => {
    els.noteTitle.value = '';
    els.noteContent.value = '';
    openModal('noteModal');
});

els.saveNoteBtn.addEventListener('click', async () => {
    const title = els.noteTitle.value || 'Sin título';
    const content = els.noteContent.value;
    if (!content) return;
    
    await addDoc(collection(db, 'fastreds.github.io', state.user.uid, 'notes'), {
        title,
        content,
        updatedAt: serverTimestamp()
    });
    
    closeModal();
    renderNotes();
    updateCounts();
});

async function renderNotes() {
    els.notesGrid.innerHTML = '';
    const notes = await getDocs(query(collection(db, 'fastreds.github.io', state.user.uid, 'notes'), orderBy('updatedAt', 'desc')));
    
    notes.forEach(docSnap => {
        const data = docSnap.data();
        const card = document.createElement('div');
        card.className = 'card note-card';
        card.style.cursor = 'pointer';
        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${data.title}</span>
                <button class="btn btn-icon btn-secondary btn-small del-note" style="width: 24px; height: 24px;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
            <p class="text-dim" style="font-size: 0.85rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                ${data.content}
            </p>
        `;
        els.notesGrid.appendChild(card);
        
        card.onclick = (e) => {
            if (e.target.closest('.del-note')) return;
            els.noteTitle.value = data.title;
            els.noteContent.value = data.content;
            openModal('noteModal');
        };
        
        card.querySelector('.del-note').onclick = async (e) => {
            e.stopPropagation();
            if(confirm('¿Eliminar nota?')) {
                await deleteDoc(doc(db, 'fastreds.github.io', state.user.uid, 'notes', docSnap.id));
                renderNotes();
                updateCounts();
            }
        };
    });
}

// --- Global Helpers ---
function loadViewData(view) {
    if (view === 'dashboard') updateCounts();
    if (view === 'projects') renderProjects();
    if (view === 'vault') renderVault();
    if (view === 'notes') renderNotes();
}

function showNotification(message, type = 'info') {
    const n = document.createElement('div');
    n.className = `badge badge-${type}`;
    n.style.cssText = `position: fixed; top: 20px; right: 20px; z-index: 3000; padding: 12px 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); animation: slideIn 0.3s ease;`;
    n.innerHTML = `<div style="display:flex; align-items:center; gap:8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        ${message}
    </div>`;
    document.body.appendChild(n);
    setTimeout(() => {
        n.style.opacity = '0';
        n.style.transform = 'translateX(20px)';
        n.style.transition = '0.3s';
        setTimeout(() => n.remove(), 300);
    }, 2000);
}

// Add animation styles dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;
document.head.appendChild(style);
