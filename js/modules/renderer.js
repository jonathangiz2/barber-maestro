export async function loadBarberiaData() {
  const res = await fetch('./data/barberia.json');
  if (!res.ok) throw new Error('No se pudo cargar data/barberia.json');
  return res.json();
}

export function renderServices(services) {
  const container = document.getElementById('services-grid');
  if (!container) return;

  container.innerHTML = services
    .map(
      (service, index) => `
      <article class="card service-card">
        <div class="service-card__header">
          <span class="service-card__num">0${index + 1}</span>
          <span class="service-card__duration">${service.duration} min</span>
        </div>
        <h3 class="card__title">${service.name}</h3>
        <div class="service-card__price">${service.price}</div>
        <p class="card__desc">${service.description}</p>
        <a href="#reservar" class="btn btn--outline service-card__btn" data-select-service="${service.id}">
          Reservar
        </a>
      </article>
    `
    )
    .join('');

  container.querySelectorAll('[data-select-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const select = document.getElementById('booking-service');
      if (select) {
        select.value = btn.dataset.selectService;
      }
    });
  });
}

export function renderGallery(gallery) {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

      container.innerHTML = gallery
        .map(
          (item) => `
      <div class="gallery-item">
        <img src="${item.src}" alt="${item.alt}" loading="lazy">
      </div>
    `
    )
    .join('');
  }

    export function renderHours(hours, order) {
      const container = document.getElementById('hours-list');
      if (!container) return;

      const todayIndex = new Date().getDay();

      container.innerHTML = order
        .map((dayIndex) => {
          const day = hours[String(dayIndex)];
          const isToday = dayIndex === todayIndex;
          return `
        <li class="hours-item ${isToday ? 'hours-item--today' : ''}">
          <span class="hours-item__day">
            ${day.label}
            ${isToday ? '<em class="hours-badge">Hoy</em>' : ''}
          </span>
          <span class="hours-item__time">${day.text}</span>
        </li>
      `;
        })
        .join('');
    }
