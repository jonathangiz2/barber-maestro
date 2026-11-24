import { initNavigation } from './modules/navigation.js';
import { loadBarberiaData, renderServices, renderGallery, renderHours } from './modules/renderer.js';
import { initBooking, setBookingAuthState } from './modules/booking.js';
import { initAuth } from './modules/auth.js';
import { initI18n } from './modules/i18n.js';

document.addEventListener('DOMContentLoaded', async () => {
  initNavigation();
  initI18n();

  try {
    const data = await loadBarberiaData();
    renderServices(data.services);
    renderGallery(data.gallery);
    renderHours(data.hours, data.hoursOrder);
    initBooking(data.services, data.hours);
    initAuth((user) => setBookingAuthState(user, data.hours));
  } catch (err) {
    console.error(err);
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
