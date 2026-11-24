import { initNavigation } from './modules/navigation.js';
import { renderServices, renderBarbers } from './modules/renderer.js';
import { initBooking } from './modules/booking.js';

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderServices();
  renderBarbers();
  initBooking();

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
