# Instrucciones de Configuración Firebase

## 📋 Pasos para Configurar el Proyecto

### 1. Configurar Reglas de Firestore

Para proteger los datos de tus usuarios, debes configurar las reglas de seguridad en Firestore:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **aid-server**
3. En el menú lateral, ve a **Firestore Database**
4. **Importante**: Asegúrate de estar en la base de datos **"default"** (selector en la parte superior)
5. Haz clic en la pestaña **Reglas**
6. Copia y pega el contenido del archivo `firestore.rules`
7. Haz clic en **Publicar**

### 2. Habilitar Método de Autenticación

#### Email/Password
1. En Firebase Console, ve a **Authentication**
2. Haz clic en la pestaña **Sign-in method**
3. Habilita **Correo electrónico/contraseña**
4. Guarda los cambios

### 3. Configurar Dominio Autorizado (IMPORTANTE para GitHub Pages)

⚠️ **CRÍTICO**: Sin esto, la autenticación NO funcionará en GitHub Pages.

1. En Firebase Console, ve a **Authentication** → **Settings**
2. Desplázate hasta **Authorized domains**
3. Haz clic en **Add domain**
4. Agrega: `fastreds.github.io` (o tu dominio personalizado si tienes uno)
5. Asegúrate de que estos dominios estén en la lista:
   - `localhost` (para desarrollo local)
   - `fastreds.github.io` (para producción)
   - `127.0.0.1` (opcional, para desarrollo)

**Nota**: Después de hacer deploy, espera unos minutos para que los cambios de Firebase se propaguen.

### 4. Obtener GitHub Personal Access Token (Opcional)

Para ver repositorios privados:

1. Ve a [GitHub Settings](https://github.com/settings/tokens)
2. Haz clic en **Generate new token** → **Generate new token (classic)**
3. Dale un nombre descriptivo: "Dashboard Personal"
4. Selecciona el scope: **repo** (Full control of private repositories)
5. Haz clic en **Generate token**
6. **IMPORTANTE**: Copia el token inmediatamente (no podrás verlo de nuevo)
7. Guárdalo en el dashboard en la sección "Proyectos GitHub"

### 5. Estructura de Datos en Firestore

El dashboard creará automáticamente esta estructura:

```
fastreds.github.io/          # Colección principal del dashboard
  └── {userId}/              # Documento por usuario (ID de Firebase Auth)
      ├── email: string
      ├── displayName: string
      ├── photoURL: string
      ├── githubToken: string (opcional)
      ├── githubUsername: string (opcional)
      ├── lastLogin: timestamp
      └── updatedAt: timestamp
```

**Nota**: Cada usuario tiene su propio documento identificado por su `userId` de Firebase Authentication.

### 6. Verificar Configuración

1. Abre el dashboard: `file:///c:/Users/Marcos/Documents/GitHub/fastreds.github.io/index.html`
2. Intenta iniciar sesión con Google
3. Si funciona, verás el dashboard principal
4. Configura tu usuario de GitHub y token
5. Carga tus repositorios

### 7. Deploy a GitHub Pages

```bash
# En tu terminal, desde el directorio del proyecto:
git add .
git commit -m "Add Firebase dashboard with GitHub integration"
git push origin main
```

Luego:
1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main, folder: / (root)
5. Save

Tu dashboard estará disponible en: `https://fastreds.github.io`

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca compartas tu GitHub token** en código o repositorios públicos
2. El token se guarda de forma segura en Firestore
3. Solo tú puedes acceder a tus propios datos (gracias a las reglas de Firestore)
4. Usa contraseñas fuertes para la autenticación con email

### Revocar Acceso

Si necesitas revocar el acceso del token de GitHub:
1. Ve a [GitHub Tokens](https://github.com/settings/tokens)
2. Encuentra tu token
3. Haz clic en **Delete**
4. Genera uno nuevo si es necesario

## 🐛 Solución de Problemas

### Error: "Firebase: Error (auth/unauthorized-domain)"
- Asegúrate de agregar tu dominio en Firebase Console → Authentication → Settings → Authorized domains

### No se cargan los repositorios privados
- Verifica que tu token tenga el scope `repo`
- Asegúrate de haber guardado el token en el dashboard
- Revisa la consola del navegador para errores

### Error al guardar datos en Firestore
- Verifica que las reglas de Firestore estén publicadas correctamente
- Asegúrate de estar autenticado

## 📞 Soporte

Si encuentras algún problema:
1. Revisa la consola del navegador (F12)
2. Verifica la configuración de Firebase
3. Asegúrate de que todos los servicios estén habilitados

## 🎉 ¡Listo!

Tu dashboard personal está configurado y listo para usar. Disfruta gestionando tus proyectos de GitHub desde un solo lugar.
