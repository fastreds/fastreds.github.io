// Firebase Configuration
// NOTA IMPORTANTE: Estas credenciales son públicas por diseño de Firebase.
// La seguridad de tu aplicación NO depende de ocultar estas keys.
// La seguridad real viene de:
// 1. Las reglas de Firestore (firestore.rules)
// 2. La autenticación de usuarios
// 3. Las configuraciones de seguridad en Firebase Console

export const firebaseConfig = {
    apiKey: "AIzaSyDh2ACNSwZmVJMOtVXzEwjeqO_FsBPka6s",
    authDomain: "aid-server.firebaseapp.com",
    projectId: "aid-server",
    storageBucket: "aid-server.firebasestorage.app",
    messagingSenderId: "774408730433",
    appId: "1:774408730433:web:0862b438c6a531e37053c0"
};

// Información adicional sobre seguridad:
// - Las API keys de Firebase son seguras para uso público
// - Están diseñadas para ser incluidas en aplicaciones web del lado del cliente
// - Firebase usa las reglas de seguridad para proteger tus datos
// - Más info: https://firebase.google.com/docs/projects/api-keys
