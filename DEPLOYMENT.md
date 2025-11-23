# Guía de Deployment en GitHub Pages

## 🚀 Pasos para Publicar tu Dashboard

### 1. Preparar el Repositorio

Asegúrate de que todos los archivos estén en el repositorio:

```bash
# Ver el estado de los archivos
git status

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit: Firebase dashboard with GitHub integration"

# Subir a GitHub
git push origin main
```

### 2. Configurar GitHub Pages

1. Ve a tu repositorio en GitHub: `https://github.com/fastreds/fastreds.github.io`
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, busca **Pages**
4. En **Source** (Fuente):
   - Branch: `main`
   - Folder: `/ (root)`
5. Haz clic en **Save**
6. Espera unos minutos mientras GitHub despliega tu sitio

### 3. Configurar Firebase para GitHub Pages

⚠️ **MUY IMPORTANTE**: Debes hacer esto ANTES de que funcione la autenticación.

#### En Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona el proyecto **aid-server**
3. Ve a **Authentication** → **Settings**
4. Desplázate hasta **Authorized domains**
5. Haz clic en **Add domain**
6. Agrega: `fastreds.github.io`
7. Ve a **Sign-in method** y habilita **Email/Password**
8. Guarda los cambios

### 4. Verificar el Deployment

1. Espera 2-5 minutos después de hacer push
2. Ve a: `https://fastreds.github.io`
3. Deberías ver tu dashboard
4. Intenta iniciar sesión con email y contraseña

### 5. Solución de Problemas

#### ❌ Error: "Firebase: Error (auth/unauthorized-domain)"

**Causa**: El dominio no está autorizado en Firebase.

**Solución**:
1. Ve a Firebase Console → Authentication → Settings → Authorized domains
2. Asegúrate de que `fastreds.github.io` esté en la lista
3. Espera 2-3 minutos y vuelve a intentar

#### ❌ La página no carga o muestra 404

**Causa**: GitHub Pages aún no ha desplegado el sitio.

**Solución**:
1. Ve a Settings → Pages en GitHub
2. Verifica que el deployment esté completo (aparecerá un mensaje verde)
3. Espera unos minutos más

#### ❌ Los estilos no se cargan correctamente

**Causa**: Rutas de archivos incorrectas.

**Solución**:
- Verifica que `styles.css` y `app.js` estén en la raíz del repositorio
- Los archivos deben estar en el mismo directorio que `index.html`

#### ❌ No se cargan los repositorios de GitHub

**Causa**: Problemas con el token o el usuario.

**Solución**:
1. Verifica que el token tenga el scope `repo`
2. Asegúrate de haber guardado el token en el dashboard
3. Verifica que el nombre de usuario sea correcto
4. Revisa la consola del navegador (F12) para ver errores específicos

### 6. Actualizar el Sitio

Cada vez que hagas cambios:

```bash
# Hacer cambios en los archivos
# Luego:

git add .
git commit -m "Descripción de los cambios"
git push origin main

# GitHub Pages se actualizará automáticamente en 1-2 minutos
```

### 7. Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio (ej: `dashboard.tudominio.com`):

#### En GitHub:
1. Settings → Pages → Custom domain
2. Ingresa tu dominio
3. Guarda

#### En tu proveedor de DNS:
1. Crea un registro CNAME apuntando a `fastreds.github.io`
2. O configura registros A con las IPs de GitHub:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

#### En Firebase:
1. Authentication → Settings → Authorized domains
2. Agrega tu dominio personalizado
3. Guarda

### 8. HTTPS

GitHub Pages proporciona HTTPS automáticamente:
- ✅ `https://fastreds.github.io` (seguro)
- ❌ `http://fastreds.github.io` (redirige a HTTPS)

Firebase solo funciona con HTTPS, así que esto es perfecto.

### 9. Monitoreo

Para ver el tráfico y uso:

#### GitHub:
- Ve a tu repositorio → Insights → Traffic
- Verás visitantes y clones

#### Firebase:
- Firebase Console → Authentication → Users
- Verás usuarios registrados y activos

### 10. Límites de GitHub Pages

- ✅ Repositorio: Máximo 1 GB
- ✅ Sitio publicado: Máximo 1 GB
- ✅ Ancho de banda: 100 GB/mes (soft limit)
- ✅ Builds: 10 por hora

Tu dashboard es muy ligero, así que no deberías tener problemas.

## 📋 Checklist de Deployment

Antes de considerar el deployment completo, verifica:

- [ ] Todos los archivos están en el repositorio
- [ ] El repositorio es público (o tienes GitHub Pro para Pages privadas)
- [ ] GitHub Pages está configurado (Settings → Pages)
- [ ] `fastreds.github.io` está en Authorized domains de Firebase
- [ ] Email/Password está habilitado en Firebase
- [ ] Las reglas de Firestore están publicadas
- [ ] El sitio carga correctamente en `https://fastreds.github.io`
- [ ] Puedes iniciar sesión con email/password
- [ ] Puedes cargar repositorios de GitHub

## 🎉 ¡Listo!

Tu dashboard está ahora disponible públicamente en:
**https://fastreds.github.io**

Comparte el link con quien quieras, pero recuerda que solo tú podrás ver tus datos gracias a las reglas de seguridad de Firebase.

## 🔄 Próximas Mejoras

Ideas para expandir tu dashboard:

1. **Más cards**: Agregar cards para otros servicios (Trello, Notion, etc.)
2. **Estadísticas**: Gráficos de actividad en GitHub
3. **Notificaciones**: Alertas de nuevos commits o issues
4. **Temas**: Modo claro/oscuro toggle
5. **Personalización**: Reordenar cards, cambiar colores
6. **PWA**: Convertir en Progressive Web App para instalación

---

**¿Necesitas ayuda?** Revisa la consola del navegador (F12) para ver errores específicos.
