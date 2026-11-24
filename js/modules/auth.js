import { registerUser, loginUser, logoutUser, onUserChanged } from '../services/firebase.js';

export function initAuth(onAuthReady) {
  const authBox = document.getElementById('auth-box');
  const userBar = document.getElementById('user-bar');
  const userEmailEl = document.getElementById('user-email');
  const logoutBtn = document.getElementById('logout-btn');
  const authForm = document.getElementById('auth-form');
  const authFeedback = document.getElementById('auth-feedback');
  const tabs = document.querySelectorAll('[data-auth-tab]');
  const submitBtn = document.getElementById('auth-submit');

  let mode = 'login';

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.authTab;
      tabs.forEach((t) => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      submitBtn.textContent = mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión';
      authFeedback.textContent = '';
    });
  });

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawIdentifier = document.getElementById('auth-email').value.trim().toLowerCase();
      const password = document.getElementById('auth-password').value;

        const parsed = parseIdentifier(rawIdentifier);
        if (!parsed) {
          showAuthFeedback(
            authFeedback,
            'Introduce un correo @gmail.com o un número de teléfono válido (9-15 dígitos).',
            'error'
          );
          return;
        }

        if (password.length < 6) {
          showAuthFeedback(authFeedback, 'La contraseña debe tener al menos 6 caracteres.', 'error');
          return;
        }

        submitBtn.disabled = true;
        try {
          if (mode === 'register') {
            await registerUser(parsed.authEmail, password, {
              email: parsed.type === 'gmail' ? parsed.value : null,
              phone: parsed.type === 'phone' ? parsed.value : null,
              authMethod: parsed.type
            });
            showAuthFeedback(authFeedback, '¡Cuenta creada y guardada! Ya puedes reservar tu cita.', 'success');
          } else {
            await loginUser(parsed.authEmail, password);
          }
          authForm.reset();
        } catch (err) {
          showAuthFeedback(authFeedback, mapAuthError(err.code), 'error');
        } finally {
          submitBtn.disabled = false;
        }
      });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => logoutUser());
  }

  onUserChanged((user) => {
    if (authBox && userBar) {
      authBox.hidden = Boolean(user);
      userBar.hidden = !user;
    }
    if (userEmailEl && user) {
      userEmailEl.textContent = user.email.endsWith('@phone.barbermaestro.app')
        ? user.email.split('@')[0]
        : user.email;
    }
    onAuthReady(user);
  });
}

function parseIdentifier(input) {
  if (input.endsWith('@gmail.com') && input.length > 10) {
    return { type: 'gmail', value: input, authEmail: input };
  }
  const digits = input.replace(/\D/g, '');
  if (/^\d{9,15}$/.test(digits)) {
    return { type: 'phone', value: digits, authEmail: `${digits}@phone.barbermaestro.app` };
  }
  return null;
}

function mapAuthError(code) {
  const messages = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese Gmail o teléfono.',
    'auth/invalid-credential': 'Datos o contraseña incorrectos.',
    'auth/user-not-found': 'No existe ninguna cuenta con esos datos.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.'
  };
  return messages[code] || 'Error de autenticación. Inténtalo de nuevo.';
}

function showAuthFeedback(el, msg, type) {
  if (!el) return;
  el.textContent = msg;
  el.className = `form__feedback form__feedback--${type}`;
}
