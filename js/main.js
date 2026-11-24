import { initNavigation } from './modules/navigation.js';
import { loadBarberiaData, renderServices, renderGallery, renderHours } from './modules/renderer.js';
import { initBooking } from './modules/booking.js';

  document.addEventListener('DOMContentLoaded', async () => {
    initNavigation();

    try {
      const data = await loadBarberiaData();
      renderServices(data.services);
      renderGallery(data.gallery);
      renderHours(data.hours, data.hoursOrder);
      initBooking(data.services, data.hours);
    } catch (err) {
      console.error(err);
    }

    const yearEl = document.getElementById('year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  });
