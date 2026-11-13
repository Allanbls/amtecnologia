/* AM Tecnologia — camada de movimento. Sem dependências. Respeita prefers-reduced-motion. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

  /* ---- entradas com mola: alterna a inclinação e escalona ---- */
  document.querySelectorAll('.rv').forEach((el, i) => el.style.setProperty('--mr', (i % 2 ? 3 : -3) + 'deg'));
  const targets = [
    ['.sys-head > div', 0], ['.projcta .pc-box', 0], ['.faq-side', 0], ['.faq details', 90]
  ];
  const mv = [];
  targets.forEach(([sel, step]) => document.querySelectorAll(sel).forEach((el, i) => {
    if (el.classList.contains('rv')) return;
    el.classList.add('mv');
    el.style.setProperty('--mr', (mv.length % 2 ? 3 : -3) + 'deg');
    el.style.setProperty('--md', (i * step) + 'ms');
    mv.push(el);
  }));
  if (reduce) { mv.forEach(el => el.classList.add('in')); }
  else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    mv.forEach(el => io.observe(el));
  }

  /* ---- cards inclinam com o ponteiro (só mouse) ---- */
  if (fine && !reduce) {
    document.querySelectorAll('.svc, .projcta .pc-box').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--nx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(2));
        card.style.setProperty('--ny', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(2));
        card.classList.add('is-tilt');
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.classList.remove('is-tilt');
        card.style.removeProperty('--nx'); card.style.removeProperty('--ny');
      });
    });
  }

  /* ---- formas flutuantes com parallax ---- */
  const STAR = '<svg class="mv-star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5 14.6 9.4 22.5 12 14.6 14.6 12 22.5 9.4 14.6 1.5 12 9.4 9.4Z" fill="currentColor"/></svg>';
  const OR = '#FEB05D', BL = '#5A7ACD';
  const plan = {
    '.hero': [
      ['bar', '47%', '5%', { w: 22, h: 76, c: OR, r: '-8deg', d: 6 }, .10],
      ['star', '2%', '84%', { w: 46, c: BL, d: 7 }, -.08],
      ['bar', '90%', '88%', { w: 20, h: 70, c: BL, r: '10deg', d: 5.5 }, .14, 'lg'],
      ['star', '49%', '90%', { w: 30, c: OR, d: 8 }, .06, 'lg']
    ],
    '.sys': [
      ['star', '94%', '6%', { w: 44, c: OR, d: 7 }, .12],
      ['bar', '1%', '60%', { w: 20, h: 72, c: BL, r: '6deg', d: 6.5 }, -.1, 'lg']
    ],
    '.projcta': [
      ['bar', '3%', '12%', { w: 22, h: 78, c: OR, r: '-10deg', d: 6 }, .12],
      ['star', '93%', '78%', { w: 42, c: BL, d: 7.5 }, -.1]
    ]
  };
  const items = [];
  Object.entries(plan).forEach(([sel, list]) => {
    const host = document.querySelector(sel); if (!host) return;
    host.classList.add('mv-host');
    const box = document.createElement('div'); box.className = 'mv-shapes'; box.setAttribute('aria-hidden', 'true');
    list.forEach(([type, x, y, o, sp, extra]) => {
      const s = document.createElement('div'); s.className = 'mv-shape' + (extra ? ' ' + extra : '');
      s.style.setProperty('--x', x); s.style.setProperty('--y', y);
      const set = (k, v) => v != null && s.style.setProperty(k, v);
      set('--w', o.w + 'px'); set('--h', o.h && o.h + 'px'); set('--c', o.c); set('--r', o.r); set('--d', o.d + 's');
      s.innerHTML = type === 'bar' ? '<i class="mv-bar"></i>' : STAR;
      box.appendChild(s); items.push({ el: s, host, sp });
    });
    host.prepend(box);
  });
  const visible = new Set();
  const ioHosts = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)), { rootMargin: '150px' });
  [...new Set(items.map(i => i.host))].forEach(h => ioHosts.observe(h));

  /* ---- marquees: pausam fora da tela; aceleram com a rolagem ---- */
  const tracks = [...document.querySelectorAll('.marquee .track')];
  const ioTracks = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('mv-off', !e.isIntersecting)), { rootMargin: '100px' });
  tracks.forEach(t => ioTracks.observe(t));

  if (reduce) return;
  let lastY = scrollY, rate = 1, target = 1, ticking = false, running = false;

  function frame() {
    ticking = false;
    /* parallax das formas */
    const vh = innerHeight;
    items.forEach(({ el, host, sp }) => {
      if (!visible.has(host)) return;
      const r = host.getBoundingClientRect();
      el.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * sp).toFixed(1) + 'px');
    });
  }
  function spin() {
    rate += (target - rate) * .12; target += (1 - target) * .06;
    const anims = tracks.map(t => t.getAnimations()[0]).filter(Boolean);
    anims.forEach(a => { a.playbackRate = rate; });
    if (Math.abs(rate - 1) > .02 || target > 1.02) requestAnimationFrame(spin); else { anims.forEach(a => { a.playbackRate = 1; }); running = false; }
  }
  addEventListener('scroll', () => {
    const dy = Math.abs(scrollY - lastY); lastY = scrollY;
    target = Math.max(target, 1 + Math.min(dy / 8, 5));
    if (!running) { running = true; requestAnimationFrame(spin); }
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });
  frame();
})();
