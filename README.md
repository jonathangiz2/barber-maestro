# ✂ BARBER MAESTRO — Web & Sistema de Reservas

Página web profesional, moderna y 100% responsive para la barbería **BARBER MAESTRO** (Cartagena, Murcia, España). Diseñada con estética premium en negro, dorado y detalles metálicos, arquitectura modular y sistema de reservas automáticas en tiempo real.

---

## ✨ ¿Qué incluye la página?

- **Página principal (Hero)**: Presentación de marca (*«Tu estilo, nuestro trabajo»*) con acceso directo a reservas y tarifas.
- **Nuestros Servicios**: Tarjetas interactivas con precio, duración (30 min) y botón directo que preselecciona el servicio en el formulario.
- **Sistema de Reservas Automáticas y Cuentas**:
  - **Registro / Inicio de sesión obligatorio** con Gmail (`@gmail.com`, sin duplicados) y contraseña (mínimo 6 caracteres) mediante **Firebase Authentication**.
  - Muestra la fecha de hoy por defecto y diferencia visualmente entre horarios **Disponibles** y **Ocupados**.
  - Valida el teléfono (solo dígitos, 9–15 caracteres).
  - **Cancelación limpia de citas**: Los clientes pueden ver sus citas en *Mis Citas* y cancelarlas hasta **2 horas antes** de la hora reservada (liberando el hueco automáticamente). Si falta menos tiempo, deben avisar por WhatsApp para no perjudicar a la barbería.
  - Sincronización opcional con **Google Calendar** mediante Netlify Functions.
- **Galería de trabajos**: Imágenes optimizadas con carga diferida (`loading="lazy"`).
- **Horarios y Ubicación**: Lista visual de horarios (resaltando el día actual), botón a **Google Maps** y botón de **WhatsApp** exclusivo para consultas.

---

## 🗂 Estructura del proyecto

```text
Barberia/
├── index.html                      # Estructura principal HTML5
├── netlify.toml                    # Configuración de despliegue y funciones en Netlify
├── .env.example                    # Plantilla de variables de entorno
├── data/
│   └── barberia.json               # Servicios, horarios e imágenes de la galería
├── css/
│   ├── main.css                    # Importación de módulos CSS
│   ├── variables.css               # Colores, tipografías y espaciados
│   ├── base.css                    # Reset y estilos globales
│   ├── layout.css                  # Header, menú móvil, grids y breakpoints
│   └── components.css              # Hero, tarjetas, calendario, galería y footer
├── js/
│   ├── main.js                     # Punto de entrada
│   ├── modules/
│   │   ├── navigation.js           # Menú hamburguesa y enlaces activos
│   │   ├── renderer.js             # Renderizado dinámico desde barberia.json
│   │   └── booking.js              # Lógica de horarios, validación y reservas
│   └── services/
│       └── firebase.js             # Conexión con Firebase Realtime Database
└── netlify/functions/
    └── book-calendar.js            # Función serverless para Google Calendar
```

---

## 🔥 Cómo conseguir la API de Firebase y configurar `.env`

1. Entra en [Firebase Console](https://console.firebase.google.com/) y crea un proyecto (o abre el existente).
2. En el menú lateral, ve a **Compilación → Authentication → Método de inicio de sesión** y activa **Correo electrónico/contraseña**.
3. Ve a **Compilación → Realtime Database** y pulsa **Crear base de datos** (elige la región `europe-west1` si estás en España).
3. Ve a **Configuración del proyecto** (icono de engranaje) → **Tus apps** → añade una app **Web (`</>`)**.
4. Copia los valores de `firebaseConfig`.
5. Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://tu_proyecto-default-rtdb.europe-west1.firebasedatabase.app/
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Opcional: Google Calendar (para Netlify Functions)
GOOGLE_CALENDAR_ID=primary
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

> **Nota**: Si despliegas en **Netlify**, añade estas mismas variables en **Site configuration → Environment variables**.

---

## 🔒 Reglas recomendadas para Firebase Realtime Database

En **Realtime Database → Reglas**, pega estas reglas para permitir:
- Leer qué horas están ocupadas.
- Guardar el perfil de cada usuario en `users/{uid}`.
- Crear reservas con estado `paid: false` y cancelar solo **sus propias** citas.

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "bookings": {
      "$date": {
        ".read": true,
        "$time": {
          ".write": "auth != null && ((!data.exists() && newData.child('userId').val() == auth.uid && newData.hasChildren(['service', 'name', 'phone', 'date', 'time', 'userId', 'paid'])) || (data.exists() && data.child('userId').val() == auth.uid && !newData.exists()))"
        }
      }
    }
  }
}
```

---

## 📲 Cómo añadir verificación por SMS o WhatsApp al crear cuenta

Si quieres que el cliente reciba un código de verificación antes de activar su cuenta:

### Opción A: Verificación por SMS (Gratuita con Firebase Phone Auth)
1. En **Firebase Console → Authentication → Método de inicio de sesión**, activa **Teléfono**.
2. Añade el dominio de tu web (por ejemplo `tu-web.netlify.app`) en **Configuración → Dominios autorizados**.
3. En el frontend, usa `RecaptchaVerifier` y `signInWithPhoneNumber(auth, '+34' + telefono, recaptcha)` de `firebase-auth.js` para enviar el SMS y confirmar el código de 6 dígitos.

### Opción B: Verificación por WhatsApp (Netlify Functions + WhatsApp Cloud API)
1. Crea una app en [Meta for Developers](https://developers.facebook.com/) y activa **WhatsApp Business Cloud API** (tiene 1.000 conversaciones gratuitas al mes).
2. Crea una función en `netlify/functions/send-whatsapp-code.js` que envíe un código de 6 dígitos al número del cliente usando tu `WHATSAPP_TOKEN` y `PHONE_NUMBER_ID` en `.env`.
3. Guarda el código temporal en Firebase (`verifications/{phone}`) y valídalo antes de llamar a `registerUser()`.

---

## 🛠 Cómo personalizar la página

### 1. Cambiar cortes, precios, horarios o fotos
Edita únicamente el archivo `data/barberia.json`:
- **`services`**: Añade, edita o elimina servicios (`name`, `price`, `duration`, `description`).
- **`hours`**: Modifica los tramos horarios de cada día (`0` = Domingo, `1` = Lunes ... `6` = Sábado).
- **`gallery`**: Cambia las URLs o rutas locales de las fotografías.

### 2. Cambiar colores o tipografía
Edita `css/variables.css` (por ejemplo `--color-primary` para el dorado o `--color-bg` para el fondo).

### 3. Cambiar enlaces de Maps o WhatsApp
Edita los enlaces en la sección `#contacto` dentro de `index.html`.

---

## 🚀 Cómo usar y probar la página

1. **En local**: Como utiliza módulos ES6 (`type="module"`) y `fetch` para leer `data/barberia.json`, ábrelo con un servidor local (por ejemplo, la extensión **Live Server** en VS Code o `npx serve`).
2. **En producción (Netlify)**: Sube el repositorio a GitHub y conéctalo con **Netlify**. La web se publicará automáticamente sin necesidad de paso de compilación.
