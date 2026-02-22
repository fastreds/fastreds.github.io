# FastReds Hub | System Hub & Secure Vault

Un centro de comando moderno y seguro para desarrolladores, diseñado para la gestión rápida de proyectos, secretos y documentación técnica.

## 🚀 Características Principales

### 🏛️ Centro de Control (Dashboard)
- Vista general de todos tus recursos gestionados.
- Contadores dinámicos de proyectos, secretos y notas.
- Configuración rápida de GitHub a nivel global.

### 📁 Gestión de Proyectos
- Vinculación inteligente con repositorios de GitHub.
- Creación de proyectos locales o externos.
- **Variables de Entorno**: Almacenamiento seguro de llaves de API y configuraciones (Masked UI).
- Sistema de copiado rápido al portapapeles.

### 🔐 Bóveda de Secretos (Secure Vault)
- Almacenamiento centralizado para claves maestras, contraseñas y accesos sensibles.
- Categorización personalizada (ej. Producción, Testing, Personal).
- Protección de visibilidad por defecto.

### 📝 Notas y Documentación
- Editor ligero para pensamientos rápidos y guías técnicas.
- Organización por fecha de actualización.
- Vista previa optimizada.

## 🎨 Diseño de Vanguardia
- **Cyber-Modern Aesthetic**: Tema oscuro profundo con acentos en índigo y esmeralda.
- **Glassmorphism 2.0**: Uso avanzado de `backdrop-filter`, desenfoques y gradientes de borde.
- **Micro-interacciones**: Transiciones fluidas, animaciones de entrada y estados de hover premium.
- **Sidebar Navigation**: Layout profesional inspirado en herramientas de productividad de alto nivel.

## 🛠️ Tecnologías
- **Frontend**: Vanilla JS (ES6+), Modern CSS (CSS Variable System), HTML5 Semantic.
- **Backend**: Firebase 10.7.1
  - **Auth**: Gestión robusta de sesiones.
  - **Firestore**: Base de datos NoSQL con estructura jerárquica por usuario.
  - **Rules**: Seguridad de nivel granular para aislamiento total de datos.

## 📋 Configuración Inicial

1. **Firebase**: Asegúrate de tener tu proyecto en la consola de Firebase.
2. **Authorized Domains**: Agrega `fastreds.github.io` en la configuración de Authentication de Firebase.
3. **GitHub Token**: Genera un Personal Access Token con permisos `repo` para gestionar tus repositorios privados.

## 🔒 Arquitectura de Seguridad
- **Aislamiento Total**: Cada usuario tiene su propia rama de datos inaccesible para otros.
- **Cero Placeholders**: Todos los componentes son funcionales y persistentes.
- **Transmisión Segura**: Uso de Firebase SDK sobre HTTPS para todas las operaciones.

---
**Desarrollado para la máxima eficiencia y seguridad.** 
