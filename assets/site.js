/* Gulabi Sham Mushaira — landing page behaviour (no dependencies). */
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const r2 = (n) => Math.round(n * 100) / 100;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- engrailed (Shahjahani) arch, as in the media kit ---------- */
  function rawArch(W, h, o, ox = 0, oy = 0) {
    const n = o.lobes | 0, rise = W * (o.riseRatio ?? 0.62), s = rise;
    const c = (W * W / 4 + rise * rise) / W, R = c;
    const pt = (x, y) => `${r2(x + ox)},${r2(y + oy)}`;
    const g = (o.cusp ?? 0.055) * W, Ri = R - g;
    const thI = -Math.acos((W / 2 - c) / Ri), D = (thI + Math.PI) / (n + 0.5);
    const C = [];
    for (let k = 1; k <= n; k++) { const th = -Math.PI + k * D; C.push([c + Ri * Math.cos(th), s + Ri * Math.sin(th)]); }
    const arcR = (p, q, b) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]); return r2((L * L / 4 + b * b) / (2 * b)); };
    const c1 = C[0], r1 = r2((c1[0] * c1[0] + (c1[1] - s) ** 2) / (2 * c1[0]));
    let d = `M${r2(ox)},${r2(h)} L${pt(0, s)} A${r1},${r1} 0 0 1 ${pt(c1[0], c1[1])} `;
    const bF = R - Ri * Math.cos(D / 2);
    for (let k = 0; k < n - 1; k++) { const r = arcR(C[k], C[k + 1], bF); d += `A${r},${r} 0 0 1 ${pt(C[k + 1][0], C[k + 1][1])} `; }
    const last = C[n - 1], tip = [W / 2, -(o.tip ?? 0.012) * W];
    const ra = arcR(last, tip, (o.crown ?? 0.2) * Math.hypot(tip[0] - last[0], tip[1] - last[1]));
    d += `A${ra},${ra} 0 0 1 ${pt(tip[0], tip[1])} A${ra},${ra} 0 0 1 ${pt(W - last[0], last[1])} `;
    for (let k = n - 1; k > 0; k--) { const r = arcR(C[k], C[k - 1], bF); d += `A${r},${r} 0 0 1 ${pt(W - C[k - 1][0], C[k - 1][1])} `; }
    return d + `A${r1},${r1} 0 0 1 ${pt(W, s)} L${r2(W + ox)},${r2(h)} Z`;
  }
  let probe;
  function bbox(d) {
    if (!probe) {
      probe = document.createElementNS(NS, 'svg');
      probe.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
      probe.setAttribute('aria-hidden', 'true');
      probe.appendChild(document.createElementNS(NS, 'path'));
      document.body.appendChild(probe);
    }
    probe.firstChild.setAttribute('d', d);
    return probe.firstChild.getBBox();
  }
  function archPath(w, h, o) {
    const b = bbox(rawArch(w, h + 9999, o)), W = w * (w / b.width);
    const b2 = bbox(rawArch(W, h + 9999, o));
    return rawArch(W, h, o, -b2.x, -b2.y);
  }

  const FRAMES = {               // offsets (px) + stroke colours
    hero: [[13, 1.5, 'url(#gGold)', 1], [25, .8, '#D4AF6B', .5]],
    light: [[11, 1.4, 'url(#gGold)', 1], [21, .7, '#B8893F', .6]],
    dark: [[11, 1.3, 'url(#gGold)', 1], [21, .7, '#D4AF6B', .45]],
  };
  const arches = [...document.querySelectorAll('.arch[data-arch]')];
  function drawArch(el) {
    const o = JSON.parse(el.dataset.arch), w = el.clientWidth, h = el.clientHeight;
    if (!w || !h) return;
    el.style.clipPath = `path('${archPath(w, h, o)}')`;
    const spec = FRAMES[el.dataset.frame]; if (!spec) return;
    const pad = 40;
    let svg = el.__frame;
    if (!svg) {
      svg = el.__frame = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'arch-frame'); svg.setAttribute('aria-hidden', 'true');
      el.parentNode.insertBefore(svg, el.nextSibling);
      if (frameIO) frameIO.observe(svg); else svg.classList.add('in');
    }
    svg.setAttribute('width', w + 2 * pad); svg.setAttribute('height', h + 2 * pad);
    svg.style.left = el.offsetLeft - pad + 'px'; svg.style.top = el.offsetTop - pad + 'px';
    svg.innerHTML = spec.map(([d, sw, c, op]) =>
      `<path pathLength="1" d="${archPath(w + 2 * d, h + d, o)}" transform="translate(${pad - d},${pad - d})" stroke="${c}" stroke-width="${sw}" opacity="${op}"/>`).join('');
  }

  /* ---------- reveals, frames, counters ---------- */
  const frameIO = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); frameIO.unobserve(e.target); } }), { threshold: .25 })
    : null;
  arches.forEach(drawArch);
  if ('ResizeObserver' in window) {
    let t; new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => arches.forEach(drawArch), 60); }).observe(document.body);
  }

  const counters = [...document.querySelectorAll('[data-count]')];
  function count(el) {
    const to = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(count);
      if (e.target.matches('[data-count]')) count(e.target);
      io.unobserve(e.target);
    }), { threshold: .15, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.rv').forEach((el, i) => { el.style.transitionDelay = (el.dataset.d || 0) + 'ms'; io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach((el) => el.classList.add('in'));
  }

  /* ---------- in-page links: eased scroll that works everywhere ---------- */
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href^="#"]'); if (!a) return;
    const id = a.getAttribute('href').slice(1), el = id ? document.getElementById(id) : document.body;
    if (!el) return;
    ev.preventDefault();
    const off = innerWidth >= 960 ? 76 : 64;
    const to = id === 'top' ? 0 : Math.max(0, el.getBoundingClientRect().top + scrollY - off);
    history.pushState(null, '', '#' + id);
    if (reduce) { scrollTo(0, to); return; }
    const from = scrollY, d = to - from, dur = Math.min(1100, 450 + Math.abs(d) * 0.12), t0 = performance.now();
    const ease = (k) => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const step = (t) => { const k = Math.min(1, (t - t0) / dur); scrollTo(0, from + d * ease(k)); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });

  /* ---------- header, floating button, parallax ---------- */
  const bar = document.getElementById('bar'), fab = document.getElementById('fab');
  const hide = new Set();
  if ('IntersectionObserver' in window) {
    const fio = new IntersectionObserver((es) => {
      es.forEach((e) => e.isIntersecting ? hide.add(e.target) : hide.delete(e.target));
      fab.classList.toggle('away', hide.size > 0);
    });
    document.querySelectorAll('.hero .ctas, #cta, .foot').forEach((el) => fio.observe(el));
  }
  // solid header once the top of the page has scrolled away (no scroll events needed)
  const top = document.createElement('div');
  top.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:40px;pointer-events:none';
  document.body.prepend(top);
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => bar.classList.toggle('solid', !e.isIntersecting)).observe(top);
  const pic = document.querySelector('.hero-arch picture');
  const wide = matchMedia('(min-width: 960px)');
  let ticking = false;
  function onScroll() {
    const y = scrollY;
    if (pic && wide.matches && !reduce && y < innerHeight * 1.2) pic.style.transform = `translate3d(0,${r2(y * 0.07)}px,0)`;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
