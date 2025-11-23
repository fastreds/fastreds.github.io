# Configuración de Base de Datos Firestore

## 📊 Base de Datos: "default"

Este proyecto utiliza la base de datos **"default"** de Firestore.

### ¿Por qué especificar "default"?

Cuando tienes múltiples bases de datos en Firebase, es importante especificar cuál usar:

- **`{database}`**: Variable que coincide con cualquier base de datos
- **`default`**: Especifica explícitamente la base de datos "default"

### Estructura Completa

```
Firebase Project: aid-server
└── Firestore Database
    └── default                      ← Base de datos específica
        └── fastreds.github.io/      ← Colección del dashboard
            └── {userId}/            ← Documentos de usuarios
                ├── email
                ├── displayName
                ├── photoURL
                ├── githubToken
                ├── githubUsername
                ├── lastLogin
                └── updatedAt
```

## 🔒 Reglas de Seguridad

Las reglas en `firestore.rules` especifican explícitamente la base de datos "default":

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/default/documents {  // ← Especifica "default"
    match /fastreds.github.io/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Aplicar las Reglas

### En Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **aid-server**
3. En el menú lateral: **Firestore Database**
4. Asegúrate de estar en la base de datos **"default"** (selector en la parte superior)
5. Haz clic en la pestaña **Reglas**
6. Copia y pega el contenido de `firestore.rules`
7. Haz clic en **Publicar**

### Verificación:

Después de publicar, verifica que:
- ✅ Las reglas se aplicaron sin errores
- ✅ Estás viendo la base de datos "default"
- ✅ La colección `fastreds.github.io` aparecerá después del primer uso

## 📝 Código JavaScript

El código en `app.js` se conecta automáticamente a la base de datos "default":

```javascript
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(app);  // Usa "default" por defecto
```

Si necesitaras especificar otra base de datos, usarías:

```javascript
const db = getFirestore(app, 'otra-base-de-datos');
```

Pero en nuestro caso, usamos la configuración por defecto que apunta a "default".

## 🔍 Diferencias entre Bases de Datos

| Aspecto | `{database}` | `default` |
|---------|--------------|-----------|
| **Alcance** | Todas las bases de datos | Solo la base de datos "default" |
| **Uso** | Reglas genéricas | Reglas específicas |
| **Recomendado** | Cuando tienes una sola BD | Cuando tienes múltiples BDs |
| **Seguridad** | Menos específico | Más específico ✅ |

## ✅ Mejores Prácticas

1. **Especifica la base de datos** cuando tienes múltiples
2. **Usa "default"** para la base de datos principal
3. **Documenta** qué base de datos usa cada parte de tu aplicación
4. **Prueba las reglas** antes de publicarlas en producción

## 🎯 Resumen

- ✅ Usamos la base de datos **"default"**
- ✅ Las reglas especifican explícitamente `databases/default/documents`
- ✅ La colección es `fastreds.github.io`
- ✅ Cada usuario tiene su propio documento protegido

---

**Última actualización**: 2025-11-23
