'use strict';
/* ============ 2 · WORD ROSE (port of rose.py) ============ */
(() => {
  const D = App.scene('rose', { tone: 'dark' });
  const cv = $('#roseCv'), tip = $('#roseTip');
  const VW = 800, VH = 800, DUR = 9, ANIM = .62, LIFT = 26, GAP = 1, CELL = 3;
  const HX = 400, HT = 70, HB = 480, HEAD_W = 250, BX = 400, BY = 240;

  const LANG = {
    'I LOVE YOU': 'English', 'I love you': 'English', 'LOVE': 'English', 'Love': 'English',
    'Te amo': 'Spanish', 'Ti amo': 'Italian', "Je t'aime": 'French', 'Ich liebe dich': 'German', 'Eu te amo': 'Portuguese',
    'Te quiero': 'Spanish', 'Ik hou van jou': 'Dutch', 'Jeg elsker dig': 'Danish', 'Jag älskar dig': 'Swedish', 'Jeg elsker deg': 'Norwegian',
    'Kocham cię': 'Polish', 'Miluji tě': 'Czech', 'Szeretlek': 'Hungarian', 'Te iubesc': 'Romanian', "Σ' αγαπώ": 'Greek', 'Я тебя люблю': 'Russian',
    'Volim te': 'Croatian', 'Ljubim te': 'Slovenian', 'Seni seviyorum': 'Turkish', 'Mahal kita': 'Filipino', 'Aku cinta kamu': 'Indonesian',
    'Anh yêu em': 'Vietnamese', 'Nakupenda': 'Swahili', 'Ngiyakuthanda': 'Zulu', 'Rakastan sinua': 'Finnish', 'Ég elska þig': 'Icelandic',
    'Is breá liom thú': 'Irish', 'Mi amas vin': 'Esperanto', "Rwy'n dy garu di": 'Welsh', 'Aloha au iā ʻoe': 'Hawaiian', 'Ti tengo caro': 'Italian',
    '我爱你': 'Chinese', '愛してる': 'Japanese', '사랑해': 'Korean', 'ฉันรักคุณ': 'Thai', 'أحبك': 'Arabic', 'אני אוהב אותך': 'Hebrew',
    'مجھے تم سے محبت ہے': 'Urdu', 'دوستت دارم': 'Persian', 'मैं तुमसे प्यार करता हूँ': 'Hindi', 'আমি তোমাকে ভালোবাসি': 'Bengali',
    'నేను నిన్ను ప్రేమిస్తున్నాను': 'Telugu', 'நான் உன்னை காதலிக்கிறேன்': 'Tamil',
    'AMOUR': 'French · love', 'AMORE': 'Italian · love', 'AMOR': 'Spanish · love', 'Amor': 'Spanish · love', 'LIEBE': 'German · love', 'Liebe': 'German · love',
    [HER]: 'my whole world'
  };
  NICKS.forEach(n => { LANG[n.text] = n.meaning; });
  const PHRASES = ['I LOVE YOU', 'I love you', 'Te amo', 'Ti amo', "Je t'aime", 'Ich liebe dich', 'Eu te amo', 'Te quiero', 'Ik hou van jou',
    'Jeg elsker dig', 'Jag älskar dig', 'Jeg elsker deg', 'Kocham cię', 'Miluji tě', 'Szeretlek', 'Te iubesc', "Σ' αγαπώ", 'Я тебя люблю',
    'Volim te', 'Ljubim te', 'Seni seviyorum', 'Mahal kita', 'Aku cinta kamu', 'Anh yêu em', 'Nakupenda', 'Ngiyakuthanda', 'Rakastan sinua',
    'Ég elska þig', 'Is breá liom thú', 'Mi amas vin', "Rwy'n dy garu di", 'Aloha au iā ʻoe', 'Ti tengo caro', '我爱你', '愛してる', '사랑해',
    'ฉันรักคุณ', 'أحبك', 'אני אוהב אותך', 'مجھے تم سے محبت ہے', 'دوستت دارم', 'मैं तुमसे प्यार करता हूँ', 'আমি তোমাকে ভালোবাসি',
    'నేను నిన్ను ప్రేమిస్తున్నాను', 'நான் உன்னை காதலிக்கிறேன்', 'LOVE', 'AMOUR', 'AMORE', 'AMOR', 'LIEBE', 'Love',
    HER].concat(NICKS.map(n => n.text));
  const SHORT = PHRASES.filter(p => p.length <= 11);
  const STEM_WORDS = ['LOVE', 'Amor', '사랑해', '我爱你', 'Ti amo', 'Te amo', 'AMORE', 'Liebe', '愛してる', 'أحبك', 'Love', 'AMOR', "Je t'aime"];
  const PETALS = ['#9a0a2c', '#b8002f', '#d0103c', '#e8174a', '#ff2d5a', '#ff5c7c'];
  const HIGHLIGHT = '#ffe3ea';
  const STEM_GREENS = ['#2e7d32', '#388e3c', '#43a047'];
  const LEAF_GREENS = ['#2e7d32', '#43a047', '#66bb6a', '#7cb342', '#9ccc65'];
  const FONT = (px, b) => `${b ? '700 ' : ''}${px}px Georgia, "Times New Roman", serif`;
  const mctx = document.createElement('canvas').getContext('2d');
  const sizes = new Map();
  function tsize(px, b, text) {
    const k = px + (b ? 'b' : 'n') + text;
    let v = sizes.get(k);
    if (!v) { mctx.font = FONT(px, b); v = [mctx.measureText(text).width, px * 1.15 * .64]; sizes.set(k, v); }
    return v;
  }
  function inHead(x, y) {
    if (y < HT || y > HB) return false;
    const t = (y - HT) / (HB - HT);
    const hw = HEAD_W * Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), .55);
    if (Math.abs(x - HX) > hw) return false;
    return y >= HT + 24 * Math.abs(Math.sin(Math.PI * (x - HX) / 125));
  }
  const stemX = y => HX + 9 * Math.sin((y - HB) / 55);
  const inStem = (x, y) => y >= HB - 8 && y <= VH - 18 && Math.abs(x - stemX(y)) <= 28;
  function makeLeaf(cx, cy, a, b, ang) {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    return [(x, y) => {
      const dx = x - cx, dy = y - cy, u = dx * ca + dy * sa, v = -dx * sa + dy * ca;
      if (Math.abs(u) > a) return false;
      return Math.abs(v) <= b * (1 - (u / a) * (u / a));
    }, [cx - a, cy - a * .6, cx + a, cy + a * .6]];
  }

  let words = null, nameW = null, g = null, bake = null, bctx = null;
  let nameCanvasMin = null, nameCanvasMax = null;
  let S = 1, OX = 0, OY = 0, t0 = 0, running = false, ptr = 0, active = [], twk = [], nextTw = 0, finished = false, tipTimer = null;
  let buildState = null, buildScheduled = false;

  function placeWord(s, group, pred, box, tiers, wordsFn, colorFn, near) {
    const [x0, y0, x1, y1] = box;
    for (const [px, bold, target, tries] of tiers) {
      let placed = 0;
      for (let i = 0; i < tries && placed < target; i++) {
        const text = s.choice(wordsFn(px)), [w, h] = tsize(px, bold, text);
        const x = x0 + s.rng() * (x1 - x0), y = y0 + s.rng() * (y1 - y0);
        if (near && Math.hypot(x - near[0], y - near[1]) > near[2]) continue;
        if (!s.fits(pred, x, y, w, h)) continue;
        s.mark(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
        s.add(group, x, y, text, px, bold, colorFn(x, y)); placed++;
      }
    }
  }

  function fillWords(s, group, pred, box, sizesAt, wordsFn, colorFn, stepY = 4, stepX = 3) {
    const [x0, y0, x1, y1] = box;
    for (let y = y0; y <= y1; y += stepY) {
      let x = x0;
      while (x <= x1) {
        let placed = false;
        for (const [px, bold] of sizesAt(x, y)) {
          const text = s.choice(wordsFn(px)), [w, h] = tsize(px, bold, text), cx = x + w / 2;
          if (s.fits(pred, cx, y, w, h)) { s.mark(x, y - h / 2, x + w, y + h / 2); s.add(group, cx, y, text, px, bold, colorFn(cx, y)); x += w + GAP; placed = true; break; }
        }
        if (!placed) x += stepX;
      }
    }
  }

  function buildChunk(deadline) {
    if (words) return true;
    if (!buildState) {
      const rng = rngFrom(17), choice = a => a[(rng() * a.length) | 0];
      const gw = Math.floor(VW / CELL) + 2, gh = Math.floor(VH / CELL) + 2, grid = new Uint8Array(gw * gh);
      const cells = (x0, y0, x1, y1) => [Math.max(0, Math.floor(x0 / CELL)), Math.max(0, Math.floor(y0 / CELL)), Math.min(gw - 1, Math.floor(x1 / CELL)), Math.min(gh - 1, Math.floor(y1 / CELL))];
      const free = (x0, y0, x1, y1) => { const [a, b, c, d] = cells(x0, y0, x1, y1); for (let gy = b; gy <= d; gy++) { const row = gy * gw; for (let gx = a; gx <= c; gx++) if (grid[row + gx]) return false; } return true; };
      const mark = (x0, y0, x1, y1) => { const [a, b, c, d] = cells(x0, y0, x1, y1); for (let gy = b; gy <= d; gy++) grid.fill(1, gy * gw + a, gy * gw + c + 1); };
      const fits = (pred, x, y, w, h) => {
        const a = x - w / 2, b = y - h / 2, c = x + w / 2, d = y + h / 2;
        if (!pred(a, b) || !pred(c, b) || !pred(a, d) || !pred(c, d) || !pred(x, b) || !pred(x, d)) return false;
        return free(a - GAP, b - GAP, c + GAP, d + GAP);
      };
      const W = [];
      const add = (group, x, y, text, px, bold, color) => { const [w, h] = tsize(px, bold, text); W.push({ group, x, y, text, font: FONT(px, bold), color, w, h, start: 0, baked: false }); };
      function petalColor(x, y) {
        if (rng() < .035) return HIGHLIGHT;
        const dx = x - BX, dy = y - BY, d = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
        let s = .5 + .5 * Math.sin(3 * th + d / 26);
        s = s * .72 + .28 * (1 - Math.min(d / 260, 1));
        s = clamp(s + (rng() * .24 - .12), 0, .999);
        return PETALS[Math.floor(s * PETALS.length)];
      }
      const roseText = (window.GIFT && window.GIFT.lines && window.GIFT.lines.roseCenter) || (window.GIFT && window.GIFT.roseCenter) || 'My Love of Life';
      const rosePx = 28;
      const [nw, nh] = tsize(rosePx, true, roseText);
      mark(BX - nw / 2 - 8, BY - nh / 2 - 6, BX + nw / 2 + 8, BY + nh / 2 + 6);
      nameW = { x: BX, y: BY, text: roseText, w: nw, h: nh, px: rosePx };

      const flowerWords = px => (px >= 17 ? SHORT : PHRASES);
      const headBox = [HX - HEAD_W, HT, HX + HEAD_W, HB];

      buildState = { step: 0, rng, choice, grid, cells, free, mark, fits, W, add, petalColor, flowerWords, headBox, currY: HT, stepY: 4, stepX: 3 };
    }

    const s = buildState;
    const hasTime = () => (deadline ? deadline.timeRemaining() > 3 : true);

    while (s.step < 4) {
      if (s.step === 0) {
        placeWord(s, 'flower', inHead, s.headBox, [[22, true, 6, 600], [17, true, 18, 1200]], s.flowerWords, s.petalColor, [BX, BY, 150]);
        s.step = 1;
        if (!hasTime()) return false;
      }
      if (s.step === 1) {
        const [x0, y0, x1, y1] = s.headBox;
        while (s.currY <= y1) {
          let x = x0;
          const y = s.currY;
          while (x <= x1) {
            const d = Math.hypot(x - BX, y - BY);
            const opts = d < 130 ? [[19, true], [16, true], [14, true], [13, true], [11, false], [10, false]]
              : d < 210 ? [[15, true], [14, true], [12, true], [11, false], [10, false], [9, false]]
                : [[13, true], [12, true], [11, false], [10, false], [9, false]];
            const k = Math.floor(s.rng() * 3);
            const sizesList = opts.slice(k).concat(opts.slice(0, k).reverse());
            let placed = false;
            for (const [px, bold] of sizesList) {
              const text = s.choice(s.flowerWords(px)), [w, h] = tsize(px, bold, text), cx = x + w / 2;
              if (s.fits(inHead, cx, y, w, h)) {
                s.mark(x, y - h / 2, x + w, y + h / 2);
                s.add('flower', cx, y, text, px, bold, s.petalColor(cx, y));
                x += w + GAP;
                placed = true;
                break;
              }
            }
            if (!placed) x += s.stepX;
          }
          s.currY += s.stepY;
          if (!hasTime()) return false;
        }
        s.step = 2;
      }
      if (s.step === 2) {
        fillWords(s, 'stem', inStem, [HX - 40, HB - 8, HX + 40, VH - 18], () => [[12, true], [11, false], [10, false]], () => STEM_WORDS, () => s.choice(STEM_GREENS), 5);
        for (const [cx, cy, a, b, ang] of [[HX - 110, 615, 105, 34, .32], [HX + 118, 660, 112, 32, -.30]]) {
          const [pred, box] = makeLeaf(cx, cy, a, b, ang);
          fillWords(s, 'leaf', pred, box, () => [[12, true], [11, true], [10, false], [9, false]], () => SHORT, () => s.choice(LEAF_GREENS));
        }
        s.step = 3;
        if (!hasTime()) return false;
      }
      if (s.step === 3) {
        const spread = (items, a, b) => { const n = Math.max(1, items.length - 1); items.forEach((w, i) => { w.start = DUR * (a + (b - a) * i / n); }); };
        const end = 1 - ANIM / DUR;
        spread(s.W.filter(w => w.group === 'stem').sort((a, b) => b.y - a.y), 0, .22);
        spread(s.W.filter(w => w.group === 'leaf').sort((a, b) => Math.abs(a.x - HX) - Math.abs(b.x - HX)), .18, .38);
        spread(s.W.filter(w => w.group === 'flower').map(w => [w, Math.hypot(w.x - BX, w.y - BY) + (s.rng() * 50 - 25)]).sort((a, b) => a[1] - b[1]).map(p => p[0]), .35, end);
        s.W.sort((a, b) => a.start - b.start);
        words = s.W;
        buildState = null;
        s.step = 4;
        return true;
      }
    }
    return true;
  }

  function scheduleBuild() {
    if (words || buildScheduled) return;
    buildScheduled = true;
    const idle = window.requestIdleCallback || (fn => setTimeout(() => fn({ timeRemaining: () => 15 }), 50));
    idle(deadline => {
      buildScheduled = false;
      const done = buildChunk(deadline);
      if (!done && !words) scheduleBuild();
    });
  }

  function layout() {
    S = Math.min((VP.W * .96) / VW, (VP.H * .66) / VH);
    OX = (VP.W - VW * S) / 2;
    OY = Math.max(VP.H * .06, VP.H * .38 - VH * S * .5);
    g = sizeCanvas(cv);
    bake = document.createElement('canvas'); bake.width = cv.width; bake.height = cv.height;
    bctx = bake.getContext('2d');
    bctx.setTransform(VP.DPR * S, 0, 0, VP.DPR * S, VP.DPR * OX, VP.DPR * OY);
    bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
    if (words) for (const w of words) if (w.baked) drawWord(bctx, w, 1, 0);

    // Glowing centre text: each blur level (8..20, the original pulse range) is rendered once on first use
    // at the exact device scale of the main canvas and cached, so frames never pay for shadowBlur
    nameCanvasMin = {}; nameCanvasMax = null;
  }
  function nameGlow(blur) {
    let c = nameCanvasMin[blur];
    if (c) return c;
    const K = VP.DPR * S, pad = Math.ceil(60 * VP.DPR);
    c = document.createElement('canvas');
    c.width = Math.ceil(nameW.w * K) + pad * 2; c.height = Math.ceil(nameW.h * K) + pad * 2;
    const x = c.getContext('2d');
    x.setTransform(K, 0, 0, K, c.width / 2, c.height / 2);
    x.shadowColor = 'rgba(255,190,140,.95)'; x.shadowBlur = blur * VP.DPR;
    x.font = FONT(nameW.px || 28, true); x.fillStyle = '#ffe2b8';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(nameW.text, 0, 0);
    return (nameCanvasMin[blur] = c);
  }
  function drawWord(c, w, a, lift, color) { c.globalAlpha = a; c.font = w.font; c.fillStyle = color || w.color; c.fillText(w.text, w.x, w.y + lift); }

  function showTip(x, y) {
    if (!words) return;
    const vx = (x - OX) / S, vy = (y - OY) / S;
    let hit = null;
    if (nameW && Math.abs(vx - nameW.x) < (nameW.w / 2 + 10) && Math.abs(vy - nameW.y) < (nameW.h / 2 + 8) && finished) hit = { text: nameW.text, lang: 'the only one in the middle' };
    else for (const w of words) {
      if ((w.baked || active.includes(w)) && Math.abs(vx - w.x) <= w.w / 2 + 1 && Math.abs(vy - w.y) <= w.h / 2 + 2) { hit = { text: w.text, lang: LANG[w.text] || '' }; break; }
    }
    if (!hit) return false;
    tip.innerHTML = '';
    const b = document.createElement('b'); b.textContent = hit.text; tip.appendChild(b);
    if (hit.lang) tip.appendChild(document.createTextNode('  ·  ' + hit.lang));
    tip.style.left = x + 'px'; tip.style.top = y + 'px';
    gsap.to(tip, { opacity: 1, duration: .2 });
    clearTimeout(tipTimer); tipTimer = setTimeout(() => gsap.to(tip, { opacity: 0, duration: .4 }), 1600);
    return true;
  }
  cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') showTip(e.clientX, e.clientY); });
  cv.addEventListener('pointerdown', e => {
    const onWord = showTip(e.clientX, e.clientY);
    for (let i = 0; i < (onWord ? 4 : 9); i++) {
      FX.add({ type: 'sprite', sprite: pick(FX.S.petals), x: e.clientX, y: e.clientY, vx: rand(-160, 160), vy: rand(-220, -60), g: 140, vmax: 90, drag: .99, life: 6, size: rand(12, 22), rot: rand(0, TAU), vr: rand(-3, 3), sway: rand(10, 30), swayF: rand(1, 2.5), flipF: rand(2, 4), fadeIn: .05 });
    }
  });
  $('#roseNext').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); App.go('story', { type: 'circle', x: r.left + r.width / 2, y: r.top + r.height / 2, dur: 1.3 }); });

  D.prepare = () => { scheduleBuild(); };
  D.enter = () => {
    if (!words) {
      while (!buildChunk(null)) { }
    }
    for (const w of words) w.baked = false;
    layout();
    ptr = 0; active = []; twk = []; finished = false; running = true;
    t0 = performance.now() + 700;
    setText($('#roseL1'), LINES.rose || "Four birthdays with you, and I'm still growing something for you.");
    setText($('#roseL2'), LINES.roseHint || 'tap a word to see which language it is in');
    gsap.set(['#roseL1', '#roseL2'], { opacity: 0 });
    hideBtn($('#roseNext'));
    FX.ambient('dust', 3);
  };
  D.leave = () => {
    running = false;
    cv.width = 1; cv.height = 1;
    bake = null; bctx = null;
    nameCanvasMin = null; nameCanvasMax = null;
  };
  D.resize = () => { if (running) layout(); };
  D.frame = now => {
    if (!running || !words) return;
    const t = (now - t0) / 1000;
    while (ptr < words.length && words[ptr].start <= t) active.push(words[ptr++]);
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(bake, 0, 0);
    g.setTransform(VP.DPR * S, 0, 0, VP.DPR * S, VP.DPR * OX, VP.DPR * OY);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const still = [];
    for (const w of active) {
      const p = (t - w.start) / ANIM;
      if (p >= 1) { w.baked = true; drawWord(bctx, w, 1, 0); drawWord(g, w, 1, 0); continue; }
      const e = 1 - Math.pow(1 - p, 3);
      drawWord(g, w, e, LIFT * (1 - e)); still.push(w);
    }
    active = still;

    // her name, glowing at the centre (smooth crossfade between pre-rendered glow passes, 0 per-frame shadowBlur)
    if (t > DUR - .5 && nameW && nameCanvasMin) {
      const q = clamp((t - (DUR - .5)) / 1.6);
      const img = nameGlow(Math.round(14 + 6 * Math.sin(now * .003)));
      const K = VP.DPR * S;
      const cx = VP.DPR * OX + nameW.x * K, cy = VP.DPR * OY + (nameW.y + 12 * (1 - ease3(q))) * K;
      g.save();
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalAlpha = ease3(q);
      g.drawImage(img, Math.round(cx - img.width / 2), Math.round(cy - img.height / 2));
      g.restore();
    }
    g.globalAlpha = 1;

    // twinkles once the rose is complete
    if (ptr >= words.length && !active.length) {
      if (!finished) {
        finished = true;
        fadeIn($('#roseL1'), .6, 1.4); fadeIn($('#roseL2'), 1.6, 1);
        showBtn($('#roseNext'), 2.6);
        FX.ambient('petals', .7);
        Sound.sfx('soft');
      }
      if (now > nextTw) {
        nextTw = now + 140;
        const w = words[(Math.random() * words.length) | 0];
        if (w.group === 'flower') twk.push([w, now]);
      }
      twk = twk.filter(([w, s]) => {
        const q = (now - s) / 420; if (q >= 1) return false;
        drawWord(g, w, Math.sin(Math.PI * q), 0, HIGHLIGHT); return true;
      });
    }
  };
})();
