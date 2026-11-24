export function initNavigation() {
  const toggleBtn = document.getElementById('nav-toggle');
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav__link');

  if (!toggleBtn || !nav) return;

  const setMenuState = (open) => {
    nav.classList.toggle('is-open', open);
    toggleBtn.setAttribute('aria-expanded', String(open));
  };

  toggleBtn.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    setMenuState(!isOpen);
  });

  links.forEach((link) => {
    link.addEventListener('click', () => {
      links.forEach((item) => item.classList.remove('active'));
      link.classList.add('active');
      setMenuState(false);
    });
  });
}
