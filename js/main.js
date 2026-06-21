/* ============================================================
   BIMAN — interaction & motion layer
   ============================================================ */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------- Preloader ---------------- */
  const preloader = $('#preloader');
  const counter = $('#counter');
  let p = 0;
  const tick = () => {
    p += Math.max(2, Math.round((100 - p) * 0.18));
    if (p >= 100) p = 100;
    counter.textContent = p;
    if (p < 100) setTimeout(tick, 10 + Math.random() * 14);
    else setTimeout(revealSite, 240);
  };
  if (reduce) { preloader.style.display = 'none'; revealSite(); }
  else setTimeout(tick, 120);

  function revealSite() {
    preloader.classList.add('done');
    document.body.style.overflow = '';
    playHero();
  }

  /* ---------------- Custom cursor ---------------- */
  const cur = $('#cursor'), dot = $('#cursorDot');
  let cx = innerWidth / 2, cy = innerHeight / 2, dx = cx, dy = cy;
  addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    dot.style.transform = `translate(${cx}px,${cy}px)`;
  });
  (function follow() {
    dx += (cx - dx) * 0.18; dy += (cy - dy) * 0.18;
    cur.style.transform = `translate(${dx}px,${dy}px)`;
    requestAnimationFrame(follow);
  })();
  $$('[data-hover], a, button').forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cur.classList.remove('is-hover'));
  });

  /* ---------------- Nav scrolled state ---------------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 60);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- Canvas sky (stars + drifting birds) ---------------- */
  const canvas = $('#skyCanvas'), ctx = canvas.getContext('2d');
  let W, H, stars = [], birds = [];
  function resize() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    stars = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.55,
      r: Math.random() * 1.6 * devicePixelRatio + 0.3,
      a: Math.random(), tw: Math.random() * 0.02 + 0.004
    }));
    birds = Array.from({ length: 7 }, () => ({
      x: Math.random() * W, y: H * (0.12 + Math.random() * 0.25),
      s: (Math.random() * 0.4 + 0.4) * devicePixelRatio,
      v: (Math.random() * 0.3 + 0.25) * devicePixelRatio, f: Math.random() * 6.28
    }));
  }
  resize(); addEventListener('resize', resize);

  function drawSky() {
    ctx.clearRect(0, 0, W, H);
    // stars
    for (const s of stars) {
      s.a += s.tw; const al = (Math.sin(s.a) + 1) / 2 * 0.7 + 0.1;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.28);
      ctx.fillStyle = `rgba(255,250,235,${al})`; ctx.fill();
    }
    // birds (distant stork flock — simple V strokes)
    ctx.strokeStyle = 'rgba(6,42,31,.55)';
    ctx.lineWidth = 1.4 * devicePixelRatio;
    for (const b of birds) {
      b.x -= b.v; b.f += 0.06;
      if (b.x < -20) b.x = W + 20;
      const w = 9 * b.s, flap = Math.sin(b.f) * 3 * b.s;
      ctx.beginPath();
      ctx.moveTo(b.x - w, b.y + flap);
      ctx.quadraticCurveTo(b.x, b.y - 3 * b.s, b.x, b.y);
      ctx.quadraticCurveTo(b.x, b.y - 3 * b.s, b.x + w, b.y + flap);
      ctx.stroke();
    }
    requestAnimationFrame(drawSky);
  }
  if (!reduce) drawSky();

  /* ---------------- Hero intro (GSAP) ---------------- */
  function playHero() {
    if (reduce || !window.gsap) {
      $$('.hero__title .word').forEach(w => w.style.transform = 'none');
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo('#heroSun', { y: 160, scale: .7, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 1.8 }, 0)
      .to('.hero__title .word', { y: 0, duration: 1.3, stagger: .09 }, .35)
      .from('.hero__eyebrow', { y: 24, opacity: 0, duration: 1 }, .5)
      .from('.hero__sub', { y: 24, opacity: 0, duration: 1 }, .9)
      .from('.hero__actions', { y: 24, opacity: 0, duration: 1 }, 1.05)
      .from('.hero__scroll', { opacity: 0, duration: 1 }, 1.3);

    // cutout 787 — fly fully across & off-screen, fade out at the edges, pause 7s, loop
    const planeTl = gsap.timeline({ repeat: -1, repeatDelay: 15, delay: .3 });
    planeTl
      .fromTo('#heroPlane', { x: '-55vw' }, { x: '160vw', duration: 14, ease: 'none' }, 0)
      .fromTo('#heroPlane', { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'power1.out' }, 0)
      .to('#heroPlane', { opacity: 0, duration: 1.8, ease: 'power1.in' }, 12.2);
    gsap.to('#heroPlane', { y: '-=26', duration: 5.5, ease: 'sine.inOut', repeat: -1, yoyo: true });
  }

  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- Parallax: sun, clouds, skyline ---------------- */
  gsap.to('#heroSun', { yPercent: 40, scale: 1.15, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  $$('.hero__clouds').forEach(c => {
    const d = parseFloat(c.dataset.depth) || .1;
    gsap.to(c, { yPercent: -60 * d * 6, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  });
  gsap.to('.hero__content', { yPercent: 30, opacity: .2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------------- Booking widget rise ---------------- */
  gsap.from('#bookCard', { y: 80, opacity: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '#bookCard', start: 'top 88%' } });

  /* booking tabs ink */
  const tabs = $$('.book__tab'), ink = $('#tabInk'), returnField = $('[data-return]');
  function moveInk(t) {
    ink.style.width = t.offsetWidth + 'px';
    ink.style.transform = `translateX(${t.offsetLeft - 5}px)`;
  }
  moveInk(tabs[0]);
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.remove('is-active'));
    t.classList.add('is-active'); moveInk(t);
    returnField.style.opacity = t.dataset.trip === 'oneway' ? .35 : 1;
    returnField.style.pointerEvents = t.dataset.trip === 'oneway' ? 'none' : 'auto';
  }));
  addEventListener('resize', () => moveInk($('.book__tab.is-active')));

  /* swap cities */
  $('#swapBtn').addEventListener('click', () => {
    const from = $('.field--from'), to = $('.field--to');
    const a = from.innerHTML; from.innerHTML = to.innerHTML; to.innerHTML = a;
    // keep labels correct
    from.querySelector('.field__label').textContent = 'From';
    to.querySelector('.field__label').textContent = 'To';
  });

  /* search feedback */
  $('#bookForm').addEventListener('submit', () => {
    const btn = $('.book__search'), span = btn.querySelector('span');
    const old = span.textContent;
    span.textContent = 'Searching the skies…';
    btn.style.background = 'var(--green)';
    setTimeout(() => { span.textContent = 'Found 14 flights ✦'; }, 1300);
    setTimeout(() => { span.textContent = old; btn.style.background = ''; }, 3200);
  });

  /* ---------------- Passenger selector ---------------- */
  (function passengers() {
    const panel = $('#paxPanel'); if (!panel) return;
    const field = $('#paxField');
    const counts = { adults: 1, children: 0, infants: 0 };
    let cabin = 'Economy';

    function summary() {
      const total = counts.adults + counts.children + counts.infants;
      return (total === 1 && counts.adults === 1) ? '1 Adult' : total + ' Passengers';
    }
    function updateDisplay() {
      field.querySelector('[data-pax-count]').textContent = summary();
      field.querySelector('[data-pax-class]').textContent = cabin;
    }
    function refresh() {
      panel.querySelectorAll('.pax__row').forEach(row => {
        const k = row.dataset.pax, min = +row.dataset.min, max = +row.dataset.max, v = counts[k];
        row.querySelector('[data-val]').textContent = v;
        row.querySelector('[data-dec]').disabled = v <= min;
        let incDisabled = v >= max;
        if (k === 'infants' && counts.infants >= counts.adults) incDisabled = true;
        row.querySelector('[data-inc]').disabled = incDisabled;
      });
    }
    panel.querySelectorAll('.pax__row').forEach(row => {
      const k = row.dataset.pax, min = +row.dataset.min, max = +row.dataset.max;
      row.querySelector('[data-inc]').addEventListener('click', () => {
        if (k === 'infants' && counts.infants >= counts.adults) return;
        counts[k] = Math.min(max, counts[k] + 1); refresh(); updateDisplay();
      });
      row.querySelector('[data-dec]').addEventListener('click', () => {
        counts[k] = Math.max(min, counts[k] - 1);
        if (k === 'adults' && counts.infants > counts.adults) counts.infants = counts.adults;
        refresh(); updateDisplay();
      });
    });
    panel.querySelectorAll('.pax__chip').forEach(c => c.addEventListener('click', () => {
      panel.querySelectorAll('.pax__chip').forEach(x => x.classList.remove('is-active'));
      c.classList.add('is-active'); cabin = c.dataset.class; updateDisplay();
    }));

    function open() { panel.hidden = false; field.classList.add('is-open'); refresh(); }
    function close() { panel.hidden = true; field.classList.remove('is-open'); }
    field.addEventListener('click', e => { e.preventDefault(); panel.hidden ? open() : close(); });
    $('[data-pax-done]').addEventListener('click', close);
    document.addEventListener('click', e => {
      if (!panel.hidden && !panel.contains(e.target) && !field.contains(e.target)) close();
    });

    refresh(); updateDisplay();
  })();

  /* ---------------- Range calendar ---------------- */
  (function calendar() {
    const cal = $('#calendar');
    if (!cal) return;
    const monthsEl = $('#calMonths'), hintEl = $('#calHint');
    const departField = $('#departField'), returnField2 = $('#returnField');
    const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const DOW = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    const WD = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const today = new Date(); today.setHours(0,0,0,0);
    const key = d => d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
    const same = (a,b) => a && b && key(a) === key(b);
    const fmt = d => MN[d.getMonth()].slice(0,3)+' '+d.getDate();

    let view = new Date(2026,5,1), start = new Date(2026,5,28), end = new Date(2026,6,12);
    let mode = 'depart';
    const trip = () => { const t = $('.book__tab.is-active'); return t ? t.dataset.trip : 'round'; };

    function updateFields() {
      const oneway = trip() === 'oneway';
      departField.querySelector('[data-city]').textContent = fmt(start);
      departField.querySelector('[data-hint]').textContent = WD[start.getDay()];
      const rc = returnField2.querySelector('[data-city]'), rh = returnField2.querySelector('[data-hint]');
      if (oneway) { rc.textContent = '—'; rh.textContent = 'One way'; }
      else if (!end) { rc.textContent = 'Add date'; rh.textContent = 'Optional'; }
      else { rc.textContent = fmt(end); rh.textContent = WD[end.getDay()]; }
    }

    function monthHTML(base) {
      const y = base.getFullYear(), m = base.getMonth();
      const startDow = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate();
      let cells = '';
      for (let i=0;i<startDow;i++) cells += '<button class="cal__day is-out" disabled tabindex="-1"></button>';
      for (let d=1; d<=days; d++) {
        const date = new Date(y,m,d), past = date < today;
        let cls = 'cal__day';
        if (same(date,today)) cls += ' is-today';
        if (same(date,start)) cls += ' is-start';
        if (end && same(date,end)) cls += ' is-end';
        if (start && end && date>start && date<end) cls += ' in-range';
        cells += `<button class="${cls}" ${past?'disabled':''} data-pick="${y}-${m}-${d}">${d}</button>`;
      }
      return `<div class="cal__month"><div class="cal__mtitle">${MN[m]} ${y}</div>
        <div class="cal__dow">${DOW.map(x=>`<span>${x}</span>`).join('')}</div>
        <div class="cal__grid">${cells}</div></div>`;
    }

    function render() {
      const nxt = new Date(view.getFullYear(), view.getMonth()+1, 1);
      monthsEl.innerHTML = monthHTML(view) + monthHTML(nxt);
      monthsEl.querySelectorAll('[data-pick]').forEach(b =>
        b.addEventListener('click', () => pick(b.dataset.pick)));
    }

    function pick(str) {
      const [y,m,d] = str.split('-').map(Number), date = new Date(y,m,d);
      if (trip() === 'oneway') { start = date; end = null; updateFields(); render(); setTimeout(close,160); return; }
      if (mode === 'depart' || !start || date < start) {
        start = date; end = null; mode = 'return';
        hintEl.textContent = 'Now pick your return date';
      } else {
        end = date; mode = 'depart';
        hintEl.textContent = 'Dates set ✦';
        setTimeout(close, 220);
      }
      render(); updateFields();
    }

    function open(which) {
      mode = which === 'return' ? 'return' : 'depart';
      view = new Date(start.getFullYear(), start.getMonth(), 1);
      hintEl.textContent = trip()==='oneway' ? 'Select your travel date'
        : which==='return' ? 'Select your return date' : 'Select your departure date';
      render();
      cal.hidden = false;
      departField.classList.toggle('is-open', which==='depart');
      returnField2.classList.toggle('is-open', which==='return');
    }
    function close() {
      cal.hidden = true;
      departField.classList.remove('is-open');
      returnField2.classList.remove('is-open');
    }

    departField.addEventListener('click', e => { e.preventDefault(); cal.hidden ? open('depart') : close(); });
    returnField2.addEventListener('click', e => { e.preventDefault(); if (trip()==='oneway') return; cal.hidden ? open('return') : close(); });
    cal.querySelector('[data-cal-prev]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()-1, 1); render(); });
    cal.querySelector('[data-cal-next]').addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth()+1, 1); render(); });
    document.addEventListener('click', e => { if (!cal.hidden && !cal.contains(e.target) && !departField.contains(e.target) && !returnField2.contains(e.target)) close(); });
    $$('.book__tab').forEach(t => t.addEventListener('click', () => { if (!cal.hidden) close(); updateFields(); }));

    updateFields();
  })();

  /* ---------------- Section title reveals ---------------- */
  $$('.section-title, .kicker').forEach(el => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* ---------------- Destination cards stagger + tilt ---------------- */
  gsap.from('.dcard', { y: 70, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12,
    scrollTrigger: { trigger: '.dest__grid', start: 'top 80%' } });
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -8;
      const ry = ((e.clientX - r.left) / r.width - .5) * 8;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });

  /* ---------------- Marquee scrub speed ---------------- */
  gsap.to('.marquee__track', { xPercent: -8, ease: 'none',
    scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 1 } });

  /* ---------------- Experience sticky storytelling ---------------- */
  const steps = $$('.exp__step');
  ScrollTrigger.create({
    trigger: '.exp', start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: self => {
      const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
      steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    }
  });
  gsap.to('#expBg', { yPercent: -12, scale: 1.18, ease: 'none',
    scrollTrigger: { trigger: '.exp', start: 'top top', end: 'bottom bottom', scrub: true } });

  /* ---------------- Stats count-up ---------------- */
  $$('.stat__num').forEach(el => {
    const target = +el.dataset.count;
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: target, duration: 2, ease: 'power2.out',
          onUpdate: () => el.textContent = Math.round(o.v) });
      }
    });
  });

  /* ---------------- Fleet plane glide-in ---------------- */
  gsap.fromTo('#fleetPlane', { y: 60, opacity: 0, scale: .97 },
    { y: 0, opacity: 1, scale: 1, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.fleet__hero', start: 'top 78%' } });
  gsap.fromTo('#fleetPlane img', { yPercent: -6 }, { yPercent: 6, ease: 'none',
    scrollTrigger: { trigger: '.fleet', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.from('.spec', { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'expo.out',
    scrollTrigger: { trigger: '.fleet__spec', start: 'top 85%' } });

  /* ---------------- Fleet selector ---------------- */
  (() => {
    const FLEET = {
      b787: { img: 'assets/fleet-787.webp?v=6', name: 'Boeing 787-9', tag: 'The Dreamliner',
        alt: 'Biman Bangladesh Airlines Boeing 787-9 Dreamliner in flight',
        spec: [['Boeing 787-9', 'Dreamliner'], ['14,140 km', 'Max range'], ['298', 'Seats / 3 class'], ['0.85 Mach', 'Cruise speed']] },
      b777: { img: 'assets/fleet-777.webp?v=5', name: 'Boeing 777-300ER', tag: 'The Flagship',
        alt: 'Biman Bangladesh Airlines Boeing 777-300ER climbing into a blue sky',
        spec: [['Boeing 777-300ER', 'Flagship'], ['13,650 km', 'Max range'], ['419', 'Seats / 2 class'], ['0.84 Mach', 'Cruise speed']] },
      b737: { img: 'assets/fleet-737.webp?v=7', name: 'Boeing 737-800', tag: 'The Workhorse',
        alt: 'Biman Bangladesh Airlines Boeing 737-800 cruising above the clouds',
        spec: [['Boeing 737-800', 'Workhorse'], ['5,765 km', 'Max range'], ['162', 'Seats / 2 class'], ['0.785 Mach', 'Cruise speed']] }
    };
    const img = document.getElementById('fleetImg');
    const cap = document.getElementById('fleetCap');
    const specEl = document.getElementById('fleetSpec');
    const thumbs = [...document.querySelectorAll('.fleet__thumb')];
    if (!img || !thumbs.length) return;
    let current = 'b787';

    function show(key) {
      if (key === current) return;
      const d = FLEET[key];
      if (!d) return;
      current = key;
      thumbs.forEach(t => t.classList.toggle('is-active', t.dataset.key === key));
      img.classList.add('is-fading');
      setTimeout(() => {
        img.src = d.img; img.alt = d.alt;
        cap.innerHTML = `<span>${d.name}</span> · ${d.tag}`;
        const specs = specEl.querySelectorAll('.spec');
        d.spec.forEach((s, i) => { if (specs[i]) { specs[i].querySelector('span').textContent = s[0]; specs[i].querySelector('i').textContent = s[1]; } });
        img.classList.remove('is-fading');
      }, 280);
    }
    thumbs.forEach(t => t.addEventListener('click', () => show(t.dataset.key)));
  })();

  /* ---------------- CTA title ---------------- */
  gsap.from('.cta__title', { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out',
    scrollTrigger: { trigger: '.cta', start: 'top 75%' } });

  /* ---------------- Route map ---------------- */
  (function routeMap() {
    const svg = $('#routeSvg');
    if (!svg) return;
    const NS = 'http://www.w3.org/2000/svg';
    const mk = (n, a = {}) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    // x = equirectangular longitude; y = latitude with vertical exaggeration so arcs aren't flat
    const proj = (lat, lon) => [ (lon + 180) / 360 * 1000, (40 - lat) * 4.2 + 120 ];
    const hub = { name: 'Dhaka', ...{} };
    const [hx, hy] = proj(23.8, 90.4);
    const dests = [
      { c: 'London',       code: 'LHR', lat: 51.5, lon: -0.1,  meta: 'Heathrow · 8h 55m · daily',        fare: '৳ 78,500' },
      { c: 'Manchester',   code: 'MAN', lat: 53.5, lon: -2.2,  meta: 'MAN · 9h 40m · 4× weekly',         fare: '৳ 81,200' },
      { c: 'Toronto',      code: 'YYZ', lat: 43.7, lon: -79.4, meta: 'Pearson · 14h 10m · 3× weekly',    fare: '৳ 1,24,000' },
      { c: 'New York',     code: 'JFK', lat: 40.6, lon: -73.8, meta: 'JFK · 15h 05m · seasonal',         fare: '৳ 1,31,500' },
      { c: 'Dubai',        code: 'DXB', lat: 25.2, lon: 55.3,  meta: 'DXB · 5h 20m · 2× daily',          fare: '৳ 42,900' },
      { c: 'Jeddah',       code: 'JED', lat: 21.5, lon: 39.2,  meta: 'King Abdulaziz · 6h 30m · daily',  fare: '৳ 51,400' },
      { c: 'Singapore',    code: 'SIN', lat: 1.35, lon: 103.8, meta: 'Changi · 4h 25m · daily',          fare: '৳ 38,200' },
      { c: 'Kuala Lumpur', code: 'KUL', lat: 3.1,  lon: 101.7, meta: 'KLIA · 4h 10m · daily',            fare: '৳ 35,900' },
    ];

    const gG = $('#graticule'), aG = $('#arcs'), nG = $('#nodes'), pG = $('#planes');
    // graticule
    for (let x = 260; x <= 820; x += 36) gG.appendChild(mk('line', { class: 'grat', x1: x, y1: 50, x2: x, y2: 320 }));
    for (let y = 55; y <= 320; y += 30) gG.appendChild(mk('line', { class: 'grat', x1: 255, y1: y, x2: 815, y2: y }));

    const arcs = [];
    dests.forEach((d, i) => {
      const [x, y] = proj(d.lat, d.lon);
      d.x = x; d.y = y;
      const dist = Math.hypot(x - hx, y - hy);
      const cx = (x + hx) / 2, cy = (y + hy) / 2 - dist * 0.32;
      const path = mk('path', { class: 'arc', d: `M${hx} ${hy} Q ${cx} ${cy} ${x} ${y}` });
      aG.appendChild(path);
      d.path = path;
      arcs.push(path);

      // node
      const g = mk('g', { class: 'node' }); g.dataset.i = i;
      g.appendChild(mk('circle', { class: 'node__ring', cx: x, cy: y, r: 6 }));
      g.appendChild(mk('circle', { class: 'node__dot', cx: x, cy: y, r: 3 }));
      const anchor = x > hx - 30 ? 'start' : 'end', dx = x > hx - 30 ? 9 : -9;
      g.appendChild(mk('text', { class: 'node__label', x: x + dx, y: y + 3, 'text-anchor': anchor })).textContent = d.code;
      nG.appendChild(g);
      d.node = g;

      // traveling plane dot
      const dot = mk('circle', { class: 'plane-dot', r: 2.4, cx: hx, cy: hy });
      pG.appendChild(dot);
      d.dot = dot;
    });

    // hub
    const hubG = mk('g');
    const pulse = mk('circle', { class: 'hub__pulse', cx: hx, cy: hy, r: 5 });
    hubG.appendChild(pulse);
    hubG.appendChild(mk('circle', { class: 'hub__dot', cx: hx, cy: hy, r: 4 }));
    hubG.appendChild(mk('text', { class: 'hub__label', x: hx + 9, y: hy + 3 })).textContent = 'DHAKA';
    nG.appendChild(hubG);
    if (window.gsap) gsap.to(pulse, { attr: { r: 14 }, opacity: 0, duration: 1.8, repeat: -1, ease: 'sine.out' });

    // animate traveling planes along arc length
    const start = performance.now();
    function flight(t) {
      const elapsed = (t - start) / 1000;
      dests.forEach((d, i) => {
        const len = d.path.getTotalLength();
        const prog = ((elapsed * 0.14 + i * 0.16) % 1);
        const pt = d.path.getPointAtLength(prog * len);
        d.dot.setAttribute('cx', pt.x); d.dot.setAttribute('cy', pt.y);
        d.dot.style.opacity = Math.sin(prog * Math.PI); // fade at ends
      });
      requestAnimationFrame(flight);
    }
    if (!reduce) requestAnimationFrame(flight);

    // draw-in on scroll
    if (window.gsap) {
      arcs.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      gsap.to(arcs, {
        strokeDashoffset: 0, duration: 1.4, stagger: .12, ease: 'power2.out',
        scrollTrigger: { trigger: '.routes__map', start: 'top 75%' }
      });
    }

    // interaction
    const elCity = $('#routeCity'), elMeta = $('#routeMeta'), elFare = $('#routeFare'), list = $('#routeList');
    function select(i) {
      const d = dests[i];
      elCity.textContent = d.c;
      elMeta.textContent = d.meta;
      elFare.textContent = 'from ' + d.fare;
      dests.forEach((x, k) => {
        x.node.classList.toggle('is-active', k === i);
        x.path.classList.toggle('is-active', k === i);
        x.btn.classList.toggle('is-active', k === i);
      });
    }
    dests.forEach((d, i) => {
      const b = document.createElement('button');
      b.textContent = d.c; b.addEventListener('click', () => select(i));
      list.appendChild(b); d.btn = b;
      d.node.addEventListener('mouseenter', () => select(i));
    });
    select(0);
  })();

  /* lock scroll during preload */
  document.body.style.overflow = 'hidden';
})();
