import { SERVICES } from '../data/services.js';
import { BARBERS } from '../data/barbers.js';

export function initBooking() {
  const modal = document.getElementById('booking-modal');
  const form = document.getElementById('booking-form');
  const feedback = document.getElementById('booking-feedback');
  const serviceSelect = document.getElementById('booking-service');
  const barberSelect = document.getElementById('booking-barber');
  const dateInput = document.getElementById('booking-date');

  if (!modal || !form) return;

  populateSelect(serviceSelect, SERVICES, (s) => `${s.name} (${s.price})`);
  populateSelect(barberSelect, BARBERS, (b) => b.name);

  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  document.querySelectorAll('[data-open-booking]').forEach((btn) => {
    btn.addEventListener('click', () => toggleModal(modal, true));
  });

  document.querySelectorAll('[data-close-booking]').forEach((btn) => {
    btn.addEventListener('click', () => toggleModal(modal, false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      toggleModal(modal, false);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const clientName = document.getElementById('client-name').value.trim();
    const service = serviceSelect.options[serviceSelect.selectedIndex].text;
    const date = dateInput.value;
    const time = document.getElementById('booking-time').value;

    feedback.textContent = `¡Cita confirmada para ${clientName}! ${service} el ${date} a las ${time}.`;
    form.reset();

    setTimeout(() => {
      feedback.textContent = '';
      toggleModal(modal, false);
    }, 2600);
  });
}

function populateSelect(selectEl, items, labelFn) {
  if (!selectEl) return;
  selectEl.innerHTML = items
    .map((item) => `<option value="${item.id}">${labelFn(item)}</option>`)
    .join('');
}

function toggleModal(modal, open) {
  modal.classList.toggle('is-open', open);
  modal.setAttribute('aria-hidden', String(!open));
}
