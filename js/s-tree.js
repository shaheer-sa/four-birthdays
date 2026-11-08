'use strict';
/* ============ 9 · HEART TREE + promise coupons ============ */
(() => {
  const D = App.scene('tree', { tone: 'light' });
  const tc = $('#treeCv'), sheet = $('#cpSheet'), list = $('#cpList'), secret = $('#secret');
  const T = { on: false, t0: 0, segs: [], hearts: [], trunk: null, shake: 0, cx: 0, cy: 0, s: 0, lastFall: 0, groundGrad: null, bakeCanvas: null, maxBranchT: 0 };
  let g = null, taps = [];
  const nameEl = $('#treeName');

  setText($('#treeSmall'), LINES.treeSmall || 'and… this one is all for you');
  nameEl.textContent = 'Happy Birthday,';
  nameEl.appendChild(document.createElement('br'));
  nameEl.appendChild(document.createTextNode(HER + ' '));
  const sp = document.createElement('span');
  sp.className = 'name-sparkle';
  sp.textContent = '✨';
  sp.setAttribute('aria-label', 'secret sparkle');
  nameEl.appendChild(sp);
  setText($('#treeMsg'), LINES.treeMsg || "Every heart on this tree is one reason I love you, and I'm still counting.");
  setText($('#treeHint'), LINES.treeHint || 'tap the tree ♥');
  setText($('#secretText'), G.secret || '');
  if (G.couponsIntro) setText($('#cpSub'), G.couponsIntro);

  function layoutTree() {
    const W = VP.W, H = VP.H, portrait = H > W * 1.05;
    g = sizeCanvas(tc);
    T.bakeCanvas = null;
    T.cx = portrait ? W / 2 : W * .64;
    T.s = portrait ? Math.min(W * .37, H * .21) : Math.min(W * .19, H * .28);
    T.cy = portrait ? H * .6 : H * .44;
    D.el.style.setProperty('--tx', (T.cx / W * 100) + '%');

    // ground glow, created once per layout
    T.groundGrad = g.createRadialGradient(T.cx, H + T.s * .2, 0, T.cx, H + T.s * .2, T.s * 1.4);
    T.groundGrad.addColorStop(0, 'rgba(255,190,190,.35)');
    T.groundGrad.addColorStop(1, 'rgba(255,190,190,0)');

    const s = T.s, rng = rngFrom(20240214);
    const top = { x: T.cx + s * .02, y: T.cy + s * .45 };
    T.trunk = { bx: T.cx - s * .03, by: H + 8, tx: top.x, ty: top.y, w: Math.max(9, s * .1), dur: 1300 };
    T.segs = [];
    function grow(x, y, a, len, w, d, t0) {
      a = clamp(a, -1.35, 1.35);
      const ex = x + Math.sin(a) * len, ey = y - Math.cos(a) * len, bend = (rng() - .5) * len * .35;
      const mx = (x + ex) / 2 + Math.cos(a) * bend, my = (y + ey) / 2 + Math.sin(a) * bend, dur = 170 + (len / s) * 520;
      T.segs.push({ x, y, mx, my, ex, ey, w, t0, dur });
      if (d >= 4) return;
      const n = d < 1 ? 2 : (rng() < .4 ? 3 : 2), spread = .38 + rng() * .22;
      for (let i = 0; i < n; i++) {
        const off = n === 2 ? (i ? spread : -spread) : (i - 1) * spread * 1.1, pull = d < 2 ? Math.sign(a) * .12 : -Math.sign(a) * .06;
        grow(ex, ey, a + off + pull + (rng() - .5) * .25, len * (.68 + rng() * .12), w * .64, d + 1, t0 + dur * .82);
      }
    }
    const T0 = 1150;
    grow(top.x, top.y, -.68, s * .52, T.trunk.w * .62, 0, T0);
    grow(top.x, top.y, .68, s * .52, T.trunk.w * .62, 0, T0 + 60);
    grow(top.x, top.y, .05, s * .34, T.trunk.w * .45, 1, T0 + 120);

    T.maxBranchT = Math.max(T.trunk.dur, ...T.segs.map(b => b.t0 + b.dur));

    const N = Math.round((portrait ? 190 : 270) * clamp(s / 220, .7, 1.15)), minD = s * .085, pts = [];
    const minD2 = minD * minD, cellSize = minD;
    const grid = new Map();
    let tries = 0;
    while (pts.length < N && tries < 9000) {
      tries++;
      const x = rng() * 2.4 - 1.2, y = rng() * 2.45 - 1.1;
      if (Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y > .02) continue;
      const px = T.cx + x * s * 1.02, py = T.cy - y * s;
      const gx = Math.floor(px / cellSize), gy = Math.floor(py / cellSize);
      let ok = true;
      for (let dx = -1; dx <= 1 && ok; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const cell = grid.get((gx + dx) + ',' + (gy + dy));
          if (cell) {
            for (let i = 0; i < cell.length; i++) {
              const p = cell[i];
              if ((p.x - px) ** 2 + (p.y - py) ** 2 < minD2) { ok = false; break; }
            }
            if (!ok) break;
          }
        }
      }
      if (!ok && tries < 7000) continue;
      const newP = { x: px, y: py, k: py + rng() * s * .9 };
      pts.push(newP);
      const k = gx + ',' + gy;
      let cell = grid.get(k);
      if (!cell) { cell = []; grid.set(k, cell); }
      cell.push(newP);
    }
    pts.sort((a, b) => b.k - a.k);
    T.hearts = pts.map((p, i) => ({ x: p.x, y: p.y, size: s * (.15 + rng() * .11), rot: (rng() - .5) * .8, sprite: FX.S.hearts[(rng() * FX.S.hearts.length) | 0], t0: 2500 + (i / pts.length) * 3300 + rng() * 260, ph: rng() * TAU }));
  }

  function bakeTrunkAndBranches() {
    if (T.bakeCanvas) return;
    const s = T.s, tr = T.trunk;
    T.bakeCanvas = document.createElement('canvas');
    T.bakeCanvas.width = tc.width;
    T.bakeCanvas.height = tc.height;
    const bg = T.bakeCanvas.getContext('2d');
    bg.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);

    // trunk
    const L = [], R = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, x = lerp(tr.bx, tr.tx, u) - Math.sin(u * Math.PI) * s * .06, y = lerp(tr.by, tr.ty, u), w = tr.w * (1.25 - .55 * u) / 2;
      L.push([x - w, y]); R.push([x + w, y]);
    }
    const grd = bg.createLinearGradient(tr.bx - tr.w, 0, tr.bx + tr.w, 0);
    grd.addColorStop(0, '#5a302c'); grd.addColorStop(.55, '#7d4a41'); grd.addColorStop(1, '#4e2925');
    bg.fillStyle = grd; bg.beginPath(); bg.moveTo(L[0][0], L[0][1]); L.forEach(q => bg.lineTo(q[0], q[1])); R.reverse().forEach(q => bg.lineTo(q[0], q[1])); bg.closePath(); bg.fill();

    // branches
    bg.lineCap = 'round'; bg.strokeStyle = '#6a3a35';
    for (const b of T.segs) {
      bg.lineWidth = Math.max(1.2, b.w);
      bg.beginPath(); bg.moveTo(b.x, b.y); bg.quadraticCurveTo(b.mx, b.my, b.ex, b.ey); bg.stroke();
    }
  }

  function drawTree(now, dt) {
    const t = REDUCE ? 1e6 : now - T.t0, s = T.s, W = VP.W, H = VP.H;
    g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0); g.clearRect(0, 0, W, H);

    // ground glow
    if (T.groundGrad) {
      g.fillStyle = T.groundGrad; g.fillRect(0, 0, W, H);
    }

    if (t >= T.maxBranchT) {
      if (!T.bakeCanvas) bakeTrunkAndBranches();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.drawImage(T.bakeCanvas, 0, 0);
      g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);
    } else {
      const tr = T.trunk, p = clamp(t / tr.dur), ep = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      if (p > 0) {
        const L = [], R = [];
        for (let i = 0; i <= 24; i++) { const u = (i / 24) * ep, x = lerp(tr.bx, tr.tx, u) - Math.sin(u * Math.PI) * s * .06, y = lerp(tr.by, tr.ty, u), w = tr.w * (1.25 - .55 * u) / 2; L.push([x - w, y]); R.push([x + w, y]); }
        const grd = g.createLinearGradient(tr.bx - tr.w, 0, tr.bx + tr.w, 0);
        grd.addColorStop(0, '#5a302c'); grd.addColorStop(.55, '#7d4a41'); grd.addColorStop(1, '#4e2925');
        g.fillStyle = grd; g.beginPath(); g.moveTo(L[0][0], L[0][1]); L.forEach(q => g.lineTo(q[0], q[1])); R.reverse().forEach(q => g.lineTo(q[0], q[1])); g.closePath(); g.fill();
      }
      g.lineCap = 'round'; g.strokeStyle = '#6a3a35';
      for (const b of T.segs) {
        const q = clamp((t - b.t0) / b.dur); if (q <= 0) continue;
        const e = 1 - Math.pow(1 - q, 2), ax = lerp(b.x, b.mx, e), ay = lerp(b.y, b.my, e), bx = lerp(ax, lerp(b.mx, b.ex, e), e), by = lerp(ay, lerp(b.my, b.ey, e), e);
        g.lineWidth = Math.max(1.2, b.w); g.beginPath(); g.moveTo(b.x, b.y); g.quadraticCurveTo(ax, ay, bx, by); g.stroke();
      }
    }

    T.shake *= Math.pow(.05, dt);
    for (const h of T.hearts) {
      const q = clamp((t - h.t0) / 650); if (q <= 0) continue;
      const sway = Math.sin(now * .0012 + h.ph) * s * .006 + Math.sin(now * .03 + h.ph) * T.shake * s * .045;
      g.save(); g.translate(h.x + sway, h.y + Math.cos(now * .03 + h.ph) * T.shake * s * .02);
      g.rotate(h.rot + Math.sin(now * .0015 + h.ph) * .06 + T.shake * Math.sin(now * .04 + h.ph) * .25);
      g.globalAlpha = clamp(q * 2); const z = h.size * easeOutBack(q); g.drawImage(h.sprite, -z / 2, -z / 2, z, z); g.restore();
    }
    if (t > 5400 && now - T.lastFall > 520) { T.lastFall = now; const h = pick(T.hearts); if (h) dropHeart(h.x, h.y, h.size * .7); }
  }
  function dropHeart(x, y, size, push = 0) {
    FX.add({ x, y, vx: rand(-20, 20) + push * rand(-110, 110), vy: -push * 120 * Math.random(), g: 60, vmax: 55 + Math.random() * 40, life: 9, size, rot: rand(-.5, .5), vr: rand(-.75, .75), sway: rand(26, 46), swayF: rand(1.6, 2.6), type: 'sprite', sprite: pick(FX.S.hearts), fadeIn: .3 });
  }
  function tapTree(e) {
    if (App.cur !== D || e.target.closest('button, .note h2')) return;
    T.shake = 1; vibrate(12); Sound.sfx('soft');
    const x = e.clientX ?? T.cx, y = e.clientY ?? T.cy;
    burst(x, y, 14, { speed: 220, hearts: .8, g: 160 });
    const n = 10 + (Math.random() * 6 | 0);
    for (let i = 0; i < n; i++) { const h = pick(T.hearts); if (h) dropHeart(h.x, h.y, h.size * .8, 1); }
  }
  D.el.addEventListener('click', tapTree);

  const nameToast = $('#nameToast');
  let toastTimer = null;

  function showNameToast(text) {
    if (!nameToast) return;
    clearTimeout(toastTimer);
    nameToast.hidden = false;
    setText(nameToast, text);
    gsap.killTweensOf(nameToast);
    gsap.fromTo(nameToast, { opacity: 0, y: 6, scale: .9 }, { opacity: 1, y: 0, scale: 1, duration: .25, ease: 'back.out(2)' });
    toastTimer = setTimeout(() => {
      gsap.to(nameToast, { opacity: 0, y: -4, duration: .3, onComplete: () => { nameToast.hidden = true; } });
    }, 2200);
  }

  /* secret: tap her name three times */
  nameEl.addEventListener('click', e => {
    e.stopPropagation();
    const now = performance.now();
    taps = taps.filter(t => now - t < 2600);
    taps.push(now);
    gsap.fromTo(nameEl, { scale: 1 }, { scale: 1.04, duration: .12, yoyo: true, repeat: 1 });
    const r = nameEl.getBoundingClientRect();
    const clickX = e.clientX || (r.left + r.width / 2);
    const clickY = e.clientY || (r.top + r.height / 2);

    if (taps.length === 1) {
      Sound.sfx('soft');
      burst(clickX, clickY, 8, { speed: 180, hearts: .9 });
      showNameToast('1 of 3… tap again ✨');
    } else if (taps.length === 2) {
      Sound.sfx('chime');
      burst(clickX, clickY, 14, { speed: 220, hearts: .9 });
      showNameToast('2 of 3… one more! ✨');
    } else if (taps.length >= 3 && G.secret) {
      taps = [];
      if (nameToast) { nameToast.hidden = true; clearTimeout(toastTimer); }
      secret.hidden = false;
      Sound.sfx('sparkle');
      gsap.fromTo('.secret-card', { scale: .6, opacity: 0, rotation: -6 }, { scale: 1, opacity: 1, rotation: 0, duration: .7, ease: 'back.out(1.6)' });
      burst(r.left + r.width / 2, r.top + r.height / 2, 35, { speed: 320, hearts: .8 });
    }
  });
  secret.addEventListener('click', () => { gsap.to('.secret-card', { scale: .8, opacity: 0, duration: .3, onComplete: () => { secret.hidden = true; } }); });

  /* promise coupons (redeem asks to confirm) */
  const KEY = 'gift-coupons';
  const used = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const markUsed = i => { try { const u = used(); if (!u.includes(i)) u.push(i); localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) { /* storage blocked */ } };
  function renderCoupons() {
    list.innerHTML = '';
    const u = used();
    (G.coupons || []).forEach((c, i) => {
      const d = document.createElement('div'); d.className = 'coupon' + (u.includes(i) ? ' used' : '');
      d.innerHTML = `<div class="cp-stub">${String(i + 1).padStart(2, '0')}</div><div class="cp-body"><p class="cp-title"></p><p class="cp-text"></p><div class="cp-act"><button class="cp-redeem">Redeem</button><div class="cp-confirm" style="display:none"><button class="cp-btn-yes">Sure? ♥ Yes</button><button class="cp-btn-no">Not yet</button></div></div></div><span class="cp-stamp">REDEEMED ♥</span>`;
      setText($('.cp-title', d), c.title); setText($('.cp-text', d), c.text);
      const act = $('.cp-act', d);
      const redeemBtn = $('.cp-redeem', d);
      const confirmGroup = $('.cp-confirm', d);
      const yesBtn = $('.cp-btn-yes', d);
      const noBtn = $('.cp-btn-no', d);
      let revertTimer = null;

      const resetConfirm = () => {
        clearTimeout(revertTimer);
        confirmGroup.style.display = 'none';
        redeemBtn.style.display = '';
      };

      const addTell = () => {
        if (!G.whatsapp || $('.cp-tell', act)) return;
        const a = document.createElement('a'); a.className = 'cp-tell'; a.target = '_blank'; a.rel = 'noopener';
        a.href = `https://wa.me/${String(G.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent(`I'm redeeming my coupon: ${c.title} 💌`)}`;
        a.textContent = `tell ${G.me || 'him'} on WhatsApp`; act.appendChild(a);
      };
      if (u.includes(i)) addTell();

      redeemBtn.addEventListener('click', e => {
        e.stopPropagation();
        redeemBtn.style.display = 'none';
        confirmGroup.style.display = 'inline-flex';
        clearTimeout(revertTimer);
        revertTimer = setTimeout(resetConfirm, 5000);
      });

      noBtn.addEventListener('click', e => {
        e.stopPropagation();
        resetConfirm();
      });

      yesBtn.addEventListener('click', e => {
        e.stopPropagation();
        clearTimeout(revertTimer);
        confirmGroup.style.display = 'none';
        markUsed(i); d.classList.add('used'); Sound.sfx('chime'); vibrate([20, 30, 20]);
        gsap.fromTo($('.cp-stamp', d), { scale: 2.4, opacity: 0 }, { scale: 1, opacity: .9, duration: .45, ease: 'back.out(2)' });
        const r = d.getBoundingClientRect(); burst(r.right - 60, r.top + r.height / 2, 22, { speed: 240, hearts: .7, g: 300 });
        addTell();
      });
      list.appendChild(d);
    });
  }
  $('#cpOpen').addEventListener('click', e => {
    e.stopPropagation(); renderCoupons(); sheet.hidden = false; Sound.sfx('paper');
    gsap.fromTo('.sheet-card', { yPercent: 100 }, { yPercent: 0, duration: .6, ease: 'power3.out' });
    gsap.fromTo('.coupon', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, stagger: .08, delay: .25 });
  });
  const closeSheet = () => gsap.to('.sheet-card', { yPercent: 100, duration: .45, ease: 'power2.in', onComplete: () => { sheet.hidden = true; } });
  $('#cpClose').addEventListener('click', closeSheet);
  sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });

  /* once more: start again from the cupid screen */
  $('#replay').addEventListener('click', e => {
    e.stopPropagation();
    App.keys = 0;
    try {
      sessionStorage.removeItem('gift_keys');
      sessionStorage.removeItem('story_chap');
      sessionStorage.setItem('last_scene', 'cupid');
    } catch (err) { }
    const r = e.currentTarget.getBoundingClientRect();
    FX.clear();
    App.go('cupid', { type: 'circle', x: r.left + r.width / 2, y: r.top + r.height / 2, dur: 1.1 });
  });

  D.enter = () => {
    layoutTree(); T.on = true; T.t0 = performance.now() + 500; T.lastFall = 0;
    gsap.set(['#treeSmall', '#treeMsg', '#treeHint', '#treeBtns'], { opacity: 0 }); gsap.set(nameEl, { opacity: 0, clipPath: 'inset(0 100% 0 0)' });
    const tl = gsap.timeline({ delay: 1.4 });
    tl.fromTo('#treeSmall', { y: 10 }, { opacity: 1, y: 0, duration: 1 })
      .to(nameEl, { opacity: 1, clipPath: 'inset(0 -10% 0 0)', duration: 2.4, ease: 'power2.inOut' }, '+=.1')
      .fromTo('#treeMsg', { y: 10 }, { opacity: 1, y: 0, duration: 1.2 }, '+=.2')
      .to('#treeHint', { opacity: 1, duration: 1 }, '+=.6')
      .to('#treeBtns', { opacity: 1, duration: 1 }, '-=.3');
    FX.ambient(null);
    Sound.duck(1, 2);
  };
  D.leave = () => {
    T.on = false; sheet.hidden = true; secret.hidden = true;
    tc.width = 1; tc.height = 1; T.bakeCanvas = null; T.groundGrad = null;
    if (nameToast) { nameToast.hidden = true; clearTimeout(toastTimer); }
  };
  D.resize = () => { if (T.on) layoutTree(); };
  D.frame = (now, dt) => { if (T.on) drawTree(now, dt); };
})();
