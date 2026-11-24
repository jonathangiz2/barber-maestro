import { SERVICES } from '../data/services.js';
import { BARBERS } from '../data/barbers.js';

export function renderServices() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.innerHTML = SERVICES.map(
    (service) => `
      <article class="card">
        <div class="card__top">
          <h3 class="card__title">${service.name}</h3>
          <span class="card__price">${service.price}</span>
        </div>
        <span class="card__meta">${service.duration}</span>
        <p class="card__desc">${service.description}</p>
      </article>
    `
  ).join('');
}

export function renderBarbers() {
  const container = document.getElementById('barbers-grid');
  if (!container) return;

  container.innerHTML = BARBERS.map(
    (barber) => `
      <article class="card">
        <h3 class="card__title">${barber.name}</h3>
        <span class="card__meta">${barber.role} • ${barber.experience}</span>
        <p class="card__desc">${barber.specialty}</p>
      </article>
    `
  ).join('');
}
