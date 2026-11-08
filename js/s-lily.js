'use strict';
/* ============ 6 · LILY BOUQUET (port of lily_bloom.py) ============ */
(() => {
  const D = App.scene('lily', { tone: 'dark' });
  const cv = $('#lilyCv');
  const VW = 720, VH = 1280, GROUND = 1192, GUIDE = '110,150,215';
  const PALS = [
    { white: [251, 245, 249], pink: [236, 100, 166], deep: [198, 36, 114], spread: .66, spots: [[150, 16, 72], [128, 10, 58], [170, 30, 90]] },
    { white: [250, 232, 242], pink: [224, 58, 132], deep: [172, 18, 88], spread: .9, spots: [[120, 8, 52], [100, 6, 44], [140, 20, 70]] },
    { white: [253, 251, 250], pink: [244, 196, 214], deep: [220, 140, 176], spread: .42, spots: [[196, 110, 146], [176, 90, 128], [210, 130, 160]] },
    { white: [254, 246, 236], pink: [248, 142, 112], deep: [222, 82, 70], spread: .6, spots: [[150, 40, 30], [128, 30, 24], [170, 60, 40]] }
  ];
  let g = null, S = 1, OX = 0, OY = 0, P = null, T = 0, running = false, wind = 0, windV = 0, lastM = null, tilt = null, palI = 0, said = 0;

  /* ---------- geometry ---------- */
  const sstep = (e0, e1, x) => smooth((x - e0) / (e1 - e0));
  const easeIO = x => smooth(x);
  const easeOutInv = y => 1 - Math.sqrt(Math.max(0, 1 - y));
  function sway(y, t) {
    const h = Math.max(0, (GROUND - y) / 650);
    return 6.5 * Math.pow(h, 1.5) * Math.sin(.72 * t + .8 * h) + 1.6 * h * Math.sin(1.9 * t + 1.3) + wind * Math.pow(h, 1.6);
  }
  function cubic(p0, p1, p2, p3, n = 300) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
      out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
    }
    return out;
  }
  function resample(pts, spacing) {
    const s = [0];
    for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = s[s.length - 1], n = Math.max(2, Math.floor(L / spacing) + 1), out = [];
    let j = 0;
    for (let i = 0; i < n; i++) {
      const u = L * i / (n - 1);
      while (j < s.length - 2 && s[j + 1] < u) j++;
      const f = (u - s[j]) / ((s[j + 1] - s[j]) || 1);
      out.push([lerp(pts[j][0], pts[j + 1][0], f), lerp(pts[j][1], pts[j + 1][1], f)]);
    }
    return out;
  }
  function normals(m) {
    const n = m.length, out = [];
    for (let i = 0; i < n; i++) {
      const a = m[Math.max(0, i - 1)], b = m[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      out.push([-dy, dx]);
    }
    return out;
  }
  class Ribbon {
    constructor(mid, hw) {
      this.mid = mid; this.hw = hw; this.M = mid.length - 1; this.nrm = normals(mid);
      this.left = mid.map((p, i) => [p[0] + this.nrm[i][0] * hw[i], p[1] + this.nrm[i][1] * hw[i]]);
      this.right = mid.map((p, i) => [p[0] - this.nrm[i][0] * hw[i], p[1] - this.nrm[i][1] * hw[i]]);
    }
    at(t, s) {
      const k = clamp(t) * this.M, i = Math.min(this.M - 1, Math.floor(k)), f = k - i;
      const m = [lerp(this.mid[i][0], this.mid[i + 1][0], f), lerp(this.mid[i][1], this.mid[i + 1][1], f)];
      const n = [lerp(this.nrm[i][0], this.nrm[i + 1][0], f), lerp(this.nrm[i][1], this.nrm[i + 1][1], f)];
      const h = lerp(this.hw[i], this.hw[i + 1], f);
      return [m[0] + n[0] * s * h, m[1] + n[1] * s * h];
    }
    part(arr, p) {
      const k = clamp(p) * this.M, i = Math.min(this.M - 1, Math.floor(k)), f = k - i;
      const out = arr.slice(0, i + 1);
      out.push([lerp(arr[i][0], arr[i + 1][0], f), lerp(arr[i][1], arr[i + 1][1], f)]);
      return out;
    }
    path(c, p) {
      const L = this.part(this.left, p), R = this.part(this.right, p);
      c.beginPath(); c.moveTo(L[0][0], L[0][1]);
      for (let i = 1; i < L.length; i++) c.lineTo(L[i][0], L[i][1]);
      for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
      c.closePath();
      return [L[L.length - 1], R[R.length - 1]];
    }
  }
  const line = (c, pts) => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); c.stroke(); };
  const toScr = (x, y) => [OX + x * S, OY + y * S];

  /* ---------- plant parts ---------- */
  class Stem {
    constructor(ctrl, w0, w1, start, dur) { this.ctrl = ctrl; this.pts = resample(cubic(...ctrl), 5); this.w0 = w0; this.w1 = w1; this.start = start; this.dur = dur; }
    frac(t) { return t > this.start ? ease2((t - this.start) / this.dur) : 0; }
    point(f) { const n = this.pts.length, i = f * (n - 1), a = Math.floor(i), b = Math.min(a + 1, n - 1); return [lerp(this.pts[a][0], this.pts[b][0], i - a), lerp(this.pts[a][1], this.pts[b][1], i - a)]; }
    live(t) {
      const f = this.frac(t); if (f <= 0) return null;
      const n = this.pts.length, k = f * (n - 1), i = Math.floor(k);
      const pts = this.pts.slice(0, Math.min(n, i + 2)).map(p => [p[0], p[1]]);
      if (i + 1 < n) pts[pts.length - 1] = [lerp(this.pts[i][0], this.pts[i + 1][0], k - i), lerp(this.pts[i][1], this.pts[i + 1][1], k - i)];
      if (pts.length < 2) return null;
      for (const p of pts) p[0] += sway(p[1], t);
      return { pts, f };
    }
    draw(c, t) {
      const L = this.live(t); if (!L) return null;
      const { pts, f } = L, n = pts.length, nr = normals(pts), N = this.pts.length;
      const w = i => lerp(this.w0, this.w1, i / (N - 1));
      const side = (k1, k2) => { c.beginPath(); for (let i = 0; i < n; i++) { const ww = w(i); c.lineTo(pts[i][0] - nr[i][0] * ww * k1, pts[i][1] - nr[i][1] * ww * k1); } for (let i = n - 1; i >= 0; i--) { const ww = w(i); c.lineTo(pts[i][0] + nr[i][0] * ww * k2, pts[i][1] + nr[i][1] * ww * k2); } c.closePath(); c.fill(); };
      c.fillStyle = 'rgb(18,62,28)'; side(.5, .5);
      c.fillStyle = 'rgb(40,118,50)'; side(.36, .16);
      c.strokeStyle = 'rgba(120,196,104,.9)'; c.lineWidth = 1.1;
      c.beginPath(); for (let i = 0; i < n; i++) { const ww = w(i) * .18; c.lineTo(pts[i][0] - nr[i][0] * ww, pts[i][1] - nr[i][1] * ww); } c.stroke();
      return f < .999 ? pts[n - 1] : null;
    }
  }
  function mkLeaf(base, side, angDeg, L, Wmax, droop, start, dur, rng) {
    const M = 40, ang = angDeg * Math.PI / 180, dx = side * Math.sin(ang), dy = -Math.cos(ang), twist = -0.05 + rng() * .13;
    const mid = [], hw = [];
    let mx = 0; const prof = [];
    for (let i = 0; i <= M; i++) { const t = i / M; mid.push([base[0] + dx * L * t + side * twist * L * Math.sin(Math.PI * t), base[1] + dy * L * t + droop * L * t * t]); const p = Math.pow(t, .55) * Math.pow(1 - t, 1.15); prof.push(p); mx = Math.max(mx, p); }
    prof.forEach(p => hw.push(Wmax * p / mx + .8));
    return { rib: new Ribbon(mid, hw), baseY: base[1], start, dur, p: t => (t > start ? ease2((t - start) / dur) : 0) };
  }
  function mkBud(base, tip, Wmax, tipCol, start, dur, bow) {
    const M = 36, ax = [tip[0] - base[0], tip[1] - base[1]], l = Math.hypot(...ax), perp = [-ax[1] / l, ax[0] / l];
    const mid = [], prof = []; let mx = 0;
    for (let i = 0; i <= M; i++) { const t = i / M; mid.push([base[0] + ax[0] * t + perp[0] * bow * Math.sin(Math.PI * t), base[1] + ax[1] * t + perp[1] * bow * Math.sin(Math.PI * t)]); const p = Math.pow(t, .45) * Math.pow(1 - t, .7); prof.push(p); mx = Math.max(mx, p); }
    return { rib: new Ribbon(mid, prof.map(p => Wmax * p / mx + 2)), tipCol, baseY: base[1], start, dur, p: t => (t > start ? easeIO((t - start) / dur) : 0) };
  }
  function mkFlower(cx, cy, L, rot, squash, phi, order, rng, pal) {
    const F = { cx, cy, L, rot, squash, phi, pal, petals: [], cache: null };
    const toScreen = (x, y, sq = squash) => { y *= sq; const c = Math.cos(phi), s = Math.sin(phi); return [cx + x * c - y * s, cy + x * s + y * c]; };
    for (const k of [0, 2, 4, 1, 3, 5]) {
      const inner = k % 2 === 1, a = rot + k * Math.PI / 3 + (rng() * .14 - .07);
      const Lp = L * (inner ? .93 : 1) * (.95 + rng() * .09), Wm = L * (inner ? .215 : .165), M = 48, dev = rng() * .4 - .2, ph = rng() * 6;
      const mid = [], prof = []; let mx = 0;
      for (let i = 0; i <= M; i++) {
        const t = i / M, an = a + dev * t * t, r = Lp * t;
        mid.push(toScreen(r * Math.cos(an), r * Math.sin(an)));
        const p = Math.pow(t, .6) * Math.pow(1 - t, .95); prof.push([p, t, an]); mx = Math.max(mx, p);
      }
      const hw = prof.map(([p, t, an]) => {
        const ruffle = 1 + .04 * Math.sin(t * 36 + ph) * sstep(.25, .5, t), pa = an + Math.PI / 2;
        const fs = Math.sqrt(Math.cos(pa) ** 2 + (squash * Math.sin(pa)) ** 2);
        return Wm * (p / mx) * ruffle * fs + .6;
      });
      const rib = new Ribbon(mid, hw);
      const spots = [];
      for (let i = 0; i < (inner ? 30 : 24); i++) { const st = .09 + .48 * Math.pow(rng(), 1.4), ss = (rng() * 1.24 - .62) * (1 - .3 * st); spots.push([rib.at(st, ss), (.8 + rng() * 1.6) * L / 150, pal.spots[(rng() * 3) | 0], st]); }
      F.petals.push({ rib, spots });
    }
    const j0 = 7 + order * .55, f0 = 10 + order * .55;
    F.wire = F.petals.map((_, j) => [j0 + j * .11, 1.3]);
    F.fill = F.petals.map((_, j) => [f0 + j * .09, 1.7]);
    F.fillEnd = Math.max(...F.fill.map(([a, b]) => a + b));
    F.stamenT = [f0 + 1.45, 1.3];
    const sq = (squash + 1) / 2;
    F.fil = [];
    for (let j = 0; j < 6; j++) {
      const a = rot + Math.PI / 6 + j * Math.PI / 3 + (rng() * .5 - .25), Ls = L * (.4 + rng() * .12), sgn = rng() < .5 ? -1 : 1, pts = [];
      for (let i = 0; i < 16; i++) { const t = i / 15, an = a + sgn * .25 * t * t; pts.push(toScreen(Ls * t * Math.cos(an), Ls * t * Math.sin(an), sq)); }
      F.fil.push(pts);
    }
    const pa = rot + rng() * TAU; F.pistil = [];
    for (let i = 0; i < 16; i++) { const t = i / 15, an = pa + .2 * t * t; F.pistil.push(toScreen(L * .55 * t * Math.cos(an), L * .55 * t * Math.sin(an), sq)); }
    F.toScreen = toScreen; F.burst = false;
    return F;
  }

  function petalFill(c, rib, pal) {
    const a = rib.mid[0], b = rib.mid[rib.M], gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
    const thr = [190, 214, 120], sp = pal.spread;
    gr.addColorStop(0, rgbStr(thr)); gr.addColorStop(.09, rgbStr(mixRGB(thr, pal.deep, .7)));
    gr.addColorStop(Math.max(.12, sp * .45), rgbStr(pal.pink)); gr.addColorStop(Math.min(.9, sp), rgbStr(mixRGB(pal.pink, pal.white, .6)));
    gr.addColorStop(.93, rgbStr(pal.white)); gr.addColorStop(1, rgbStr(mixRGB(pal.white, pal.pink, .3)));
    return gr;
  }
  function drawPetal(c, pt, p, pal) {
    const rib = pt.rib;
    rib.path(c, p); c.fillStyle = petalFill(c, rib, pal); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = 1; c.stroke();
    // shading on one side for depth
    const L = rib.part(rib.left, p), Mi = rib.part(rib.mid, p);
    c.beginPath(); c.moveTo(Mi[0][0], Mi[0][1]); for (const q of L) c.lineTo(q[0], q[1]); for (let i = Mi.length - 1; i >= 0; i--) c.lineTo(Mi[i][0], Mi[i][1]);
    c.fillStyle = 'rgba(90,0,40,.08)'; c.fill();
    c.strokeStyle = rgbStr(pal.deep, .55); c.lineWidth = 2.2; line(c, rib.part(rib.mid, Math.min(p, .82)));
    for (const [pos, r, col, st] of pt.spots) { if (st > p) continue; c.fillStyle = rgbStr(col, .9); c.beginPath(); c.arc(pos[0], pos[1], r, 0, TAU); c.fill(); }
  }
  function drawStamens(c, F, gr) {
    if (gr <= 0) return;
    const sc = F.L / 150;
    for (const pts of [F.pistil, ...F.fil]) {
      const pil = pts === F.pistil, n = Math.max(2, Math.floor(gr * (pts.length - 1)) + 1);
      c.strokeStyle = pil ? 'rgb(176,206,120)' : 'rgb(222,236,200)'; c.lineWidth = pil ? 3 : 1.8; c.lineCap = 'round';
      line(c, pts.slice(0, n));
      if (gr > .82) {
        const k = sstep(.82, 1, gr), end = pts[pts.length - 1];
        if (pil) { c.fillStyle = 'rgb(120,156,64)'; for (let q = 0; q < 3; q++) { const th = q * 2.094 + .4; c.beginPath(); c.arc(end[0] + Math.cos(th) * 3 * sc, end[1] + Math.sin(th) * 3 * sc, Math.max(.5, 3.2 * sc * k), 0, TAU); c.fill(); } }
        else {
          const p3 = pts[pts.length - 3], ang = Math.atan2(end[1] - p3[1], end[0] - p3[0]) + Math.PI / 2;
          c.fillStyle = 'rgb(162,62,28)'; c.beginPath(); c.ellipse(end[0], end[1], Math.max(.3, 7.5 * sc * k), Math.max(.2, 2.8 * sc * k), ang, 0, TAU); c.fill();
          c.fillStyle = 'rgba(232,130,72,.8)'; c.beginPath(); c.ellipse(end[0] - .8, end[1] - .8, Math.max(.2, 4 * sc * k), Math.max(.1, 1 * sc * k), ang, 0, TAU); c.fill();
        }
      }
    }
  }

  /* ---------- scene ---------- */
  function makeScene(seed) {
    const rng = rngFrom(seed), jx = a => rng() * 2 * a - a, pal = PALS[palI % PALS.length];
    const mainCtrl = [[366 + jx(8), GROUND], [352 + jx(20), 1000], [380 + jx(20), 760], [360 + jx(10), 556]];
    const main = new Stem(mainCtrl, 9.5, 6, .25, 3.2);
    const ped = (f, end, c1, c2, w = [5, 3.6]) => {
      const st = main.point(f), start = main.start + main.dur * easeOutInv(f);
      return new Stem([st, [st[0] + c1[0], st[1] + c1[1]], [end[0] + c2[0], end[1] + c2[1]], end], w[0], w[1], start, 1.1);
    };
    const A = [288 + jx(18), 392 + jx(16)], B = [468 + jx(14), 484 + jx(16)], C = [298 + jx(18), 644 + jx(14)];
    const b1 = [A[0] + 34 + jx(8), A[1] - 88 + jx(6)], b2 = [398 + jx(10), 314 + jx(10)];
    const pedicels = [ped(1, b1, [5, -90], [10, 80], [4.6, 3.6]), ped(.93, b2, [25, -60], [-10, 70], [3.8, 3]), ped(1, A, [-5, -50], [30, 45]), ped(.86, B, [30, -20], [-40, 40]), ped(.74, C, [-10, -40], [25, 30])];
    const spec = [[.05, -1, 62, 185, 17, .4], [.12, 1, 58, 195, 18, .38], [.2, -1, 52, 188, 17, .32], [.28, 1, 55, 178, 17, .3], [.36, -1, 48, 168, 16, .26], [.44, 1, 50, 158, 15, .24], [.52, -1, 44, 144, 14, .2], [.6, 1, 46, 130, 13, .18]];
    const flip = rng() < .5 ? -1 : 1;
    const leaves = spec.map(([f, side, ang, L, Wm, droop], i) => {
      side *= flip; const b = main.point(f + jx(.015));
      return mkLeaf([b[0] + side * 3, b[1]], side, ang + jx(6), L * (.9 + rng() * .18), Wm, droop + jx(.05), 3.7 + i * .32, 1.4, rng);
    });
    const buds = [mkBud(b2, [b2[0] + 15 + jx(6), b2[1] - 78 + jx(8)], 13, [178, 196, 118], 5.9, 1.6, -3), mkBud(b1, [b1[0] - 17 + jx(8), b1[1] - 140 + jx(10)], 27, pal.pink, 6.3, 1.9, 6)];
    const flowers = [
      mkFlower(A[0], A[1], 150 + jx(8), -1.8 + jx(.3), .8 + jx(.05), -.25 + jx(.1), 1, rng, pal),
      mkFlower(B[0], B[1], 138 + jx(6), -1.35 + jx(.3), .72 + jx(.05), .35 + jx(.1), 2, rng, pal),
      mkFlower(C[0], C[1], 152 + jx(8), -1.55 + jx(.3), .86 + jx(.05), .1 + jx(.1), 0, rng, pal)
    ];
    return { main, pedicels, leaves, buds, flowers, pal, stems: [...pedicels, main] };
  }

  function layout() {
    S = Math.min(VP.W / VW, VP.H / VH) * (VP.W > VP.H ? .9 : 1.04);
    OX = (VP.W - VW * S) / 2; OY = VP.H - (GROUND + 70) * S;
    g = sizeCanvas(cv);
    if (P) P.flowers.forEach(f => { f.cache = null; });
  }
  function setT() { g.setTransform(VP.DPR * S, 0, 0, VP.DPR * S, VP.DPR * OX, VP.DPR * OY); }
  function emit(n, fn) { const x = n; const k = Math.floor(x) + (Math.random() < x - Math.floor(x) ? 1 : 0); for (let i = 0; i < k; i++) fn(); }
  function frontSparks(a, b, cols, rate, dt) {
    emit(rate * dt, () => {
      const u = Math.random(), x = lerp(a[0], b[0], u), y = lerp(a[1], b[1], u), [sx, sy] = toScr(x, y);
      FX.add({ type: 'glow', sprite: FX.S.glow[pick(cols)], x: sx, y: sy, vx: rand(-25, 25), vy: rand(-30, 10), life: rand(.4, 1), size: rand(5, 11), add: true, fadeIn: .05 });
    });
  }

  function cacheFlower(F) {
    const pad = F.L * 1.15, x0 = F.cx - pad, y0 = F.cy - pad, w = pad * 2, h = pad * 2;
    const c = document.createElement('canvas'); c.width = Math.ceil(w * S * VP.DPR); c.height = Math.ceil(h * S * VP.DPR);
    const cg = c.getContext('2d'); cg.setTransform(S * VP.DPR, 0, 0, S * VP.DPR, -x0 * S * VP.DPR, -y0 * S * VP.DPR);
    for (const pt of F.petals) drawPetal(cg, pt, 1, P.pal);
    drawStamens(cg, F, 1);
    F.cache = { c, x0, y0, w, h };
  }

  function render(t, dt) {
    const c = g;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); setT();
    const pal = P.pal;
    // halo
    const hk = sstep(13, 15.5, t);
    if (hk > 0) for (const f of P.flowers) {
      const x = f.cx + sway(f.cy, t), gr = c.createRadialGradient(x, f.cy, 0, x, f.cy, 300);
      gr.addColorStop(0, rgbStr(pal.pink, .24 * hk)); gr.addColorStop(1, rgbStr(pal.pink, 0));
      c.fillStyle = gr; c.fillRect(x - 300, f.cy - 300, 600, 600);
    }
    // blueprint construction lines
    const ga = sstep(.2, 1, t) * (1 - sstep(11.5, 14, t));
    if (ga > .01) {
      c.lineWidth = 1;
      for (const st of P.stems) {
        const k = sstep(st.start - .4, st.start + .2, t) * ga; if (k <= .01) continue;
        const Pc = st.ctrl.map(p => [p[0] + sway(p[1], t), p[1]]);
        c.strokeStyle = `rgba(${GUIDE},${.55 * k})`; c.setLineDash([]); line(c, [Pc[0], Pc[1]]); line(c, [Pc[3], Pc[2]]);
        c.strokeStyle = `rgba(${GUIDE},${.3 * k})`; c.setLineDash([5, 4]); line(c, [Pc[1], Pc[2]]); c.setLineDash([]);
        c.strokeStyle = `rgba(${GUIDE},${.9 * k})`; Pc.forEach((p, i) => { const r = i === 0 || i === 3 ? 3 : 2; c.strokeRect(p[0] - r, p[1] - r, 2 * r + 1, 2 * r + 1); });
      }
      for (const f of P.flowers) {
        const w0 = f.wire[0][0] - .6, k = sstep(w0, w0 + .4, t) * ga; if (k <= .01) continue;
        const q = easeIO((t - w0) / 1.1), ox = sway(f.cy, t), cc = [f.cx + ox, f.cy];
        for (const [rr, aa] of [[f.L, .45], [f.L * .55, .3]]) {
          c.strokeStyle = `rgba(${GUIDE},${aa * k})`; c.beginPath();
          const N = Math.max(3, Math.floor(80 * q));
          for (let i = 0; i <= N; i++) { const th = TAU * q * i / N + f.rot, p = f.toScreen(rr * Math.cos(th), rr * Math.sin(th)); c.lineTo(p[0] + ox, p[1]); }
          c.stroke();
        }
        c.strokeStyle = `rgba(${GUIDE},${.4 * k})`; c.setLineDash([4, 4]);
        for (const pt of f.petals) { const tip = pt.rib.mid[pt.rib.M]; line(c, [cc, [cc[0] + (tip[0] + ox - cc[0]) * q, cc[1] + (tip[1] - cc[1]) * q]]); }
        c.setLineDash([]); c.strokeStyle = `rgba(${GUIDE},${.9 * k})`;
        line(c, [[cc[0] - 9, cc[1]], [cc[0] + 9, cc[1]]]); line(c, [[cc[0], cc[1] - 9], [cc[0], cc[1] + 9]]);
      }
    }
    // stems + the sparkles that build them
    for (const st of P.stems) {
      const tip = st.draw(c, t);
      if (tip && dt > 0) {
        const [tx, ty] = toScr(tip[0], tip[1]);
        FX.add({ type: 'glow', sprite: FX.S.glow.lime, x: tx, y: ty, life: .12, size: 18, add: true, fadeIn: .01 });
        emit(38 * dt, () => {
          const a = rand(0, TAU), rad = rand(60, 220) * S, life = rand(.45, .8);
          FX.add({ type: 'glow', sprite: FX.S.glow[pick(['gold', 'lime', 'green', 'white'])], x: tx + Math.cos(a) * rad, y: ty + Math.sin(a) * rad * .8, vx: -Math.cos(a) * rad / life, vy: -Math.sin(a) * rad * .8 / life, life, size: rand(5, 11), add: true, fadeIn: life * .5 });
        });
      }
    }
    // leaves
    for (const lf of P.leaves) {
      const p = lf.p(t); if (p <= 0) continue;
      const off = sway(lf.baseY, t); c.save(); c.translate(off, 0);
      const rib = lf.rib, [fa, fb] = rib.path(c, p), a = rib.mid[0], b = rib.mid[rib.M];
      const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, 'rgb(96,140,58)'); gr.addColorStop(.2, 'rgb(38,124,50)'); gr.addColorStop(1, 'rgb(24,90,36)');
      c.fillStyle = gr; c.fill();
      const Lp = rib.part(rib.left, p), Mp = rib.part(rib.mid, p);
      c.beginPath(); c.moveTo(Mp[0][0], Mp[0][1]); for (const q of Lp) c.lineTo(q[0], q[1]); for (let i = Mp.length - 1; i >= 0; i--) c.lineTo(Mp[i][0], Mp[i][1]);
      c.fillStyle = 'rgba(140,214,110,.22)'; c.fill();
      c.strokeStyle = 'rgba(12,50,22,.7)'; c.lineWidth = 1.2; line(c, Mp);
      if (p < 1) { c.strokeStyle = 'rgba(150,255,160,.85)'; c.lineWidth = 1.4; line(c, [fa, fb]); if (dt > 0) frontSparks([fa[0] + off, fa[1]], [fb[0] + off, fb[1]], ['lime', 'green', 'gold'], 38, dt); }
      c.restore();
    }
    // buds
    for (const bd of P.buds) {
      const p = bd.p(t); if (p <= 0) continue;
      const off = sway(bd.baseY, t); c.save(); c.translate(off, 0);
      const rib = bd.rib, [fa, fb] = rib.path(c, p), a = rib.mid[0], b = rib.mid[rib.M];
      const gr = c.createLinearGradient(a[0], a[1], b[0], b[1]);
      gr.addColorStop(0, 'rgb(64,142,58)'); gr.addColorStop(.5, 'rgb(150,196,120)'); gr.addColorStop(.92, rgbStr(bd.tipCol)); gr.addColorStop(1, rgbStr(mixRGB(bd.tipCol, [255, 255, 255], .2)));
      c.fillStyle = gr; c.fill();
      c.strokeStyle = 'rgba(255,245,250,.35)'; c.lineWidth = 1.4; line(c, rib.part(rib.left, p * .9).map((q, i) => [lerp(q[0], rib.mid[Math.min(i, rib.M)][0], .45), lerp(q[1], rib.mid[Math.min(i, rib.M)][1], .45)]));
      if (p < 1) { c.strokeStyle = 'rgba(255,170,210,.85)'; line(c, [fa, fb]); if (dt > 0) frontSparks([fa[0] + off, fa[1]], [fb[0] + off, fb[1]], ['pink', 'lime', 'white'], 26, dt); }
      c.restore();
    }
    // flowers: pigment, stamens
    for (const f of P.flowers) {
      const off = sway(f.cy, t);
      const doneAll = t > f.fillEnd + .05 && t > f.stamenT[0] + f.stamenT[1] + .05;
      if (doneAll) {
        if (!f.cache) cacheFlower(f);
        const k = f.cache; c.drawImage(k.c, k.x0 + off, k.y0, k.w, k.h);
      } else {
        c.save(); c.translate(off, 0);
        f.petals.forEach((pt, j) => { const [s0, du] = f.fill[j]; const p = t > s0 ? easeIO((t - s0) / du) : 0; if (p > 0) drawPetal(c, pt, p, P.pal); });
        const [s0, du] = f.stamenT, gr = t > s0 ? ease2((t - s0) / du) : 0;
        drawStamens(c, f, gr);
        c.restore();
        if (gr > .95 && !f.burst) {
          f.burst = true;
          for (const a of f.fil) { const [sx, sy] = toScr(a[a.length - 1][0] + off, a[a.length - 1][1]); glowBurst(sx, sy, 6, ['gold', 'white'], 60, 1.2); }
        }
      }
    }
    // glowing wireframe + pigment fronts
    for (const f of P.flowers) {
      const off = sway(f.cy, t);
      c.save(); c.translate(off, 0);
      f.petals.forEach((pt, j) => {
        const [w0, wd] = f.wire[j]; if (t < w0) return;
        const q = easeIO((t - w0) / wd), [s0, du] = f.fill[j], pf = t > s0 ? easeIO((t - s0) / du) : 0;
        const a = pf <= 0 ? 1 : t < f.fillEnd ? 1 - .75 * pf : .25 * (1 - clamp((t - f.fillEnd) / 1.2));
        const rib = pt.rib;
        if (a > .01) {
          if (q >= .999) {
            if (!pt.wireCache) {
              const allPts = [...rib.left, ...rib.right, ...rib.mid];
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              for (const p of allPts) {
                if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
                if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
              }
              const pad = 24, x0 = minX - pad, y0 = minY - pad, w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
              const oc = document.createElement('canvas'); oc.width = Math.ceil(w * S * VP.DPR); oc.height = Math.ceil(h * S * VP.DPR);
              const og = oc.getContext('2d'); og.setTransform(S * VP.DPR, 0, 0, S * VP.DPR, -x0 * S * VP.DPR, -y0 * S * VP.DPR);
              og.shadowColor = 'rgba(255,110,190,.9)'; og.shadowBlur = 8 * VP.DPR;
              og.strokeStyle = 'rgba(255,178,222,1)'; og.lineWidth = 1.3;
              line(og, rib.left); line(og, rib.right);
              og.strokeStyle = 'rgba(255,130,196,.5)'; line(og, rib.mid);
              og.strokeStyle = 'rgba(255,150,210,.38)';
              for (const tr of [.2, .4, .6, .8]) { const i = Math.floor(tr * rib.M); if (i < rib.left.length - 1) line(og, [rib.left[i], rib.right[i]]); }
              pt.wireCache = { c: oc, x0, y0, w, h };
            }
            c.save(); c.globalAlpha = a;
            c.drawImage(pt.wireCache.c, pt.wireCache.x0, pt.wireCache.y0, pt.wireCache.w, pt.wireCache.h);
            c.restore();
          } else {
            c.save(); c.shadowColor = 'rgba(255,110,190,.9)'; c.shadowBlur = 8 * VP.DPR;
            c.strokeStyle = `rgba(255,178,222,${a})`; c.lineWidth = 1.3;
            const Lp = rib.part(rib.left, q), Rp = rib.part(rib.right, q);
            line(c, Lp); line(c, Rp);
            c.strokeStyle = `rgba(255,130,196,${a * .5})`; line(c, rib.part(rib.mid, q));
            c.strokeStyle = `rgba(255,150,210,${a * .38})`;
            for (const tr of [.2, .4, .6, .8]) { const i = Math.floor(tr * rib.M); if (i < Lp.length - 1) line(c, [rib.left[i], rib.right[i]]); }
            c.restore();
            if (q < .999 && dt > 0) {
              for (const P2 of [Lp[Lp.length - 1], Rp[Rp.length - 1]]) { const [sx, sy] = toScr(P2[0] + off, P2[1]); FX.add({ type: 'glow', sprite: FX.S.glow.pink, x: sx, y: sy, life: .1, size: 16, add: true, fadeIn: .01 }); }
              if (Math.random() < 18 * dt) { const P2 = Math.random() < .5 ? Lp[Lp.length - 1] : Rp[Rp.length - 1]; const [sx, sy] = toScr(P2[0] + off, P2[1]); FX.add({ type: 'glow', sprite: FX.S.glow[pick(['pink', 'white'])], x: sx, y: sy, vx: rand(-20, 20), vy: rand(-25, 5), life: rand(.4, .9), size: rand(5, 10), add: true, fadeIn: .03 }); }
            }
          }
        }
        if (pf > 0 && pf < 1) {
          const L2 = rib.part(rib.left, pf), R2 = rib.part(rib.right, pf), fa = L2[L2.length - 1], fb = R2[R2.length - 1];
          c.strokeStyle = 'rgba(255,200,235,.85)'; c.lineWidth = 1.5; line(c, [fa, fb]);
          if (dt > 0) frontSparks([fa[0] + off, fa[1]], [fb[0] + off, fb[1]], ['pink', 'white', 'rose'], 30, dt);
        }
      });
      c.restore();
    }
    // pollen
    if (t > 14.5 && dt > 0 && Math.random() < 10 * dt) {
      const f = pick(P.flowers), a = pick(f.fil), e = a[a.length - 1], [sx, sy] = toScr(e[0] + sway(f.cy, t), e[1]);
      FX.add({ type: 'glow', sprite: FX.S.glow[pick(['gold', 'gold', 'white', 'pink'])], x: sx, y: sy, vx: rand(-12, 12), vy: rand(-35, -10), life: rand(1.5, 3), size: rand(5, 10), add: true, fadeIn: .2 });
    }
  }

  function regrow() {
    palI++; P = makeScene((Math.random() * 1e9) | 0); T = 0; said = 1;
    gsap.fromTo('#lilyToast', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .8, yoyo: true, repeat: 1, repeatDelay: 1.2 });
    Sound.sfx('sparkle');
  }
  D.el.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (T > 14.5) regrow();
    else glowBurst(e.clientX, e.clientY, 12, ['pink', 'gold', 'white'], 160, .9);
  });
  D.el.addEventListener('pointermove', e => {
    const x = e.clientX / S, y = e.clientY / S, now = performance.now();
    if (lastM) {
      const dtm = Math.max(.008, (now - lastM[2]) / 1000), vx = (x - lastM[0]) / dtm;
      const near = Math.exp(-((((y - OY / S) - 600) / 500) ** 2));
      windV += clamp(vx, -2500, 2500) * .02 * near;
    }
    lastM = [x, y, now];
  });
  D.el.addEventListener('pointerleave', () => { lastM = null; });
  addEventListener('deviceorientation', e => { if (App.cur === D && e.gamma != null) tilt = clamp(e.gamma, -45, 45); });
  $('#lilyNext').addEventListener('click', () => App.go('letter', { type: 'dip', color: '#1a0509', dur: 1.8 }));

  D.enter = () => {
    palI = Math.floor(Math.random() * PALS.length);
    P = makeScene(20240214); T = -.6; running = true; wind = 0; windV = 0; said = 0; tilt = null;
    layout();
    gsap.set(['#lilyL1', '#lilyL2', '#lilyL3', '#lilyHint'], { opacity: 0 });
    setText($('#lilyL1'), LINES.lily1 || "Since I can't put flowers in your hands today,");
    setText($('#lilyL2'), LINES.lily2 || 'I grew you some.');
    setText($('#lilyL3'), LINES.lily3 || "Flowers fade. These won't.");
    hideBtn($('#lilyNext'));
    FX.ambient('dust', 4);
  };
  D.leave = () => {
    running = false;
    cv.width = 1; cv.height = 1;
    if (P && P.flowers) {
      P.flowers.forEach(f => {
        f.cache = null;
        if (f.petals) f.petals.forEach(pt => { pt.wireCache = null; });
      });
    }
  };
  D.resize = () => { if (running) layout(); };
  D.frame = (now, dt) => {
    if (!running || !P) return;
    T += dt;
    windV += ((tilt != null ? tilt * .9 : 0) - wind) * 28 * dt;
    windV *= Math.exp(-3.2 * dt);
    wind = clamp(wind + windV * dt, -60, 60);
    if (said === 0 && T > .6) { said = .5; fadeIn($('#lilyL1'), 0, 1.4); fadeIn($('#lilyL2'), 1.6, 1.6); }
    if (said < 1 && T > 15.2) { said = 1; fadeIn($('#lilyL3'), 0, 1.4); fadeIn($('#lilyHint'), 1.2, 1); showBtn($('#lilyNext'), 2.4); Sound.sfx('soft'); }
    if (T >= 0) render(T, dt);
  };
})();
