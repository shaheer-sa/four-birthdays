'use strict';
/* ============ shared helpers, particles, sound, scene manager ============ */
const DEV = ['localhost', '127.0.0.1', ''].includes(location.hostname) || location.protocol === 'file:';
window.DEV = DEV;
const G = window.GIFT || {};
const HER = G.her || 'my love';
const LINES = G.lines || {};
/* nicknames from config.js: [{ text, meaning }] — used by the word rose and the heart of languages */
const NICKS = (G.nicknames || []).filter(n => n && n.text).map(n => ({ text: String(n.text), meaning: n.meaning || 'just for you' }));
const IS_RTL = t => /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(t);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[(Math.random() * a.length) | 0];
const ease3 = t => 1 - Math.pow(1 - clamp(t), 3);
const ease2 = t => 1 - Math.pow(1 - clamp(t), 2);
const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeOutBack = t => { const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU = Math.PI * 2;

function rngFrom(seed) {
  let s = seed | 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
function rgbStr(c, a) { return a == null ? `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})` : `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
function mixRGB(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
function mixHex(a, b, t) { return rgbStr(mixRGB(hex2rgb(a), hex2rgb(b), clamp(t))); }
function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* not supported */ } }
function setText(el, t) { if (el) el.textContent = t == null ? '' : t; }

/* ---------- viewport + canvases ---------- */
const VP = { W: innerWidth, H: innerHeight, DPR: Math.min(2, window.devicePixelRatio || 1) };
function sizeCanvas(c, w = VP.W, h = VP.H) {
  c.width = Math.max(1, Math.round(w * VP.DPR));
  c.height = Math.max(1, Math.round(h * VP.DPR));
  const g = c.getContext('2d');
  g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);
  return g;
}

/* ---------- sprites ---------- */
function heartPath(g) {
  g.beginPath();
  g.moveTo(0, .9);
  g.bezierCurveTo(-.2, .7, -1, .25, -1, -.25);
  g.bezierCurveTo(-1, -.75, -.4, -1, 0, -.5);
  g.bezierCurveTo(.4, -1, 1, -.75, 1, -.25);
  g.bezierCurveTo(1, .25, .2, .7, 0, .9);
  g.closePath();
}
function mkSprite(size, fn) { const c = document.createElement('canvas'); c.width = c.height = size; fn(c.getContext('2d'), size); return c; }
function heartSprite(color) {
  return mkSprite(96, g => {
    g.translate(48, 50); g.scale(40, 40); heartPath(g);
    const gr = g.createRadialGradient(-.42, -.45, .04, -.1, -.1, 1.25);
    gr.addColorStop(0, mixHex(color, '#ffffff', .65)); gr.addColorStop(.45, color); gr.addColorStop(1, mixHex(color, '#5a0020', .35));
    g.fillStyle = gr; g.fill();
    g.globalAlpha = .7; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(-.5, -.46, .2, .1, -.65, 0, TAU); g.fill();
  });
}
function petalSprite(c1, c2) {
  return mkSprite(64, g => {
    g.translate(32, 32); g.beginPath(); g.moveTo(0, -27);
    g.bezierCurveTo(4, -22, 9, -25, 13, -21); g.bezierCurveTo(24, -6, 14, 18, 0, 28);
    g.bezierCurveTo(-14, 18, -24, -6, -13, -21); g.bezierCurveTo(-9, -25, -4, -22, 0, -27); g.closePath();
    const gr = g.createLinearGradient(0, -27, 0, 28); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fill();
    g.globalAlpha = .3; g.strokeStyle = '#fff'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(4, 2, 0, 20); g.stroke();
  });
}
function blossomSprite(col, center) {
  return mkSprite(64, g => {
    g.translate(32, 32);
    for (let i = 0; i < 5; i++) {
      g.save(); g.rotate(i * TAU / 5); g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(-11, -8, -12, -22, -4, -27); g.lineTo(0, -23); g.lineTo(4, -27); g.bezierCurveTo(12, -22, 11, -8, 0, 0);
      const gr = g.createLinearGradient(0, 0, 0, -27); gr.addColorStop(0, center); gr.addColorStop(.45, col); gr.addColorStop(1, mixHex(col, '#ffffff', .5));
      g.fillStyle = gr; g.fill(); g.restore();
    }
    g.fillStyle = '#e48aa6';
    for (let i = 0; i < 7; i++) { const a = i * .9; g.beginPath(); g.arc(Math.cos(a) * 5, Math.sin(a) * 5, 1.6, 0, TAU); g.fill(); }
  });
}
function mapleSprite(col, dark) {
  return mkSprite(72, g => {
    g.translate(36, 33); g.beginPath();
    const N = 160;
    for (let i = 0; i <= N; i++) {
      const rel = i / N * TAU, th = rel - Math.PI / 2;
      const lobe = Math.pow(Math.abs(Math.cos(2.5 * rel)), .7);
      let r = (.4 + .6 * lobe) * (1 + .05 * Math.sin(rel * 30));
      const x = Math.cos(th) * r * 28, y = Math.sin(th) * r * 28;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath();
    const gr = g.createRadialGradient(-6, -8, 2, 0, 0, 32); gr.addColorStop(0, mixHex(col, '#ffe9b0', .35)); gr.addColorStop(.6, col); gr.addColorStop(1, dark);
    g.fillStyle = gr; g.fill();
    g.strokeStyle = dark; g.globalAlpha = .55; g.lineWidth = 1.2;
    for (let k = 0; k < 5; k++) { const th = -Math.PI / 2 + k * TAU / 5; g.beginPath(); g.moveTo(0, 4); g.lineTo(Math.cos(th) * 24, Math.sin(th) * 24); g.stroke(); }
    g.globalAlpha = 1; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 6); g.lineTo(2, 30); g.stroke();
  });
}
function ovalLeafSprite(col, dark) {
  return mkSprite(64, g => {
    g.translate(32, 32); g.rotate(.5); g.beginPath(); g.moveTo(0, -26); g.quadraticCurveTo(17, -4, 0, 26); g.quadraticCurveTo(-17, -4, 0, -26);
    const gr = g.createLinearGradient(-12, 0, 12, 0); gr.addColorStop(0, dark); gr.addColorStop(1, col); g.fillStyle = gr; g.fill();
    g.strokeStyle = dark; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 29); g.stroke();
  });
}
function glowSprite(rgb) {
  return mkSprite(64, g => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.18, `rgba(${rgb},1)`); gr.addColorStop(.5, `rgba(${rgb},.32)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  });
}
function drawSpark(g, x, y, r) {
  g.beginPath(); g.moveTo(x, y - r);
  g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r);
  g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill();
}

/* ---------- particles (top layer) ---------- */
const FX = {
  c: null, g: null, parts: [], amb: null, acc: 0, S: {}, cleared: false,
  init() {
    this.c = $('#fx'); this.g = sizeCanvas(this.c); this.cleared = false;
    const S = this.S;
    S.hearts = ['#ff7aa5', '#f9578b', '#ff98b8', '#ffb6c8', '#ff6f9c', '#ffad85', '#ffc278', '#f2457d', '#ff8fb0', '#ffcf86'].map(heartSprite);
    S.petals = [petalSprite('#ff6f8f', '#a10d33'), petalSprite('#ff8aa5', '#c2183f'), petalSprite('#ffb3c4', '#d4335c')];
    S.blossoms = [blossomSprite('#ffd1dc', '#f48fb1'), blossomSprite('#ffe6ee', '#f8a5c2'), blossomSprite('#ffc2d4', '#ec7aa0')];
    S.leaves = [mapleSprite('#e8692c', '#9e3416'), mapleSprite('#f2a03d', '#b05a18'), mapleSprite('#c9442b', '#71200f'),
      mapleSprite('#dc8a2b', '#874710'), ovalLeafSprite('#d0812e', '#7d3f12'), ovalLeafSprite('#b9502a', '#6a2410')];
    S.glow = {
      gold: glowSprite('255,210,140'), pink: glowSprite('255,140,190'), white: glowSprite('255,245,250'), lime: glowSprite('205,255,150'),
      green: glowSprite('120,240,140'), rose: glowSprite('255,95,170'), amber: glowSprite('255,196,90'), grey: glowSprite('205,200,210'), violet: glowSprite('210,140,255')
    };
  },
  resize() { this.g = sizeCanvas(this.c); this.cleared = false; },
  add(o) {
    if (this.parts.length > 900) return;
    this.cleared = false;
    this.parts.push(Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 1, vmax: 1e9, age: 0, life: 2, size: 8, rot: 0, vr: 0, sway: 0, swayF: 2,
      ph: Math.random() * TAU, type: 'spark', sprite: null, color: '#ffd27a', fadeIn: .15, flipF: 0, alpha: 1, add: false, wander: 0, flicker: 0, len: 18
    }, o));
  },
  clear() { this.parts.length = 0; this.cleared = false; },
  ambient(kind, rate = 1) { this.amb = kind ? { kind, rate } : null; this.acc = 0; },
  spawn(kind) {
    const W = VP.W, H = VP.H, S = this.S;
    switch (kind) {
      case 'petals': { const vy = rand(32, 70); this.add({ type: 'sprite', sprite: pick(S.petals), x: rand(-20, W + 20), y: -30, vx: rand(-14, 14), vy, life: (H + 80) / vy + 2, size: rand(11, 20), rot: rand(0, TAU), vr: rand(-1.4, 1.4), sway: rand(14, 38), swayF: rand(.8, 1.8), flipF: rand(1.2, 2.8), alpha: .85, fadeIn: .8 }); break; }
      case 'blossom': { const vy = rand(26, 58); this.add({ type: 'sprite', sprite: pick(S.blossoms), x: rand(-60, W), y: -24, vx: rand(10, 34), vy, life: (H + 60) / vy + 2, size: rand(9, 17), rot: rand(0, TAU), vr: rand(-1.6, 1.6), sway: rand(14, 34), swayF: rand(.8, 1.8), flipF: rand(1, 2.4), alpha: .92, fadeIn: .8 }); break; }
      case 'leaves': { const vy = rand(42, 86); this.add({ type: 'sprite', sprite: pick(S.leaves), x: rand(-30, W + 30), y: -36, vx: rand(-20, 20), vy, life: (H + 80) / vy + 2, size: rand(16, 30), rot: rand(0, TAU), vr: rand(-2, 2), sway: rand(26, 60), swayF: rand(.7, 1.5), flipF: rand(1.4, 3), alpha: .95, fadeIn: .6 }); break; }
      case 'rain': { const vy = rand(780, 1100); this.add({ type: 'rain', x: rand(-40, W + 80), y: rand(-60, -10), vx: -90, vy, life: (H + 80) / vy + .1, len: rand(12, 26), color: 'rgba(205,220,245,.45)', fadeIn: .02, alpha: rand(.35, .8) }); break; }
      case 'fireflies': this.add({ type: 'glow', sprite: pick([S.glow.amber, S.glow.gold, S.glow.lime]), x: rand(0, W), y: rand(H * .3, H), vx: rand(-14, 14), vy: rand(-14, 6), wander: 60, life: rand(5, 9), size: rand(10, 20), add: true, flicker: rand(2, 5), fadeIn: 1.2, alpha: .9 }); break;
      case 'dust': this.add({ type: 'glow', sprite: pick([S.glow.gold, S.glow.pink, S.glow.white]), x: rand(0, W), y: rand(0, H), vx: rand(-6, 6), vy: rand(-16, -4), life: rand(4, 8), size: rand(4, 9), add: true, flicker: rand(1, 3), fadeIn: 1.5, alpha: .5 }); break;
      case 'hearts-rise': { const vy = -rand(20, 55); this.add({ type: 'sprite', sprite: pick(S.hearts), x: rand(0, W), y: H + 30, vy, life: (H + 80) / -vy, size: rand(10, 28), rot: rand(-.4, .4), sway: rand(10, 36), swayF: rand(.5, 1), alpha: rand(.18, .45), fadeIn: 1 }); break; }
      case 'hearts-fall': { const vy = rand(30, 60); this.add({ type: 'sprite', sprite: pick(S.hearts), x: rand(0, W), y: -30, vy, life: (H + 60) / vy + 1, size: rand(10, 22), rot: rand(-.5, .5), vr: rand(-.8, .8), sway: rand(16, 36), swayF: rand(.8, 1.6), alpha: .8, fadeIn: .6 }); break; }
    }
  },
  update(dt) {
    if (this.amb && !REDUCE) {
      const area = Math.sqrt((VP.W * VP.H) / (420 * 860));
      this.acc += dt * this.amb.rate * area;
      while (this.acc >= 1) { this.acc -= 1; this.spawn(this.amb.kind); }
    }
    const H = VP.H, W = VP.W;
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.age += dt;
      p.vy = Math.min(p.vmax, p.vy + p.g * dt);
      if (p.drag !== 1) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d; }
      if (p.wander) { p.vx += rand(-1, 1) * p.wander * dt; p.vy += rand(-1, 1) * p.wander * dt; const d = Math.pow(.97, dt * 60); p.vx *= d; p.vy *= d; }
      p.x += (p.vx + Math.sin(p.age * p.swayF + p.ph) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.age > p.life || p.y > H + 90 || p.y < -260 || p.x < -260 || p.x > W + 260) {
        const last = this.parts.pop();
        if (i < this.parts.length) {
          this.parts[i] = last;
        }
      }
    }
  },
  draw() {
    if (this.parts.length === 0) {
      if (!this.cleared && this.g) {
        this.g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);
        this.g.clearRect(0, 0, VP.W, VP.H);
        this.cleared = true;
      }
      return;
    }
    this.cleared = false;
    const g = this.g;
    g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);
    g.clearRect(0, 0, VP.W, VP.H);
    for (let i = 0; i < this.parts.length; i++) {
      const p = this.parts[i];
      let a = Math.min(clamp(p.age / p.fadeIn), clamp((p.life - p.age) / Math.min(p.life * .35, 1.4))) * p.alpha;
      if (p.flicker) a *= .55 + .45 * Math.sin(p.age * p.flicker + p.ph);
      if (a <= .01) continue;
      g.globalAlpha = a;
      g.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      if (p.type === 'sprite') {
        g.save(); g.translate(p.x, p.y); g.rotate(p.rot + Math.sin(p.age * p.swayF + p.ph) * .3);
        if (p.flipF) g.scale(.25 + .75 * Math.abs(Math.cos(p.age * p.flipF + p.ph)), 1);
        g.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size); g.restore();
      } else if (p.type === 'glow') {
        g.drawImage(p.sprite, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'rain') {
        g.strokeStyle = p.color; g.lineWidth = 1; g.beginPath(); g.moveTo(p.x, p.y);
        const k = p.len / Math.hypot(p.vx, p.vy); g.lineTo(p.x - p.vx * k, p.y - p.vy * k); g.stroke();
      } else {
        g.fillStyle = p.color; drawSpark(g, p.x, p.y, p.size * (.7 + .3 * Math.sin(p.age * 14 + p.ph)));
      }
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  }
};
function burst(x, y, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = (o.speed || 420) * (.35 + Math.random() * .75);
    const isHeart = Math.random() < (o.hearts ?? .55);
    FX.add({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (o.lift ?? 120), g: o.g ?? 520, drag: .985,
      life: .9 + Math.random() * .9, size: isHeart ? 10 + Math.random() * 14 : 3 + Math.random() * 5,
      rot: (Math.random() - .5) * .8, vr: (Math.random() - .5) * 6,
      type: isHeart ? 'sprite' : 'spark', sprite: pick(FX.S.hearts), color: Math.random() < .5 ? '#ffd88a' : '#ffffff', fadeIn: .02
    });
  }
}
function glowBurst(x, y, n, colors = ['pink', 'white', 'gold'], speed = 220, life = .9) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, sp = speed * (.3 + Math.random() * .8);
    FX.add({ type: 'glow', sprite: FX.S.glow[pick(colors)], x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: .95, life: life * rand(.6, 1.2), size: rand(6, 16), add: true, fadeIn: .02 });
  }
}

/* ---------- sound: soft generative piano + small effects ---------- */
const Sound = {
  ctx: null, out: null, music: null, customGain: null, customBase: .65, sfxBus: null, verb: null,
  started: false, muted: false, el: null, timer: null, trackTimer: null, fallbackAudios: [], noise: null,
  base: .34, level: 1,
  init() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try { this.ctx = new AC(); } catch (e) { return false; }
    const c = this.ctx;
    this.out = c.createGain();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    this.out.connect(comp); comp.connect(c.destination);
    this.verb = c.createConvolver(); this.verb.buffer = this.impulse(3.6, 2.4);
    const wet = c.createGain(); wet.gain.value = .6; this.verb.connect(wet); wet.connect(this.out);
    this.music = c.createGain(); this.music.gain.value = 0;
    const md = c.createGain(); md.gain.value = .6; this.music.connect(md); md.connect(this.out);
    const mv = c.createGain(); mv.gain.value = .85; this.music.connect(mv); mv.connect(this.verb);

    // Dedicated clean bus for custom music (without synthetic heavy reverb)
    this.customGain = c.createGain();
    this.customGain.gain.value = 0;
    this.customGain.connect(this.out);

    this.sfxBus = c.createGain(); this.sfxBus.gain.value = .85; this.sfxBus.connect(this.out);
    const sv = c.createGain(); sv.gain.value = .35; this.sfxBus.connect(sv); sv.connect(this.verb);
    const nb = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate); const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    this.noise = nb;
    return true;
  },
  impulse(sec, decay) {
    const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
    return b;
  },
  unlock() { if (!this.init()) return; if (this.ctx.state === 'suspended') this.ctx.resume(); },
  startMusic() {
    if (this.started) return;
    this.unlock(); if (!this.ctx) return;
    this.started = true;
    const mb = $('#muteBtn'); if (mb) mb.hidden = false;
    if (G.music) {
      this.playCustomMusic(G.music);
    } else {
      this.gen();
      const t = this.ctx.currentTime;
      this.music.gain.cancelScheduledValues(t); this.music.gain.setValueAtTime(0, t);
      this.music.gain.linearRampToValueAtTime(this.muted ? 0 : this.base * this.level, t + 4);
    }
  },
  async playCustomMusic(url) {
    const c = this.ctx;
    if (!this.customGain) {
      this.customGain = c.createGain();
      this.customGain.gain.value = 0;
      this.customGain.connect(this.out);
    }

    // Support both .mp3 and .mpeg interchangeably
    const urls = [url];
    if (/\.mp3$/i.test(url)) urls.push(url.replace(/\.mp3$/i, '.mpeg'));
    else if (/\.mpeg$/i.test(url)) urls.push(url.replace(/\.mpeg$/i, '.mp3'));
    else if (!/\.(mp3|mpeg|wav|ogg|m4a)$/i.test(url)) {
      urls.push(url + '.mp3', url + '.mpeg');
    }

    let audioBuffer = null;
    let chosenUrl = urls[0];

    for (const u of urls) {
      try {
        const res = await fetch(u);
        if (!res.ok) continue;
        const ab = await res.arrayBuffer();
        audioBuffer = await c.decodeAudioData(ab);
        chosenUrl = u;
        break;
      } catch (err) {
        // try next candidate
      }
    }

    if (audioBuffer) {
      this.setupSeamlessBufferLoop(audioBuffer);
      const t = c.currentTime;
      this.customGain.gain.cancelScheduledValues(t);
      this.customGain.gain.setValueAtTime(0, t);
      this.customGain.gain.linearRampToValueAtTime(this.muted ? 0 : this.customBase * this.level, t + 2.5);
    } else {
      this.setupHtmlAudioCrossfade(chosenUrl);
    }
  },
  setupSeamlessBufferLoop(audioBuf) {
    const c = this.ctx;
    const ch0 = audioBuf.getChannelData(0);
    const ch1 = audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : ch0;
    const sr = audioBuf.sampleRate;
    const len = audioBuf.length;

    // Detect non-silent head and tail to eliminate dead air gaps
    let startSec = 0;
    for (let i = 0; i < len; i++) {
      if (Math.abs(ch0[i]) > 0.008 || Math.abs(ch1[i]) > 0.008) {
        startSec = Math.max(0, (i / sr) - 0.04);
        break;
      }
    }
    let endSec = audioBuf.duration;
    for (let i = len - 1; i >= 0; i--) {
      if (Math.abs(ch0[i]) > 0.008 || Math.abs(ch1[i]) > 0.008) {
        endSec = Math.min(audioBuf.duration, (i / sr) + 0.04);
        break;
      }
    }

    const totalDur = endSec - startSec;
    // Crossfade duration: 3.5 seconds (or at most 25% of total track duration)
    const xfade = Math.min(3.5, totalDur * 0.25);
    const cycleLen = Math.max(5, totalDur - xfade);

    let nextStartTime = c.currentTime;
    let isFirst = true;

    const schedulePass = () => {
      if (!this.started) return;
      const now = c.currentTime;
      if (nextStartTime < now) nextStartTime = now;

      const src = c.createBufferSource();
      src.buffer = audioBuf;

      const passGain = c.createGain();
      src.connect(passGain);
      passGain.connect(this.customGain);

      const passStart = nextStartTime;
      const passEnd = passStart + totalDur;

      if (isFirst) {
        passGain.gain.setValueAtTime(1, passStart);
        isFirst = false;
      } else {
        passGain.gain.setValueAtTime(0, passStart);
        passGain.gain.linearRampToValueAtTime(1, passStart + xfade);
      }

      // Smooth fade-out at tail
      passGain.gain.setValueAtTime(1, passEnd - xfade);
      passGain.gain.linearRampToValueAtTime(0, passEnd);

      src.start(passStart, startSec, totalDur);
      src.stop(passEnd + 0.1);

      nextStartTime += cycleLen;

      // Queue next pass 5 seconds before it is needed
      const timeUntilSchedule = Math.max(500, (nextStartTime - now - 5) * 1000);
      this.trackTimer = setTimeout(schedulePass, timeUntilSchedule);
    };

    schedulePass();
  },
  setupHtmlAudioCrossfade(url) {
    const a1 = new Audio(url);
    const a2 = new Audio(url);
    this.fallbackAudios = [a1, a2];
    this.el = a1;

    let active = a1;
    let standby = a2;
    let crossfading = false;
    const xfade = 3.5;

    const startActive = () => {
      active.volume = this.muted ? 0 : this.customBase * this.level;
      active.play().catch(() => {
        if (!this.genStarted) { this.genStarted = true; this.gen(); }
      });
    };

    const checkCrossfade = () => {
      if (!this.started) return;
      if (!active.duration || isNaN(active.duration)) return;

      const remaining = active.duration - active.currentTime;
      if (remaining <= xfade && !crossfading) {
        crossfading = true;
        standby.currentTime = 0.16;
        standby.volume = 0;
        standby.play().catch(() => {});

        const stepCount = 30;
        const stepTime = (xfade * 1000) / stepCount;
        let step = 0;
        const targetVol = this.muted ? 0 : this.customBase * this.level;

        const fadeInterval = setInterval(() => {
          step++;
          const progress = Math.min(1, step / stepCount);
          if (!this.muted) {
            standby.volume = Math.min(1, targetVol * Math.sin(progress * Math.PI / 2));
            active.volume = Math.max(0, targetVol * Math.cos(progress * Math.PI / 2));
          }
          if (progress >= 1) {
            clearInterval(fadeInterval);
            active.pause();
            active.currentTime = 0;
            const tmp = active;
            active = standby;
            standby = tmp;
            this.el = active;
            crossfading = false;
          }
        }, stepTime);
      }
    };

    startActive();
    this.trackTimer = setInterval(checkCrossfade, 250);
  },
  duck(level, sec = 2) {
    this.level = level;
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    this.music.gain.setTargetAtTime(this.muted ? 0 : this.base * level, t, sec / 3);
    if (this.customGain) {
      this.customGain.gain.setTargetAtTime(this.muted ? 0 : this.customBase * level, t, sec / 3);
    }
    if (this.fallbackAudios && this.fallbackAudios.length) {
      this.fallbackAudios.forEach(a => { if (!a.paused) a.volume = this.muted ? 0 : this.customBase * level; });
    }
  },
  setMute(m) {
    this.muted = m;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.out.gain.setTargetAtTime(m ? 0 : 1, t, .15);
    if (this.started) {
      this.music.gain.setTargetAtTime(m ? 0 : this.base * this.level, t, .3);
      if (this.customGain) {
        this.customGain.gain.setTargetAtTime(m ? 0 : this.customBase * this.level, t, .3);
      }
    }
    if (this.fallbackAudios && this.fallbackAudios.length) {
      this.fallbackAudios.forEach(a => { a.muted = m; });
    }
  },
  N: n => 440 * Math.pow(2, (n - 69) / 12),
  gen() {
    const c = this.ctx;
    this.prog = [
      { bass: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76, 77, 81] },   // Fmaj7
      { bass: 45, pad: [52, 55, 57, 60], arp: [64, 67, 69, 72, 76, 79] },   // Am7
      { bass: 38, pad: [53, 57, 60, 62], arp: [62, 65, 69, 72, 74, 77] },   // Dm9
      { bass: 46, pad: [50, 53, 57, 58], arp: [62, 65, 69, 70, 74, 77] },   // Bbmaj7
      { bass: 41, pad: [53, 57, 60, 64], arp: [65, 69, 72, 76, 77, 81] },
      { bass: 43, pad: [50, 53, 55, 58], arp: [62, 65, 67, 70, 74, 77] },   // Gm7
      { bass: 46, pad: [50, 53, 57, 58], arp: [62, 65, 69, 70, 74, 77] },
      { bass: 48, pad: [52, 55, 58, 60], arp: [64, 67, 70, 72, 76, 79] }    // C7
    ];
    this.beat = 60 / 64; this.step = 0; this.next = c.currentTime + .25; this.prev = 72;
    const tick = () => {
      while (this.next < c.currentTime + .45) { this.schedule(this.step, this.next); this.next += this.beat / 2; this.step++; }
    };
    this.timer = setInterval(tick, 90); tick();
  },
  schedule(step, t) {
    const per = 16, ch = this.prog[Math.floor(step / per) % this.prog.length], k = step % per;
    if (k === 0) { this.pad(ch.pad, t, this.beat * 8.4); this.bassNote(ch.bass, t, this.beat * 8); }
    const pattern = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0];
    if (pattern[k] && Math.random() < .82) {
      const cand = ch.arp.filter(n => n !== this.prev).sort((a, b) => Math.abs(a - this.prev) - Math.abs(b - this.prev)).slice(0, 3);
      const n = pick(cand); this.prev = n;
      this.bell(n, t + rand(0, .02), rand(.045, .075), this.music);
    }
    if ((k === 0 || k === 8) && Math.random() < .5) this.bell(pick(ch.arp) + 12, t + this.beat * .25, .03, this.music);
  },
  pad(notes, t, dur) {
    const c = this.ctx;
    for (const n of notes) for (const det of [-7, 7]) {
      const o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = this.N(n); o.detune.value = det;
      f.type = 'lowpass'; f.frequency.value = 1000; f.Q.value = .3;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.014, t + 2.4);
      g.gain.setValueAtTime(.014, t + dur); g.gain.linearRampToValueAtTime(0, t + dur + 2.6);
      o.connect(f); f.connect(g); g.connect(this.music); o.start(t); o.stop(t + dur + 2.8);
    }
  },
  bassNote(n, t, dur) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = 'sine'; o.frequency.value = this.N(n);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .9); g.gain.linearRampToValueAtTime(0, t + dur + 1.5);
    o.connect(g); g.connect(this.music); o.start(t); o.stop(t + dur + 1.6);
  },
  bell(n, t, v, bus) {
    const c = this.ctx, f = this.N(n), g = c.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .006); g.gain.exponentialRampToValueAtTime(.0004, t + 2.4);
    g.connect(bus || this.sfxBus);
    [[1, 1], [2.0, .28], [3.98, .07]].forEach(([m, a]) => {
      const o = c.createOscillator(), og = c.createGain(); o.type = 'sine'; o.frequency.value = f * m; og.gain.value = a;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.5);
    });
  },
  tone(freq, type, at, dur, vol, freqEnd) {
    const c = this.ctx, t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .008); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    o.connect(g); g.connect(this.sfxBus); o.start(t); o.stop(t + dur + .05);
  },
  hiss(at, dur, vol, type, freq, q, freqEnd) {
    const c = this.ctx, t = c.currentTime + at, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise; f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q;
    if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
    s.connect(f); f.connect(g); g.connect(this.sfxBus); s.start(t, Math.random()); s.stop(t + dur + .05);
  },
  sfx(name) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    try {
      switch (name) {
        case 'tick': this.tone(1250, 'sine', 0, .07, .05); break;
        case 'wrong': this.tone(330, 'triangle', 0, .3, .07); this.tone(262, 'triangle', .16, .4, .07); break;
        case 'chime': this.bell(88, t, .1); this.bell(95, t + .09, .08); this.bell(100, t + .18, .06); break;
        case 'soft': this.bell(84, t, .06); this.bell(91, t + .07, .05); break;
        case 'sparkle': [84, 88, 91, 96].forEach((n, i) => this.bell(n, t + i * .06, .05)); break;
        case 'crack': this.hiss(0, .14, .5, 'bandpass', 2200, 1.2); this.hiss(.03, .28, .3, 'lowpass', 500, .7); this.tone(95, 'sine', 0, .22, .25, 50); break;
        case 'thwip': this.hiss(0, .24, .22, 'bandpass', 4200, 2, 900); break;
        case 'puff': this.hiss(0, .55, .32, 'lowpass', 900, .5, 180); break;
        case 'pop': this.tone(720, 'sine', 0, .14, .14, 240); break;
        case 'paper': for (let i = 0; i < 7; i++) this.hiss(i * .05 + Math.random() * .03, .06, .1, 'bandpass', rand(2600, 5200), 1.4); break;
        case 'whoosh': this.hiss(0, .8, .16, 'bandpass', 500, .8, 2600); break;
        case 'unlock': this.tone(520, 'triangle', 0, .08, .08); this.tone(780, 'triangle', .09, .12, .08); this.bell(96, t + .16, .07); break;
      }
    } catch (e) { /* audio is optional */ }
  }
};

/* ---------- scene manager ---------- */
const App = {
  order: ['lock', 'cupid', 'rose', 'story', 'jar', 'wish', 'lily', 'letter', 'heart', 'tree'],
  defs: {}, cur: null, prev: null, busy: false, z: 20, keys: 0,
  scene(id, def = {}) { def.id = id; def.el = document.getElementById('sc-' + id); this.defs[id] = def; return def; },
  go(id, o = {}) {
    if (this.busy && !o.force) return false;
    const next = this.defs[id];
    if (!next || next === this.cur) return false;
    this.busy = true;
    const prev = this.cur, el = next.el;
    el.hidden = false; el.style.zIndex = ++this.z;
    document.body.dataset.tone = next.tone || 'dark';
    this.prev = prev; this.cur = next;
    setProgress(this.order.indexOf(id));
    try {
      sessionStorage.setItem('last_scene', id);
      if (DEV) {
        if (id !== 'lock') history.replaceState(null, '', '#' + id);
        else history.replaceState(null, '', location.pathname + location.search);
      } else {
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      }
    } catch (e) {}
    try { if (next.enter) next.enter(o); } catch (e) { console.error(e); }
    const x = o.x ?? VP.W / 2, y = o.y ?? VP.H / 2;
    const dur = REDUCE ? .35 : (o.dur || 1.2);
    let fin = () => {
      el.style.clipPath = ''; el.style.webkitClipPath = '';
      el.style.webkitMaskImage = ''; el.style.maskImage = ''; el.style.opacity = ''; el.style.visibility = '';
      if (prev && prev !== next) { prev.el.hidden = true; try { if (prev.leave) prev.leave(); } catch (e) { console.error(e); } }
      this.prev = null; this.busy = false;
      try { if (next.shown) next.shown(); } catch (e) { console.error(e); }
    };
    let type = REDUCE || !prev ? 'fade' : (o.type || 'circle');
    if (!window.gsap) { fin(); return true; }
    if (type === 'circle') {
      const R = Math.hypot(Math.max(x, VP.W - x), Math.max(y, VP.H - y)) + 20;
      gsap.fromTo(el, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: dur, ease: 'power3.inOut', onComplete: fin });
    } else if (type === 'heart') {
      const uri = 'url("data:image/svg+xml,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='-1.1 -1.05 2.2 2.1'><path d='M0 .9C-.2.7-1 .25-1-.25-1-.75-.4-1 0-.5.4-1 1-.75 1-.25 1 .25.2.7 0 .9Z'/></svg>") + '")';
      const st = el.style;
      st.webkitMaskImage = uri; st.maskImage = uri; st.webkitMaskRepeat = 'no-repeat'; st.maskRepeat = 'no-repeat';
      const R = Math.hypot(Math.max(x, VP.W - x), Math.max(y, VP.H - y));
      const o2 = { s: 2 };
      const upd = () => {
        const w = o2.s, h = w * 2.1 / 2.2;
        const sz = `${w}px ${h}px`, pos = `${x - w / 2}px ${y - h * .45}px`;
        st.webkitMaskSize = sz; st.maskSize = sz; st.webkitMaskPosition = pos; st.maskPosition = pos;
      };
      upd();
      gsap.to(o2, { s: R * 5.2, duration: dur, ease: 'power2.in', onUpdate: upd, onComplete: fin });
    } else if (type === 'dip') {
      const veil = $('#veil'); veil.style.background = o.color || '#000';
      el.style.visibility = 'hidden';
      gsap.timeline({ onComplete: fin })
        .to(veil, { opacity: 1, duration: dur * .45, ease: 'power2.in' })
        .add(() => { el.style.visibility = ''; if (prev) prev.el.style.visibility = 'hidden'; })
        .to(veil, { opacity: 0, duration: dur * .55, ease: 'power2.out' });
      const f0 = fin; fin = () => { if (prev) prev.el.style.visibility = ''; f0(); };
    } else if (type === 'curtain') {
      gsap.fromTo(el, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'power3.inOut', onComplete: fin });
    } else {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: dur, ease: 'power2.inOut', onComplete: fin });
    }
    return true;
  }
};

/* ---------- small UI helpers ---------- */
function showBtn(btn, delay = 0) {
  if (!btn) return;
  btn.hidden = false;
  gsap.fromTo(btn, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .9, delay, ease: 'power2.out' });
}
function hideBtn(btn) { if (btn) { gsap.killTweensOf(btn); btn.hidden = true; } }
function fadeIn(el, delay = 0, dur = 1, y = 10) {
  if (!el) return;
  gsap.killTweensOf(el);
  return gsap.fromTo(el, { opacity: 0, y }, { opacity: 1, y: 0, duration: dur, delay, ease: 'power2.out' });
}
function setProgress(i) {
  const nav = $('#progress');
  if (!nav) return;
  nav.hidden = i <= 0;
  $$('span', nav).forEach((s, k) => { s.classList.toggle('on', k <= i - 1); s.classList.toggle('now', k === i - 1); });
}
function buildProgress() {
  const nav = $('#progress');
  nav.innerHTML = App.order.slice(1).map(() => '<span>♥</span>').join('');
}

/* sparkle trail behind a finger or cursor */
let lastTrail = null;
addEventListener('pointermove', e => {
  if (REDUCE || !FX.g) return;
  const x = e.clientX, y = e.clientY;
  if (lastTrail && Math.hypot(x - lastTrail[0], y - lastTrail[1]) < 10) return;
  lastTrail = [x, y];
  FX.add({ x, y, vx: rand(-20, 20), vy: rand(-30, 10), life: rand(.4, .8), size: rand(2, 4.5), color: Math.random() < .6 ? '#ffd88a' : '#ffb3c8', type: 'spark', fadeIn: .02 });
}, { passive: true });

/* ---------- screen wake lock, android back protection & tab visibility ---------- */
let wakeLock = null;
async function requestWakeLock() {
  if (!('wakeLock' in navigator) || sessionStorage.getItem('gift_unlocked') !== '1' || document.hidden) return;
  try {
    if (wakeLock !== null && !wakeLock.released) return;
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  } catch (e) {}
}
window.requestWakeLock = requestWakeLock;

let appToastTimer = null;
function showToast(text) {
  let el = $('#appToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'appToast';
    el.className = 'app-toast';
    document.body.appendChild(el);
  }
  clearTimeout(appToastTimer);
  el.textContent = text;
  gsap.killTweensOf(el);
  gsap.fromTo(el, { opacity: 0, y: 12, scale: .92 }, { opacity: 1, y: 0, scale: 1, duration: .25, ease: 'back.out(2)' });
  appToastTimer = setTimeout(() => {
    gsap.to(el, { opacity: 0, y: -6, duration: .35, onComplete: () => { el.style.display = 'none'; } });
  }, 2200);
  el.style.display = 'block';
}
window.showToast = showToast;

let lastBackTime = 0;
let allowLeave = false;
window.addEventListener('popstate', () => {
  if (allowLeave) return;
  if (sessionStorage.getItem('gift_unlocked') === '1') {
    const now = Date.now();
    if (lastBackTime && now - lastBackTime < 2500) {
      allowLeave = true;
      history.back();
      return;
    }
    lastBackTime = now;
    history.pushState({ gift_guard: 1 }, '', location.pathname + location.search);
    showToast('swipe back again to leave ♥');
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (Sound.ctx && Sound.ctx.state === 'running') {
      Sound.ctx.suspend().catch(() => {});
    }
    (Sound.fallbackAudios || []).forEach(a => { try { a.pause(); } catch (e) {} });
  } else {
    if (Sound.started && Sound.ctx && Sound.ctx.state === 'suspended') {
      Sound.ctx.resume().then(() => {
        const t = Sound.ctx.currentTime;
        const targetGain = Sound.muted ? 0 : (G.music ? Sound.customBase : Sound.base) * Sound.level;
        const bus = G.music ? Sound.customGain : Sound.music;
        if (bus) {
          bus.gain.cancelScheduledValues(t);
          bus.gain.setValueAtTime(0, t);
          bus.gain.linearRampToValueAtTime(targetGain, t + 1.2);
        }
      }).catch(() => {});
    }
    requestWakeLock();
  }
});
