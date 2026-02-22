# Dashboard Personal con Firebase

Dashboard moderno y funcional para gestionar proyectos de GitHub y otros recursos importantes, con autenticación Firebase.

## 🚀 Características

### ✅ Implementadas
- **Autenticación Firebase**
  - Login/Registro con email y contraseña
  - Persistencia de sesión
  - Gestión segura de usuarios

- **Gestión de Proyectos GitHub**
  - Visualización de repositorios públicos
  - Visualización de repositorios privados (con token)
  - Información detallada: estrellas, forks, lenguaje, última actualización
  - Acceso directo a repositorios con un clic
  - Almacenamiento seguro de tokens en Firebase

- **Diseño Moderno**
  - Glassmorphism y efectos de blur
  - Gradientes vibrantes
  - Animaciones suaves y micro-interacciones
  - Diseño responsive
  - Modo oscuro por defecto

### 🔜 Próximamente
- Más cards para gestionar otros recursos
- Dashboard personalizable
- Estadísticas y analytics
- Notificaciones en tiempo real

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
- **APIs**: GitHub REST API v3
- **Diseño**: Custom CSS con variables CSS y animaciones

## 📋 Requisitos

1. **Firebase Project**: Ya configurado con las credenciales proporcionadas
2. **GitHub Personal Access Token** (opcional, para repos privados):
   - Ve a GitHub → Settings → Developer settings → Personal access tokens
   - Genera un token con permisos `repo`
   - Guárdalo en el dashboard

## 🚀 Uso

### Autenticación
1. Abre la aplicación
2. Inicia sesión o regístrate con email y contraseña

### Configurar GitHub
1. En el dashboard, localiza la card "Proyectos GitHub"
2. (Opcional) Ingresa tu GitHub Personal Access Token y haz clic en "Guardar"
3. Ingresa tu usuario de GitHub
4. Haz clic en "Cargar" para ver tus repositorios

### Navegar Repositorios
- Los repositorios se muestran ordenados por última actualización
- Haz clic en cualquier repositorio para abrirlo en GitHub
- Los repositorios privados se marcan con 🔒
- Los repositorios públicos se marcan con 🌐

## 🔒 Seguridad

### Credenciales de Firebase

Las credenciales de Firebase en `firebase-config.js` son **públicas por diseño**. Esto es completamente normal y seguro.

**¿Por qué?**
- Firebase está diseñado para aplicaciones web del lado del cliente
- Las API keys solo identifican tu proyecto, no otorgan acceso
- La seguridad real viene de las **Reglas de Firestore** y la **Autenticación**

### Protección de Datos

Tu dashboard está protegido por:
- ✅ **Reglas de Firestore**: Solo tú puedes ver tus datos
- ✅ **Autenticación**: Requiere email y contraseña
- ✅ **Dominios Autorizados**: Solo dominios específicos pueden usar el proyecto
- ✅ **Tokens Protegidos**: Los tokens de GitHub se almacenan de forma segura

### Más Información

Para entender completamente cómo está protegido tu dashboard, lee:
📖 **[SECURITY.md](SECURITY.md)** - Documentación completa de seguridad

## 📁 Estructura del Proyecto

```
fastreds.github.io/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos y sistema de diseño
├── app.js              # Lógica de la aplicación
├── firebase-config.js  # Configuración de Firebase
├── firestore.rules     # Reglas de seguridad de Firestore
├── .nojekyll           # Configuración para GitHub Pages
├── .gitignore          # Archivos a ignorar
├── README.md           # Documentación principal
├── SETUP.md            # Guía de configuración
├── DEPLOYMENT.md       # Guía de deployment
├── SECURITY.md         # Documentación de seguridad
└── CHECKLIST.md        # Checklist de deployment
```

## 🎨 Sistema de Diseño

### Paleta de Colores
- **Primario**: HSL(250, 80%, 60%) - Púrpura vibrante
- **Acento**: HSL(320, 70%, 60%) - Rosa/Magenta
- **Neutrales**: Escala de grises con tonos azulados

### Efectos Visuales
- Glassmorphism con `backdrop-filter: blur(20px)`
- Gradientes dinámicos en fondos y botones
- Animaciones de entrada con `slideUp` y `fadeIn`
- Hover effects con transformaciones suaves

## 🔧 Configuración de Firebase

El proyecto ya está configurado con:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDh2ACNSwZmVJMOtVXzEwjeqO_FsBPka6s",
  authDomain: "aid-server.firebaseapp.com",
  projectId: "aid-server",
  storageBucket: "aid-server.firebasestorage.app",
  messagingSenderId: "774408730433",
  appId: "1:774408730433:web:0862b438c6a531e37053c0"
};
```

### Reglas de Firestore

**Base de datos**: `default`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/default/documents {
    // Colección principal del dashboard
    match /fastreds.github.io/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

📖 Más información: [FIRESTORE-DATABASE.md](FIRESTORE-DATABASE.md)

## 📱 Responsive Design

El dashboard es completamente responsive:
- **Desktop**: Grid de 2 columnas para las cards
- **Tablet**: Grid adaptativo
- **Mobile**: Columna única, navbar apilado

## 🌐 Deploy en GitHub Pages

Este proyecto está diseñado específicamente para GitHub Pages:

### Deployment Rápido

```bash
git add .
git commit -m "Add Firebase dashboard with GitHub integration"
git push origin main
```

### Configuración en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main**, folder: **/ (root)**
5. **Save**

### Configuración en Firebase (CRÍTICO)

⚠️ **Antes de que funcione la autenticación**, debes:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona **aid-server**
3. **Authentication** → **Settings** → **Authorized domains**
4. Agrega: `fastreds.github.io`

### URL de Producción

Tu dashboard estará disponible en:
**https://fastreds.github.io**

### Guía Completa

Para instrucciones detalladas, troubleshooting y mejores prácticas, consulta:
📖 **[DEPLOYMENT.md](DEPLOYMENT.md)**

## 📝 Notas de Desarrollo

- El proyecto usa Firebase SDK v10.7.1 desde CDN
- No requiere build process ni dependencias npm
- Todos los módulos se cargan como ES6 modules
- Compatible con navegadores modernos (Chrome, Firefox, Safari, Edge)

## 🤝 Contribuciones

Este es un proyecto personal, pero las sugerencias son bienvenidas.

## 📄 Licencia

Proyecto personal - Todos los derechos reservados

---

**Desarrollado con ❤️ usando Firebase y GitHub API**
