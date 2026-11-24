export async function initI18n() {
  const select = document.getElementById('lang-select');
  let translations = {};

  try {
    const res = await fetch('./data/i18n.json');
    if (!res.ok) return;
    translations = await res.json();
  } catch {
    return;
  }

  const savedLang = localStorage.getItem('barber_lang') || 'es';
  const initialLang = translations[savedLang] ? savedLang : 'es';

  if (select) {
    select.value = initialLang;
    select.addEventListener('change', () => {
      applyLanguage(select.value, translations);
    });
  }

  applyLanguage(initialLang, translations);
}

function applyLanguage(lang, translations) {
  const dict = translations[lang] || translations.es;
  if (!dict) return;

  localStorage.setItem('barber_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}
