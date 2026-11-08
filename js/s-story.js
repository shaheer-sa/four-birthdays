'use strict';
/* ============ 3 · OUR STORY: four seasons, four keys ============ */
(() => {
  const D = App.scene('story', { tone: 'light' });
  const el = D.el, table = $('#chTable'), tray = $('#keyTray'), hint = $('#chHint'), nextBtn = $('#chNext');
  const CH = G.chapters || [];
  const AMB = { spring: ['blossom', 4], monsoon: ['rain', 75], summer: ['fireflies', 3.2], autumn: ['leaves', 3.2] };
  const HINT = {
    spring: 'drag the photos around · tap one to turn it over',
    monsoon: 'wipe the fog off the glass with your finger · tap the photo to turn it',
    summer: 'tap a photo to turn it over',
    autumn: 'tap a photo to turn it over'
  };
  const ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5C10.8 19.4 3 14.6 3 8.9 3 6 5.3 3.7 8 3.7c1.7 0 3.1.9 4 2.2.9-1.3 2.3-2.2 4-2.2 2.7 0 5 2.3 5 5.2 0 5.7-7.8 10.5-9 11.6z" fill="currentColor"/></svg>';
  let idx = 0, keyFound = false, drags = [], hintTimer = null, flashAt = 0, layoutCache = null;
  if (window.Draggable) gsap.registerPlugin(Draggable);

  function buildTray() {
    tray.innerHTML = [0, 1, 2, 3].map(i => `<span class="kslot${i < App.keys ? ' got' : ''}"><svg><use href="#keySym"/></svg></span>`).join('');
  }
  function photo(src, season) {
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center';
    const img = document.createElement('img');
    img.alt = ''; img.draggable = false;
    const candidates = [];
    if (src) {
      candidates.push(src);
      const dot = src.lastIndexOf('.');
      if (dot > -1) {
        const base = src.slice(0, dot);
        const ext = src.slice(dot).toLowerCase();
        ['.jpeg', '.jpg', '.png', '.webp', '.JPEG', '.JPG', '.PNG'].forEach(alt => {
          if (alt !== ext && !candidates.includes(base + alt)) candidates.push(base + alt);
        });
      }
    }
    const applyRatio = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const ratio = img.naturalWidth / img.naturalHeight;
      const polPhoto = box.closest('.pol-photo');
      const pol = box.closest('.pol');
      if (polPhoto) {
        polPhoto.style.setProperty('--photo-ratio', `${img.naturalWidth} / ${img.naturalHeight}`);
      }
      if (pol && ratio > 1.2) {
        const curW = parseFloat(pol.style.width) || 200;
        const tableW = (table && table.clientWidth) || 400;
        const targetW = clamp(Math.round(curW * Math.min(1.35, Math.sqrt(ratio))), 160, Math.min(tableW * 0.72, 320));
        if (targetW > curW) {
          pol.style.width = targetW + 'px';
          if (pol._dr) pol._dr.update();
        }
      }
    };
    img.onload = applyRatio;
    let tryIdx = 0;
    img.onerror = () => {
      tryIdx++;
      if (tryIdx < candidates.length) {
        img.src = candidates[tryIdx];
        return;
      }
      const file = (src || '').split('/').pop() || 'photo';
      box.innerHTML = `<div class="ph ph-${season}">${ICON}<span></span></div>`;
      setText($('span', box), 'your photo: ' + file);
    };
    if (candidates.length) {
      img.src = candidates[0];
      if (img.complete && img.naturalWidth) setTimeout(applyRatio, 20);
    } else {
      setTimeout(img.onerror, 0);
    }
    box.appendChild(img);
    return box;
  }
  function isKeyTarget(target) {
    if (!target) return false;
    if (target.nodeType === 3) target = target.parentElement;
    if (target.classList && target.classList.contains('key-btn')) return true;
    if (typeof target.closest === 'function') {
      try { if (target.closest('.key-btn')) return true; } catch (e) {}
    }
    let cur = target;
    while (cur && cur !== document.body) {
      if (cur.classList && cur.classList.contains('key-btn')) return true;
      cur = cur.parentElement;
    }
    return false;
  }
  function polaroid(p, hasKey, season, w) {
    const d = document.createElement('div');
    d.className = 'pol'; d.style.width = w + 'px';
    d.innerHTML = `<div class="pol-in"><div class="pol-face pol-front"><div class="pol-photo"></div><p class="pol-cap"></p></div>
      <div class="pol-face pol-back"><p class="pol-note"></p>${hasKey ? '<button class="key-btn" data-clickable="true" aria-label="Take the golden key"><svg><use href="#keySym"/></svg></button>' : ''}<span class="pol-turn">tap to turn back</span></div></div>`;
    $('.pol-photo', d).appendChild(photo(p.src, season));
    setText($('.pol-cap', d), p.caption || '');
    setText($('.pol-note', d), p.note || '');
    if (hasKey) {
      const keyBtn = $('.key-btn', d);
      if (keyBtn) {
        let taken = false;
        const handleTake = e => {
          if (e) {
            e.stopPropagation();
            if (e.cancelable && e.type !== 'click') e.preventDefault();
          }
          if (taken) return;
          if (!d.classList.contains('flipped')) { flip(d); return; }
          taken = true;
          takeKey(keyBtn);
        };
        // Stop Draggable from intercepting touch gestures on the key
        keyBtn.addEventListener('pointerdown', e => e.stopPropagation());
        keyBtn.addEventListener('touchstart', e => e.stopPropagation(), { passive: true });
        keyBtn.addEventListener('pointerup', handleTake);
        keyBtn.addEventListener('touchend', handleTake);
        keyBtn.addEventListener('click', handleTake);
      }
    }
    return d;
  }
  function flip(d) {
    d.classList.toggle('flipped');
    Sound.sfx('paper'); vibrate(8);
  }
  function makeDraggable(d, baseRot) {
    if (!window.Draggable) {
      d.addEventListener('click', e => {
        if (isKeyTarget(e.target)) {
          if (d.classList.contains('flipped')) {
            const btn = $('.key-btn', d);
            if (btn) { takeKey(btn); return; }
          }
        }
        flip(d);
      });
      return;
    }
    const dr = Draggable.create(d, {
      type: 'x,y', bounds: table, edgeResistance: .65, zIndexBoost: true,
      dragClickables: false,
      onDrag() { gsap.to(d, { rotation: baseRot + clamp(this.deltaX * 1.6, -14, 14), duration: .3, overwrite: 'auto' }); },
      onRelease() { gsap.to(d, { rotation: baseRot, duration: .9, ease: 'elastic.out(1,.45)' }); },
      onClick(e) {
        const t = e ? (e.target || (e.touches && e.touches[0] && e.touches[0].target)) : null;
        if (isKeyTarget(t)) {
          if (d.classList.contains('flipped')) {
            const btn = $('.key-btn', d);
            if (btn) { takeKey(btn); return; }
          }
          return;
        }
        flip(d);
      }
    })[0];
    d._dr = dr;
    drags.push(dr);
  }

  /* monsoon: a rainy window she wipes clear */
  function rainWindow(w, h, ch) {
    const win = document.createElement('div');
    win.className = 'window'; win.style.width = w + 'px'; win.style.height = h + 'px';
    win.innerHTML = `<p class="win-hint">wipe the glass</p>
      <div class="win-in">
        <div class="win-face win-front">
          <div class="win-glass"></div>
          <span class="win-bar" style="left:50%;top:10px;bottom:10px;width:6px;margin-left:-3px"></span>
          <span class="win-bar" style="top:50%;left:10px;right:10px;height:6px;margin-top:-3px"></span>
        </div>
        <div class="win-face win-back">
          <div class="win-back-inner">
            <p class="win-back-note"></p>
            <span class="pol-turn">tap to turn back</span>
          </div>
        </div>
      </div>
      <p class="win-note"></p>`;
    const glass = $('.win-glass', win);
    glass.appendChild(photo(ch.window && ch.window.src, 'monsoon'));
    const noteText = (ch.window && ch.window.note) || '';
    const note = $('.win-note', win);
    setText(note, noteText);
    const backNote = $('.win-back-note', win);
    setText(backNote, noteText);
    const c = document.createElement('canvas'); glass.appendChild(c);
    const gw = w - 20, gh = h - 20;
    c.width = Math.round(gw); c.height = Math.round(gh);
    const g = c.getContext('2d', { willReadFrequently: true });
    const fg = g.createLinearGradient(0, 0, 0, gh); fg.addColorStop(0, 'rgba(222,230,242,.96)'); fg.addColorStop(1, 'rgba(196,206,222,.96)');
    g.fillStyle = fg; g.fillRect(0, 0, gw, gh);
    for (let i = 0; i < 380; i++) { g.fillStyle = `rgba(255,255,255,${rand(.05, .2)})`; g.fillRect(rand(0, gw), rand(0, gh), rand(1, 3), rand(1, 3)); }
    g.globalCompositeOperation = 'destination-out'; g.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      let x = rand(0, gw), y = rand(0, gh * .5); g.lineWidth = rand(1.4, 3); g.strokeStyle = `rgba(0,0,0,${rand(.35, .7)})`;
      g.beginPath(); g.moveTo(x, y); while (y < gh) { y += rand(6, 14); x += rand(-2, 2); g.lineTo(x, y); } g.stroke();
    }
    g.globalCompositeOperation = 'source-over';
    for (let i = 0; i < 46; i++) {
      const x = rand(0, gw), y = rand(0, gh), r = rand(1.5, 5);
      const dg = g.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r);
      dg.addColorStop(0, 'rgba(255,255,255,.9)'); dg.addColorStop(.6, 'rgba(170,185,210,.35)'); dg.addColorStop(1, 'rgba(110,125,150,.5)');
      g.fillStyle = dg; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    }
    let wiping = false, lastWipeEnd = 0, last = null, lastCheck = 0, cleared = false;
    const pos = e => { const r = c.getBoundingClientRect(); return [(e.clientX - r.left) * gw / r.width, (e.clientY - r.top) * gh / r.height]; };
    const wipe = (x, y) => {
      g.globalCompositeOperation = 'destination-out';
      const steps = last ? Math.max(1, Math.ceil(Math.hypot(x - last[0], y - last[1]) / 6)) : 1;
      for (let i = 1; i <= steps; i++) {
        const px = last ? lerp(last[0], x, i / steps) : x, py = last ? lerp(last[1], y, i / steps) : y;
        const br = g.createRadialGradient(px, py, 0, px, py, 26);
        br.addColorStop(0, 'rgba(0,0,0,.9)'); br.addColorStop(.6, 'rgba(0,0,0,.5)'); br.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = br; g.beginPath(); g.arc(px, py, 26, 0, TAU); g.fill();
      }
      g.globalCompositeOperation = 'source-over'; last = [x, y];
      const now = performance.now();
      if (!cleared && now - lastCheck > 250) {
        lastCheck = now;
        const data = g.getImageData(0, 0, c.width, c.height).data; let clear = 0, n = 0;
        for (let i = 3; i < data.length; i += 64) { n++; if (data[i] < 60) clear++; }
        if (clear / n > .5) {
          cleared = true; Sound.sfx('soft');
          gsap.to(c, { opacity: 0, duration: 1.2, onComplete: () => { c.style.pointerEvents = 'none'; } });
          gsap.fromTo(note, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1, delay: .5 });
          gsap.to($('.win-hint', win), { opacity: 0, duration: .5 });
        }
      }
    };
    function flipWin() {
      win.classList.toggle('flipped');
      Sound.sfx('paper');
      vibrate(8);
    }
    c.addEventListener('pointerdown', e => { wiping = true; last = null; c.setPointerCapture(e.pointerId); wipe(...pos(e)); });
    c.addEventListener('pointermove', e => { if (wiping) wipe(...pos(e)); });
    const stop = () => {
      if (wiping) lastWipeEnd = performance.now();
      wiping = false; last = null;
    };
    c.addEventListener('pointerup', stop); c.addEventListener('pointercancel', stop);
    win.addEventListener('click', e => {
      // Ignore the trailing click event fired right after finishing a wipe drag
      if (performance.now() - lastWipeEnd < 400) return;
      if (cleared || win.classList.contains('flipped') || (e.target && e.target.closest && e.target.closest('.win-back'))) {
        flipWin();
      }
    });
    return win;
  }

  function setChapterText(ch) {
    setText($('#chEye'), ch.eyebrow || ''); setText($('#chTitle'), ch.title || ''); setText($('#chBody'), ch.text || '');
  }
  function setSeason(season) {
    el.dataset.season = season;
    $$('.sbg', el).forEach(b => b.classList.toggle('on', b.dataset.s === season));
    el.classList.toggle('dark', season === 'monsoon'); el.classList.toggle('light', season !== 'monsoon');
    document.body.dataset.tone = season === 'monsoon' ? 'dark' : 'light';
    const a = AMB[season] || ['dust', 2]; FX.ambient(a[0], a[1]);
    Sound.duck(season === 'monsoon' ? .7 : 1, 3);
    flashAt = performance.now() + rand(5000, 9000);
  }
  function placeItems(ch, i) {
    table.innerHTML = ''; drags.forEach(d => d.kill()); drags = [];
    const r = table.getBoundingClientRect(), tw = r.width, th = r.height;
    if (tw < 40 || th < 40) return;
    const items = [];
    const photos = ch.photos || [];
    const keyAt = clamp(ch.key ?? photos.length - 1, 0, Math.max(0, photos.length - 1));
    if (ch.season === 'monsoon') {
      const ww = clamp(Math.min(tw * .6, th * .78 / 1.2), 140, 300), wh = ww * 1.2;
      const win = rainWindow(ww, wh, ch);
      table.appendChild(win);
      gsap.set(win, { x: Math.max(4, tw * .04), y: Math.max(16, (th - wh) * .18), rotation: -1.5 });
      items.push(win);
      photos.forEach((p, j) => {
        const w = clamp(Math.min(tw * .42, th * .55 / 1.25), 110, 220), h = w * 1.25;
        const d = polaroid(p, j === keyAt, ch.season, w); table.appendChild(d);
        const rot = rand(4, 9);
        gsap.set(d, { x: tw - w - tw * .03, y: Math.max(0, th - h - th * .03 - j * 20), rotation: rot });
        makeDraggable(d, rot); items.push(d);
      });
    } else {
      const n = Math.max(1, photos.length);
      const w = clamp(Math.min(tw * (n > 2 ? .4 : .5), th / 1.32), 110, 250), h = w * 1.25;
      photos.forEach((p, j) => {
        const d = polaroid(p, j === keyAt, ch.season, w); table.appendChild(d);
        const fx = n === 1 ? .5 : j / (n - 1);
        const x = lerp(tw * .04, tw - w - tw * .04, fx), y = (th - h) * (j % 2 ? .78 : .18);
        const rot = (j % 2 ? 1 : -1) * rand(3, 9);
        gsap.set(d, { x, y: Math.max(0, y), rotation: rot });
        makeDraggable(d, rot); items.push(d);
      });
    }
    gsap.from(items, { y: '-=' + (r.top + th + 80), rotation: () => rand(-35, 35), opacity: 0, duration: 1.1, stagger: .18, ease: 'back.out(1.15)', delay: .35 });
    setTimeout(() => Sound.sfx('paper'), 700);
  }
  function startChapter(i, first) {
    idx = i; keyFound = false;
    try { sessionStorage.setItem('story_chap', i); } catch (e) {}
    const ch = CH[i]; if (!ch) return;
    setSeason(ch.season);
    hideBtn(nextBtn);
    setChapterText(ch);
    gsap.fromTo(['#chEye', '#chTitle', '#chBody'], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1, stagger: .15, delay: first ? .6 : .2, ease: 'power2.out' });
    setText(hint, HINT[ch.season] || HINT.summer);
    gsap.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2 });
    requestAnimationFrame(() => placeItems(ch, i));
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { if (!keyFound && App.cur === D) { setText(hint, 'one of them is hiding something golden ✦'); gsap.fromTo(hint, { opacity: 0 }, { opacity: 1, duration: .8 }); } }, 16000);
  }
  function takeKey(btn) {
    if (keyFound) return;
    keyFound = true;
    const from = btn.getBoundingClientRect(), slot = $$('.kslot', tray)[Math.min(App.keys, 3)], to = slot.getBoundingClientRect();
    btn.style.visibility = 'hidden';
    const k = document.createElement('div'); k.className = 'fly-key'; k.innerHTML = '<svg><use href="#keySym"/></svg>';
    document.body.appendChild(k);
    const sx = from.left + from.width / 2 - 29, sy = from.top + from.height / 2 - 12, ex = to.left + to.width / 2 - 29, ey = to.top + to.height / 2 - 12;
    gsap.set(k, { x: sx, y: sy });
    Sound.sfx('chime'); vibrate([20, 30, 20]);
    glowBurst(from.left + from.width / 2, from.top + from.height / 2, 24, ['gold', 'white', 'amber'], 240, 1);
    gsap.timeline({ onComplete: () => { k.remove(); slot.classList.add('got'); Sound.sfx('sparkle'); glowBurst(to.left + to.width / 2, to.top + to.height / 2, 16, ['gold', 'white'], 140, .8); } })
      .to(k, { x: (sx + ex) / 2, y: Math.min(sy, ey) - 80, rotation: 200, scale: 1.4, duration: .55, ease: 'power2.out' })
      .to(k, { x: ex, y: ey, rotation: 360, scale: .55, duration: .55, ease: 'power2.in' });
    App.keys = Math.min(4, App.keys + 1);
    try { sessionStorage.setItem('gift_keys', String(App.keys)); } catch (e) {}
    clearTimeout(hintTimer);
    gsap.to(hint, { opacity: 0, duration: .5 });
    const label = CH[idx] && CH[idx].next ? CH[idx].next : 'next';
    setText($('span', nextBtn), label);
    showBtn(nextBtn, 1.2);
  }
  function leaveChapter(then) {
    hideBtn(nextBtn);
    const items = $$('.pol, .window', table);
    drags.forEach(d => d.disable());
    gsap.to(items, { y: '+=' + (VP.H), rotation: () => rand(-40, 40), opacity: 0, duration: .8, stagger: .06, ease: 'power2.in' });
    gsap.to(['#chEye', '#chTitle', '#chBody', hint], { opacity: 0, y: -10, duration: .6, stagger: .05, onComplete: () => setTimeout(then, 250) });
    Sound.sfx('whoosh');
  }
  nextBtn.addEventListener('click', e => {
    if (idx < CH.length - 1) { leaveChapter(() => startChapter(idx + 1)); return; }
    try { sessionStorage.removeItem('story_chap'); } catch (e) {}
    const r = e.currentTarget.getBoundingClientRect();
    App.go('jar', { type: 'curtain', x: r.left + r.width / 2, y: r.top, dur: 1.2 });
  });

  D.enter = () => {
    buildTray();
    table.innerHTML = '';
    let startCh = 0;
    try {
      const saved = sessionStorage.getItem('story_chap');
      if (saved !== null && !isNaN(+saved)) startCh = +saved;
    } catch (e) {}
    startChapter(clamp(startCh, 0, CH.length - 1), true);
  };
  D.leave = () => { clearTimeout(hintTimer); drags.forEach(d => d.kill()); drags = []; table.innerHTML = ''; Sound.duck(1, 2); };
  D.resize = () => {
    clearTimeout(layoutCache);
    layoutCache = setTimeout(() => { if (App.cur === D && CH[idx]) { placeItems(CH[idx], idx); if (keyFound) $$('.key-btn', table).forEach(b => { b.style.visibility = 'hidden'; }); } }, 250);
  };
  D.frame = now => {
    if (el.dataset.season !== 'monsoon' || REDUCE) return;
    if (now > flashAt) {
      flashAt = now + rand(8000, 14000);
      gsap.timeline().to('#stFlash', { opacity: .32, duration: .06 }).to('#stFlash', { opacity: 0, duration: .25 }).to('#stFlash', { opacity: .18, duration: .05 }).to('#stFlash', { opacity: 0, duration: .7 });
      if (Sound.ctx && !Sound.muted) setTimeout(() => { try { Sound.hiss(0, 2.2, .22, 'lowpass', 130, .7); } catch (e) { /* optional */ } }, 600);
    }
  };
  window.preloadStoryPhotos = () => {
    const sources = [];
    (CH || []).forEach(ch => {
      if (ch.window && ch.window.src) sources.push(ch.window.src);
      (ch.photos || []).forEach(it => { if (it && it.src) sources.push(it.src); });
    });
    sources.forEach(src => {
      const candidates = [src];
      const dot = src.lastIndexOf('.');
      if (dot > -1) {
        const base = src.slice(0, dot), ext = src.slice(dot).toLowerCase();
        ['.jpg', '.jpeg', '.png', '.webp'].forEach(alt => { if (alt !== ext && !candidates.includes(base + alt)) candidates.push(base + alt); });
      }
      (async () => {
        for (const u of candidates) {
          const im = new Image();
          im.src = u;
          try { if ('decode' in im) await im.decode(); break; } catch (e) {}
        }
      })();
    });
  };
})();
