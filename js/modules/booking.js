import {
  getBookedSlots,
  saveBooking,
  getCurrentUser,
  getUserBookings,
  cancelBooking
} from '../services/firebase.js';

const SLOT_DURATION = 30;
const CANCEL_MIN_HOURS = 2;

export function initBooking(services, openingHours) {
  const form = document.getElementById('booking-form');
  const serviceSelect = document.getElementById('booking-service');
  const dateInput = document.getElementById('booking-date');
  const timeInput = document.getElementById('booking-time');
  const phoneInput = document.getElementById('client-phone');
  const slotsContainer = document.getElementById('slots-container');
  const feedback = document.getElementById('booking-feedback');
  const submitBtn = document.getElementById('booking-submit');

  if (!form || !serviceSelect || !dateInput || !slotsContainer) return;

  serviceSelect.innerHTML = services
    .map((s) => `<option value="${s.id}">${s.name} — ${s.price}</option>`)
    .join('');

  const todayStr = new Date().toISOString().split('T')[0];
  dateInput.min = todayStr;
  dateInput.value = todayStr;

  loadSlots(todayStr, openingHours, slotsContainer, timeInput);

  dateInput.addEventListener('change', () => {
    timeInput.value = '';
    loadSlots(dateInput.value, openingHours, slotsContainer, timeInput);
  });

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 15);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    if (!user) {
      showFeedback(feedback, 'Debes iniciar sesión con tu Gmail para reservar.', 'error');
      return;
    }

    const date = dateInput.value;
    const time = timeInput.value;
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const name = document.getElementById('client-name').value.trim();
    const phone = phoneInput ? phoneInput.value.trim() : '';

    if (!time) {
      showFeedback(feedback, 'Por favor, selecciona una hora disponible.', 'error');
      return;
    }

    if (!/^\d{9,15}$/.test(phone)) {
      showFeedback(feedback, 'Introduce un número de teléfono válido (solo dígitos, mínimo 9).', 'error');
      phoneInput?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirmando...';

    try {
      await saveBooking({
        date,
        time,
        service,
        name,
        phone,
        userId: user.uid,
        userEmail: user.email
      });
      await syncGoogleCalendar({ date, time, service, name, phone });

      showFeedback(
        feedback,
        `¡Reserva confirmada, ${name}! Te esperamos el ${date} a las ${time} (${service}).`,
        'success'
      );
      form.reset();
      dateInput.value = date;
      timeInput.value = '';
      loadSlots(date, openingHours, slotsContainer, timeInput);
      refreshUserBookings(user.uid, openingHours);
    } catch (err) {
      if (err.message === 'SLOT_TAKEN') {
        showFeedback(feedback, 'Ese horario acaba de ser reservado. Elige otro disponible.', 'error');
        loadSlots(date, openingHours, slotsContainer, timeInput);
      } else {
        showFeedback(feedback, 'Error al guardar la reserva. Inténtalo de nuevo.', 'error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmar Reserva Automática';
    }
  });
}

export function setBookingAuthState(user, openingHours) {
  const form = document.getElementById('booking-form');
  const myBookingsBox = document.getElementById('my-bookings-box');
  const authNotice = document.getElementById('booking-auth-notice');
  if (!form || !myBookingsBox) return;

  form.hidden = !user;
  myBookingsBox.hidden = !user;
  if (authNotice) {
    authNotice.hidden = Boolean(user);
  }

  if (user) {
    refreshUserBookings(user.uid, openingHours);
  }
}

async function refreshUserBookings(userId, openingHours) {
  const listEl = document.getElementById('my-bookings-list');
  if (!listEl) return;

  listEl.innerHTML = '<p class="slots-placeholder">Cargando tus citas...</p>';

  try {
    const bookings = await getUserBookings(userId);
    const now = new Date();
    const upcoming = bookings.filter((b) => new Date(`${b.date}T${b.time}:00`) >= now);

    if (upcoming.length === 0) {
      listEl.innerHTML = '<p class="slots-placeholder">No tienes citas próximas.</p>';
      return;
    }

    listEl.innerHTML = upcoming
      .map((b) => {
        const apptDate = new Date(`${b.date}T${b.time}:00`);
        const hoursDiff = (apptDate - now) / (1000 * 60 * 60);
        const canCancel = hoursDiff >= CANCEL_MIN_HOURS;

        return `
          <div class="booking-item">
            <div class="booking-item__info">
              <strong>${b.date} a las ${b.time}</strong>
              <span>${b.service} • ${b.paid ? 'Pagado' : 'Pendiente de pago'}</span>
            </div>
            ${canCancel
            ? `<button type="button" class="btn btn--outline btn--sm" data-cancel-date="${b.date}" data-cancel-time="${b.time}">Cancelar cita</button>`
            : `<span class="booking-item__locked">Menos de 2h (avisar por WhatsApp)</span>`
          }
          </div>
        `;
      })
      .join('');

    listEl.querySelectorAll('[data-cancel-date]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Cancelando...';
        await cancelBooking(btn.dataset.cancelDate, btn.dataset.cancelTime);
        await refreshUserBookings(userId, openingHours);
        const dateInput = document.getElementById('booking-date');
        const slotsContainer = document.getElementById('slots-container');
        const timeInput = document.getElementById('booking-time');
        if (dateInput && slotsContainer) {
          loadSlots(dateInput.value, openingHours, slotsContainer, timeInput);
        }
      });
    });
  } catch {
    listEl.innerHTML = '<p class="slots-placeholder">No se pudieron cargar tus citas.</p>';
  }
}

async function loadSlots(dateStr, openingHours, container, timeInput) {
  if (!dateStr) return;
  container.innerHTML = '<p class="slots-placeholder">Cargando horarios...</p>';

  const [year, month, day] = dateStr.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay();
  const schedule = openingHours[String(dayOfWeek)];

  if (!schedule) {
    container.innerHTML = '<p class="slots-placeholder">Cerrado en esta fecha.</p>';
    return;
  }

  const allSlots = generateSlotsForRanges(schedule.ranges);
  let bookedSlots = [];

  try {
    bookedSlots = await getBookedSlots(dateStr);
  } catch {
    bookedSlots = [];
  }

  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const visibleSlots = allSlots.filter((slot) => !(isToday && toMinutes(slot) <= currentMinutes));

  if (visibleSlots.length === 0) {
    container.innerHTML = '<p class="slots-placeholder">No quedan horarios para hoy. Prueba otra fecha.</p>';
    return;
  }

  container.innerHTML = visibleSlots
    .map((slot) => {
      const isOccupied = bookedSlots.includes(slot);
      if (isOccupied) {
        return `<button type="button" class="slot-btn slot-btn--occupied" disabled title="Horario ocupado">${slot}<span>Ocupado</span></button>`;
      }
      return `<button type="button" class="slot-btn" data-time="${slot}">${slot}</button>`;
    })
    .join('');

  container.querySelectorAll('.slot-btn:not([disabled])').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.slot-btn').forEach((b) => b.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      timeInput.value = btn.dataset.time;
    });
  });
}

function generateSlotsForRanges(ranges) {
  const slots = [];
  for (const [start, end] of ranges) {
    let current = toMinutes(start);
    const endMin = toMinutes(end);
    while (current + SLOT_DURATION <= endMin) {
      slots.push(toTimeString(current));
      current += SLOT_DURATION;
    }
  }
  return slots;
}

function toMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function toTimeString(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

async function syncGoogleCalendar(booking) {
  try {
    await fetch('/.netlify/functions/book-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
  } catch {
    // Graceful fallback if running locally without Netlify Functions
  }
}

function showFeedback(el, message, type) {
  el.textContent = message;
  el.className = `form__feedback form__feedback--${type}`;
}
