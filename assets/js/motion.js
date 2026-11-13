/* AM Tecnologia — movimento leve. Sem dependências, sem loop de rolagem. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* entradas com mola: alterna a inclinação e escalona */
  document.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--mr', (i % 2 ? 2.5 : -2.5) + 'deg'));
  const mv = [];
  [['.sys-head > div', 0], ['.faq-side', 0], ['.faq details', 80]].forEach(([sel, step]) =>
    document.querySelectorAll(sel).forEach((el, i) => {
      if (el.classList.contains('rv')) return;
      el.classList.add('mv');
      el.style.setProperty('--mr', (mv.length % 2 ? 2.5 : -2.5) + 'deg');
      el.style.setProperty('--md', (i * step) + 'ms');
      mv.push(el);
    }));
  if (reduce) mv.forEach(el => el.classList.add('in'));
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    mv.forEach(el => io.observe(el));
  }

  /* pausa animações infinitas e faixas fora da tela */
  const pauser = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('mv-paused', !e.isIntersecting)), { rootMargin: '80px' });
  document.querySelectorAll('main > section, footer').forEach(el => pauser.observe(el));
  const tracks = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('mv-off', !e.isIntersecting)), { rootMargin: '80px' });
  document.querySelectorAll('.marquee .track').forEach(t => tracks.observe(t));
})();
