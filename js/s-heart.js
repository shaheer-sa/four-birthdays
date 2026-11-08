'use strict';
/* ============ 8 · HEART OF LANGUAGES (ports of love_heart.py + love_heart_3d.py) ============ */
(() => {
  const D = App.scene('heart', { tone: 'dark' });
  const c2 = $('#h2d'), c3 = $('#h3d'), cap = $('#h3cap');
  const BG = '#000000', BORDER = '#ff2b2b', FILLS = ['#ff2d2d', '#ff1f1f', '#e8191f', '#ff4646', '#d91a1a', '#ff3a4a'];
  const HL = '#ffe3ea', FLASH = '#fff2f5', BEAT = '#ffc4c4';
  const BORDER_S = 4, PAUSE_S = .4, FILL_S = 7, FADE_S = .55, SHIM_S = .9;
  const FAM = '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", "Noto Sans", Arial, sans-serif';
  const PHRASES = ['I love you', 'I love you', 'I love you', "Je t'aime", 'Te quiero', 'Te amo', 'Eu te amo', 'Ti amo', 'Ich liebe dich',
    'Ik hou van jou', 'Ek is lief vir jou', 'Jag älskar dig', 'Jeg elsker dig', 'Jeg elsker deg', 'Ég elska þig', 'Eg elski teg', 'Minä rakastan sinua',
    'Ma armastan sind', 'Kocham cię', 'Miluji tě', 'Ľúbim ťa', 'Volim te', 'Ljubim te', 'Szeretlek', 'Te iubesc', 'Aš tave myliu', 'Es tevi mīlu',
    "T'estimo", 'Maite zaitut', 'Quérote', 'Is breá liom thú', 'Tha gaol agam ort', "Rwy'n dy garu di", 'Ech hunn dech gär', 'Inħobbok', 'Të dua', 'Mi amas vin',
    'Я тебя люблю', 'Я тебе кохаю', 'Я цябе кахаю', 'Обичам те', 'Волим те', 'Те сакам', "Σ' αγαπώ", 'Seni seviyorum', 'Mən səni sevirəm', 'Men seni sevaman',
    'Men seni söýýärin', 'Мен сені жақсы көремін', 'Мен сени сүйөм', 'Ман туро дӯст медорам', 'Би чамд хайртай', 'Ես քեզ սիրում եմ', 'მიყვარხარ', 'Ez te hez dikim',
    'میں تم سے پیار کرتا ہوں', 'مجھے تم سے محبت ہے', 'میں تینوں پیار کردا ہاں', 'زه تا سره مینه لرم', 'دوستت دارم', 'أحبك', 'אני אוהב אותך',
    'मैं तुमसे प्यार करता हूँ', 'म तिमीलाई माया गर्छु', 'मी तुझ्यावर प्रेम करतो', 'আমি তোমাকে ভালোবাসি', 'ਮੈਂ ਤੈਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ', 'હું તને પ્રેમ કરું છું',
    'நான் உன்னை காதலிக்கிறேன்', 'నేను నిన్ను ప్రేమిస్తున్నాను', 'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', 'ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു', 'මම ඔයාට ආදරෙයි',
    'ฉันรักคุณ', 'ຂ້ອຍຮັກເຈົ້າ', 'ខ្ញុំស្រឡាញ់អ្នក', 'ချစ်တယ်', 'Anh yêu em', 'Aku cinta kamu', 'Saya cintakan awak', 'Mahal kita', '我爱你', '愛してる', '사랑해',
    'Nakupenda', 'Ngiyakuthanda', 'Ndiyakuthanda', 'Ndinokuda', 'Mo nífẹ̀ẹ́ rẹ', "A hụrụ m gị n'anya", 'Ina son ki', 'እወድሻለሁ', 'Waan ku jeclahay', 'Tiako ianao',
    'Aloha au iā ʻoe', 'Aroha ahau ki a koe', 'Ou te alofa ia te oe', 'Munakuyki', 'Rohayhu'].concat(NICKS.map(n => n.text));

  const mctx = document.createElement('canvas').getContext('2d');
  const mcache = new Map();
  const font = (px, w = 700) => `${w} ${px}px ${FAM}`;
  const measure = (t, f) => { const k = f + '|' + t; let v = mcache.get(k); if (v == null) { mctx.font = f; v = mctx.measureText(t).width; mcache.set(k, v); } return v; };
  const heartY = t => 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  function intersect(A, B) { const out = []; let i = 0, j = 0; while (i < A.length && j < B.length) { const lo = Math.max(A[i][0], B[j][0]), hi = Math.min(A[i][1], B[j][1]); if (hi > lo) out.push([lo, hi]); if (A[i][1] < B[j][1]) i++; else j++; } return out; }
  function heartbeat(t, period = 1.25) { const ph = t % period; return Math.min(1, Math.exp(-(((ph - .1) / .06) ** 2)) + .65 * Math.exp(-(((ph - .32) / .07) ** 2))); }
  function spawnColor(p, fin) { return p < .3 ? mixHex(BG, FLASH, ease3(p / .3)) : mixHex(FLASH, fin, smooth((p - .3) / .7)); }

  class Heart {
    constructor(k, cx, cy) {
      this.k = k; this.cx = cx; this.cy = cy;
      const n = 1600; this.poly = []; for (let i = 0; i < n; i++) this.poly.push(this.point(TAU * i / n));
      const half = 1500; this.right = []; for (let i = 0; i <= half; i++) this.right.push(this.point(Math.PI * i / half));
      this.left = this.right.map(([x, y]) => [2 * cx - x, y]);
      this.cum = [0]; for (let i = 1; i < this.right.length; i++) this.cum.push(this.cum[i - 1] + Math.hypot(this.right[i][0] - this.right[i - 1][0], this.right[i][1] - this.right[i - 1][1]));
      this.length = this.cum[this.cum.length - 1];
      const ys = this.poly.map(p => p[1]); this.top = Math.min(...ys); this.bottom = Math.max(...ys);
      this.notch = this.right[0]; this.tip = this.right[this.right.length - 1];
    }
    point(t) { return [this.cx + this.k * 16 * Math.sin(t) ** 3, this.cy - this.k * heartY(t)]; }
    at(s, side) {
      const pts = side > 0 ? this.right : this.left; s = clamp(s, 0, this.length);
      let lo = 0, hi = this.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (this.cum[m] <= s) lo = m; else hi = m; }
      const seg = this.cum[lo + 1] - this.cum[lo], f = seg ? (s - this.cum[lo]) / seg : 0;
      return [lerp(pts[lo][0], pts[lo + 1][0], f), lerp(pts[lo][1], pts[lo + 1][1], f)];
    }
    apartRange(gap) { const idx = []; this.right.forEach(([x], i) => { if (2 * (x - this.cx) >= gap) idx.push(i); }); return [this.cum[idx[0]], this.cum[idx[idx.length - 1]]]; }
    spans(y) {
      const xs = [], p = this.poly, n = p.length;
      for (let i = 0; i < n; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % n]; if ((y1 <= y && y < y2) || (y2 <= y && y < y1)) xs.push(x1 + (y - y1) * (x2 - x1) / (y2 - y1)); }
      xs.sort((a, b) => a - b); const out = []; for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]); return out;
    }
  }
  class Deck { constructor(items, rng) { this.items = items.slice(); this.rng = rng; this.i = items.length; } next() { if (this.i >= this.items.length) { for (let i = this.items.length - 1; i > 0; i--) { const j = (this.rng() * (i + 1)) | 0;[this.items[i], this.items[j]] = [this.items[j], this.items[i]]; } this.i = 0; } return this.items[this.i++]; } }

  /* ---------- 2D state ---------- */
  let g2, bake, bctx, H2 = null, border = [], fill = [], timeline = [], endTime = 0, t0 = 0, ptr = 0, active = [], shimmer = new Map(), nextShim = 0, Sz = 10;
  let mode = '2d', running = false, lineShown = false;

  function build2d() {
    const rng = rngFrom((Math.random() * 1e9) | 0), W = VP.W, H = VP.H;
    Sz = Math.min((H * .56) / 30, (W - 28) / 34);
    const ys = []; for (let i = 0; i <= 2000; i++) ys.push(heartY(Math.PI * i / 2000));
    const h = new Heart(Sz, W / 2, H * .4 + Sz * (Math.max(...ys) + Math.min(...ys)) / 2);
    H2 = h;
    const bpx = Math.max(9, Math.round(Sz * .62)), bfont = font(bpx), heartFont = font(Math.round(bpx * 2));
    const fillPx = [.5, .57, .66, .78].map(k => Math.max(7, Math.round(Sz * k))), fillFonts = fillPx.map(px => font(px)), weights = [3, 4, 3, 1.4];
    const lineSpace = px => px * 1.33, lb = lineSpace(bpx);
    const pickFont = () => { let r = rng() * 11.4; for (let i = 0; i < 4; i++) { r -= weights[i]; if (r <= 0) return fillFonts[i]; } return fillFonts[3]; };
    function pack(room, gap, deck, pf, small, extra) {
      const chosen = []; let used = 0, misses = 0;
      while (misses < 40) { const t = deck.next(), f = pf(), w = measure(t, f); if (used + w + gap * (chosen.length + 1 + extra) <= room) { chosen.push([t, f, w]); used += w; misses = 0; } else misses++; }
      for (; ;) { const free = room - used - gap * (chosen.length + 1 + extra); const opts = deck.items.filter(t => measure(t, small) <= free); if (!opts.length) break; const t = opts[(rng() * opts.length) | 0], w = measure(t, small); chosen.push([t, small, w]); used += w; }
      for (let i = chosen.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0;[chosen[i], chosen[j]] = [chosen[j], chosen[i]]; }
      return [chosen, used];
    }
    border = []; fill = [];
    const [sa, sb] = h.apartRange(.8 * lb), room = sb - sa;
    const pool = PHRASES.filter(p => measure(p, bfont) <= 6.5 * Sz);
    let lastS = sa;
    for (const side of [1, -1]) {
      const [chosen, used] = pack(room, .3 * Sz, new Deck(pool.length ? pool : PHRASES, rng), () => bfont, bfont, 0);
      if (!chosen.length) continue;
      const gap = (room - used) / chosen.length; let s = sa + gap / 2;
      for (const [text, f, w] of chosen) {
        const [x1, y1] = h.at(s, side), [x2, y2] = h.at(s + w, side), [xm, ym] = h.at(s + w / 2, side);
        let ang = Math.atan2(-(y2 - y1), x2 - x1) * 180 / Math.PI; if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
        border.push({ text, x: xm, y: ym, ang, font: f, color: BORDER, start: (s + w / 2) / h.length * BORDER_S });
        s += w + gap;
      }
      lastS = s;
    }
    const [nx, ny] = h.notch, [tx, ty] = h.tip;
    border.push({ text: '♥', x: nx, y: (ny + h.at(sa, 1)[1]) / 2, ang: 0, font: heartFont, color: BORDER, start: 0 });
    border.push({ text: '♥', x: tx, y: (ty + h.at(sb, 1)[1]) / 2 + .15 * Sz, ang: 0, font: heartFont, color: BORDER, start: BORDER_S });
    const m = .5 * lb + .12 * Sz, rowH = .9 * Math.max(...fillPx.map(lineSpace));
    let best = null;
    for (let k = 0; k < 4; k++) {
      const rows = []; let total = 0; let y = h.top + m + rowH * (.5 + k / 4);
      while (y < h.bottom) {
        let sp = h.spans(y); for (const dy of [-(rowH / 2 + m), rowH / 2 + m]) sp = intersect(sp, h.spans(y + dy));
        sp = sp.filter(([a, b]) => b - a > 2 * m + Sz).map(([a, b]) => [a + m, b - m]);
        if (sp.length) { rows.push([y, sp]); total += sp.reduce((q, [a, b]) => q + b - a, 0); }
        y += rowH;
      }
      if (!best || total > best[0]) best = [total, rows];
    }
    const deck = new Deck(PHRASES, rng);
    for (const [y, sp] of best[1]) for (const [a, b] of sp) {
      const [chosen, used] = pack(b - a, .35 * Sz, deck, pickFont, fillFonts[0], 1);
      if (!chosen.length) continue;
      const gg = (b - a - used) / (chosen.length + 1); let x = a + gg;
      for (const [text, f, w] of chosen) { fill.push({ text, x: x + w / 2, y, ang: 0, font: f, color: rng() < .05 ? HL : FILLS[(rng() * FILLS.length) | 0], start: 0 }); x += w + gg; }
    }
    fill.sort((p, q) => p.y - q.y || p.x - q.x);
    const tf = BORDER_S + PAUSE_S, n = Math.max(1, fill.length - 1);
    fill.forEach((w, i) => { w.start = tf + FILL_S * i / n; });
    timeline = border.concat(fill).sort((a, b) => a.start - b.start);
    endTime = timeline[timeline.length - 1].start + FADE_S;
    g2 = sizeCanvas(c2);
    bake = document.createElement('canvas'); bake.width = c2.width; bake.height = c2.height;
    bctx = bake.getContext('2d'); bctx.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0); bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    ptr = 0; active = []; shimmer = new Map();
  }
  function drawW(c, w, color) {
    c.font = w.font; c.fillStyle = color;
    if (w.ang) { c.save(); c.translate(w.x, w.y); c.rotate(-w.ang * Math.PI / 180); c.fillText(w.text, 0, 0); c.restore(); }
    else c.fillText(w.text, w.x, w.y);
  }
  function frame2d(now) {
    const t = (now - t0) / 1000, g = g2;
    while (ptr < timeline.length && timeline[ptr].start <= t) { const w = timeline[ptr++]; w.on = true; if (!w.isB) active.push(w); }
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c2.width, c2.height); g.drawImage(bake, 0, 0);
    g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0); g.textAlign = 'center'; g.textBaseline = 'middle';
    const still = [];
    for (const w of active) {
      const p = (t - w.start) / FADE_S;
      if (p >= 1) { drawW(bctx, w, w.color); drawW(g, w, w.color); continue; }
      drawW(g, w, spawnColor(p, w.color)); still.push(w);
    }
    active = still;
    const fin = t >= endTime && !active.length, beat = fin ? heartbeat(t - endTime) : 0;
    for (const w of border) {
      if (t < w.start) continue;
      const p = (t - w.start) / FADE_S;
      drawW(g, w, p < 1 ? spawnColor(p, w.color) : fin ? mixHex(w.color, BEAT, .75 * beat) : w.color);
    }
    if (t >= 0 && t <= BORDER_S) {
      const s = H2.length * t / BORDER_S;
      for (const side of [1, -1]) {
        const [x, y] = H2.at(s, side);
        for (const [r, col] of [[.55 * Sz, 'rgba(90,8,14,.6)'], [.3 * Sz, 'rgba(200,24,40,.85)'], [.14 * Sz, '#fff0f3']]) { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
      }
    }
    if (fin) {
      if (now / 1000 >= nextShim && fill.length) { const w = fill[(Math.random() * fill.length) | 0]; if (!shimmer.has(w)) shimmer.set(w, now / 1000); nextShim = now / 1000 + rand(.05, .16); }
      for (const [w, st] of shimmer) { const q = (now / 1000 - st) / SHIM_S; if (q >= 1) { shimmer.delete(w); continue; } drawW(g, w, mixHex(w.color, FLASH, Math.sin(Math.PI * q))); }
      if (!lineShown && t > endTime + 1.6) {
        lineShown = true;
        setText($('#hLine'), LINES.heart || "I've said it in every language I could find. It still doesn't feel like enough.");
        fadeIn($('#hLine'), 0, 1.4); showBtn($('#hLift'), 2.2);
        Sound.sfx('soft');
      }
    }
  }

  /* ---------- 3D ---------- */
  const LANGS = [['I love you', 0], ['مجھے تم سے محبت ہے', 1], ['Te amo', 0], ['Je t\'aime', 0], ['사랑해요', 0], ['Ich liebe dich', 0], ['Eu te amo', 0], ['دوستت دارم', 1], ['Ti amo', 0], ['愛してる', 0]];
  const CAPS = [['I love you', 0], ['مجھے تم سے محبت ہے', 1], ['Te amo', 0], ['Je t\'aime', 0]].concat(NICKS.map(n => [n.text, IS_RTL(n.text) ? 1 : 0]), [['Ich liebe dich', 0], [HER, IS_RTL(HER) ? 1 : 0]]);
  const PAL3 = ['#ff4d8d', '#ff6ea0', '#ff8fb8', '#ffaacd', '#f578dc', '#dc6ef0', '#c77dff', '#aa8cff'];
  let g3, rings = [], stars = [], orbits = [], yawU = 0, pitchU = 0, dragging = false, lastDrag = -10, zoom = 1, last3 = null, t3 = 0, lastPh = 0, capI = -1, capT = 0, nextShown = false;
  function heartPts(n) { const out = []; for (let i = 0; i < n; i++) { const t = TAU * i / n; out.push([Math.sin(t) ** 3, (-(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16 + .15)]); } return out; }
  function makeTile(text, color, rtl) {
    const px = 30, f = rtl ? `500 ${px}px "Noto Nastaliq Urdu", "Segoe UI", Tahoma, sans-serif` : `700 ${px}px ${FAM}`;
    mctx.font = f; const tw = mctx.measureText(text).width, hs = 22, gap = 22, pad = 22;
    const c = document.createElement('canvas'); c.width = Math.ceil(tw + gap + hs + gap + pad * 2); c.height = Math.ceil((rtl ? 70 : 46) + pad * 2);
    const g = c.getContext('2d'); g.font = f; g.textBaseline = 'middle'; g.textAlign = 'left';
    const y = c.height / 2;
    g.shadowColor = color; g.shadowBlur = 16; g.fillStyle = color; g.fillText(text, pad, y); g.fillText(text, pad, y);
    g.shadowBlur = 0; g.fillStyle = mixHex(color, '#ffffff', .5); g.fillText(text, pad, y);
    const hsp = heartSprite(color); g.drawImage(hsp, pad + tw + gap, y - hs / 2, hs, hs);
    return c;
  }
  function build3d() {
    g3 = sizeCanvas(c3);
    const N = 9, TH = .42, base = heartPts(500);
    rings = [];
    for (let i = 0; i < N; i++) {
      const u = lerp(-1, 1, i / (N - 1)), z = u * TH, sc = .8 + .2 * Math.sqrt(Math.max(0, 1 - u * u));
      const [txt, rtl] = LANGS[i % LANGS.length], color = PAL3[i % PAL3.length];
      const pts = base.map(([x, y]) => [x * sc, y * sc, z]); pts.push(pts[0]);
      const cum = [0]; for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      rings.push({ pts, cum, length: cum[cum.length - 1], tile: makeTile(txt, color, rtl), speed: (.1 + .05 * (i % 3)) * (i % 2 ? -1 : 1) });
    }
    stars = []; for (let i = 0; i < 200; i++) stars.push([Math.random(), Math.random(), rand(0, TAU), rand(.5, 2.2), Math.random() < .8 ? 1 : 1.8]);
    orbits = [];
    [[.35, 1.45, 30], [-.55, 1.65, 24], [1.2, 1.3, 18]].forEach(([tilt, rad, n], k) => { for (let j = 0; j < n; j++) orbits.push([tilt, rad, TAU * j / n, .35 + .15 * k, pick(['pink', 'white', 'violet', 'rose'])]); });
  }
  function sample(r, d) {
    d = ((d % r.length) + r.length) % r.length;
    let lo = 0, hi = r.cum.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (r.cum[m] <= d) lo = m; else hi = m; }
    const a = r.pts[lo], b = r.pts[lo + 1], f = (d - r.cum[lo]) / ((r.cum[lo + 1] - r.cum[lo]) || 1e-9);
    return [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];
  }
  function rot([x, y, z], yaw, pitch) { const cy = Math.cos(yaw), sy = Math.sin(yaw);[x, z] = [x * cy + z * sy, -x * sy + z * cy]; const cp = Math.cos(pitch), sp = Math.sin(pitch);[y, z] = [y * cp - z * sp, y * sp + z * cp]; return [x, y, z]; }
  function frame3d(now, dt) {
    t3 += dt;
    if (!dragging && t3 - lastDrag > 3) { yawU *= Math.pow(.985, dt * 60); pitchU *= Math.pow(.985, dt * 60); }
    const W = VP.W, H = VP.H, g = g3;
    const portrait = H > W;
    const cx = W / 2, cy = portrait ? H * .33 : H * .37;
    const R = Math.min(W, H) * (portrait ? .24 : .27), fov = 3.4;
    const proj = ([x, y, z]) => { const f = fov / (fov + z); return [cx + x * R * f * zoom, cy + y * R * f * zoom, f]; };
    const ph = (t3 % 1.15) / 1.15, beat = Math.exp(-(((ph - .05) / .045) ** 2)) + .6 * Math.exp(-(((ph - .24) / .05) ** 2)), pulse = 1 + .07 * beat;
    if (lastPh > ph) { glowBurst(cx, cy, 26, ['pink', 'white', 'violet', 'rose'], 300, .9); vibrate(8); }
    lastPh = ph;
    const yaw = Math.sin(t3 * .45) * .75 + yawU, pitch = .18 + Math.sin(t3 * .3) * .15 + pitchU;
    g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0); g.clearRect(0, 0, W, H);
    const bg = g.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) * .6); bg.addColorStop(0, '#3a0a24'); bg.addColorStop(1, '#06020a');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    for (const s of stars) { const b = .5 + .5 * Math.sin(t3 * s[3] + s[2]), c = 60 + 160 * b; g.fillStyle = `rgb(${c | 0},${(c * .8) | 0},${c | 0})`; g.fillRect(s[0] * W, s[1] * H, s[4], s[4]); }
    const core = g.createRadialGradient(cx, cy, 0, cx, cy, 220 * pulse * zoom * (R / 270));
    core.addColorStop(0, 'rgba(150,25,75,.55)'); core.addColorStop(1, 'rgba(150,25,75,0)');
    g.globalCompositeOperation = 'lighter'; g.fillStyle = core; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    const items = [], tileK = R / 270 * .5;
    for (const r of rings) {
      const tw = r.tile.width * tileK / R, n = Math.max(2, Math.floor(r.length * pulse / tw)), sp = r.length / n, off = t3 * r.speed;
      for (let k = 0; k < n; k++) {
        const d = k * sp + off; let p = sample(r, d), q = sample(r, d + .01);
        p = rot([p[0] * pulse, p[1] * pulse, p[2]], yaw, pitch); q = rot([q[0] * pulse, q[1] * pulse, q[2]], yaw, pitch);
        const [sx, sy, f] = proj(p), [qx, qy] = proj(q);
        let ang = Math.atan2(qy - sy, qx - sx); if (qx < sx) ang += Math.PI;
        items.push([p[2], 0, r.tile, sx, sy, f, ang]);
      }
    }
    for (const [tilt, rad, a0, spd, col] of orbits) {
      const a = a0 + t3 * spd; let p = [Math.cos(a) * rad, Math.sin(a) * rad * .25, Math.sin(a) * rad * .5];
      p = rot(rot(p, 0, tilt), yaw * .6, pitch); const [sx, sy, f] = proj(p);
      items.push([p[2], 1, col, sx, sy, f, 0]);
    }
    items.sort((a, b) => b[0] - a[0]);
    for (const [z, kind, obj, sx, sy, f, ang] of items) {
      const depth = clamp((z + 1.2) / 2.4);
      if (kind === 0) {
        const s = f * zoom * (.9 + .1 * pulse) * tileK;
        g.globalAlpha = lerp(1, .28, depth);
        g.setTransform(VP.DPR * s * Math.cos(ang), VP.DPR * s * Math.sin(ang), -VP.DPR * s * Math.sin(ang), VP.DPR * s * Math.cos(ang), VP.DPR * sx, VP.DPR * sy);
        g.drawImage(obj, -obj.width / 2, -obj.height / 2);
        g.setTransform(VP.DPR, 0, 0, VP.DPR, 0, 0);
      } else {
        const tw = .5 + .5 * Math.sin(t3 * 6 + sx * .05), sz = 14 * f * (R / 270) * (1.4 - depth);
        g.globalCompositeOperation = 'lighter'; g.globalAlpha = lerp(1, .2, depth) * (.55 + .45 * tw);
        g.drawImage(FX.S.glow[obj], sx - sz / 2, sy - sz / 2, sz, sz);
        g.globalCompositeOperation = 'source-over';
      }
    }
    g.globalAlpha = 1;
    // cycling caption
    capT += dt;
    const ci = Math.floor(capT / 2.6) % CAPS.length;
    if (ci !== capI) {
      capI = ci; const [txt, rtl] = CAPS[ci];
      gsap.to(cap, { opacity: 0, y: 6, duration: .3, onComplete: () => { setText(cap, txt); cap.classList.toggle('ur', !!rtl); cap.dir = rtl ? 'rtl' : 'ltr'; gsap.fromTo(cap, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6 }); } });
    }
    if (!nextShown && t3 > 6) { nextShown = true; showBtn($('#hNext')); }
  }
  c3.addEventListener('pointerdown', e => { dragging = true; last3 = [e.clientX, e.clientY]; c3.setPointerCapture(e.pointerId); });
  c3.addEventListener('pointermove', e => { if (!dragging || !last3) return; yawU += (e.clientX - last3[0]) * .008; pitchU = clamp(pitchU + (e.clientY - last3[1]) * .008, -1.2, 1.2); last3 = [e.clientX, e.clientY]; });
  const endDrag = () => { dragging = false; lastDrag = t3; last3 = null; };
  c3.addEventListener('pointerup', endDrag); c3.addEventListener('pointercancel', endDrag);
  c3.addEventListener('wheel', e => { e.preventDefault(); zoom = clamp(zoom - Math.sign(e.deltaY) * .08, .5, 2); }, { passive: false });

  $('#hLift').addEventListener('click', () => {
    hideBtn($('#hLift'));
    build3d(); t3 = 0; capI = -1; capT = 0; nextShown = false; yawU = 0; pitchU = 0; zoom = 1;
    mode = '3d'; cap.hidden = false;
    Sound.sfx('whoosh');
    gsap.to(c2, { opacity: 0, scale: .9, duration: 1.1, ease: 'power2.in' });
    gsap.to(c3, { opacity: 1, duration: 1.4, delay: .5 });
    gsap.to('#hLine', { opacity: 0, duration: .6 });
    gsap.fromTo('#hHint', { opacity: 0 }, { opacity: 1, duration: 1, delay: 2.5 });
    FX.ambient('hearts-rise', 1.4);
  });
  $('#hNext').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); App.go('tree', { type: 'circle', x: r.left + r.width / 2, y: r.top + r.height / 2, dur: 1.4 }); });

  D.enter = () => {
    mode = '2d'; running = true; lineShown = false; cap.hidden = true;
    gsap.set(c2, { opacity: 1, scale: 1 }); gsap.set(c3, { opacity: 0 }); gsap.set(['#hLine', '#hHint', cap], { opacity: 0 });
    hideBtn($('#hLift')); hideBtn($('#hNext'));
    build2d(); border.forEach(w => { w.isB = true; });
    t0 = performance.now() + 900; nextShim = 0;
    FX.ambient(null);
  };
  D.leave = () => {
    running = false;
    c2.width = 1; c2.height = 1;
    c3.width = 1; c3.height = 1;
    bake = null; bctx = null; rings = [];
  };
  D.resize = () => {
    if (!running) return;
    if (mode === '2d') { const el = (performance.now() - t0); build2d(); border.forEach(w => { w.isB = true; }); t0 = performance.now() - el; }
    else { g3 = sizeCanvas(c3); }
  };
  D.frame = (now, dt) => { if (!running) return; if (mode === '2d') frame2d(now); else frame3d(now, dt); };
})();
