// As entradas animadas são progressivas: o conteúdo permanece visível sem JavaScript.
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const elements = [...document.querySelectorAll('.section-heading, .method-feature, .benefits article, .challenge-grid > div, .journey-meta > div, .phase, .story, .mentor-photo, .mentor-copy, .practical-grid > div, .application-inner > h2, .application-inner > p, .application-inner > .button')];
  const active = new Set();
  const pending = new Set(elements);
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const element = entry.target;
      if (!pending.has(element)) continue;
      observer.unobserve(element);
      pending.delete(element);
      if (preference.matches || typeof element.animate !== 'function') continue;
      // Mantém o conteúdo estável quando o visitante já está usando seus controles.
      if (element.matches(':focus-within')) continue;
      const siblings = [...element.parentElement.children];
      const isCard = element.matches('.phase, .story, .benefits article, .journey-meta > div');
      const delay = isCard ? Math.min(siblings.indexOf(element), 3) * 75 : 0;
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(16px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 540, delay, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      active.add(animation);
      animation.finished.then(() => active.delete(animation), () => active.delete(animation));
      const revealOnFocus = () => animation.cancel();
      element.addEventListener('focusin', revealOnFocus, { once: true });
      animation.finished.then(() => element.removeEventListener('focusin', revealOnFocus), () => element.removeEventListener('focusin', revealOnFocus));
    }
    if (!pending.size) observer.disconnect();
  }, { threshold: .08, rootMargin: '0px 0px -24px 0px' });
  elements.forEach(element => observer.observe(element));
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    for (const animation of active) animation.cancel();
    active.clear();
  });
})();
