'use strict';
/* ============ start everything ============ */
(() => {
  FX.init();
  buildProgress();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    try { if (App.prev && App.prev.frame) App.prev.frame(now, dt); } catch (e) { console.error(e); App.prev.frame = null; }
    try { if (App.cur && App.cur.frame) App.cur.frame(now, dt); } catch (e) { console.error(e); App.cur.frame = null; }
    FX.update(dt); FX.draw();
    requestAnimationFrame(loop);
  }

  // Android address-bar resize jank: ignore height delta < 150px if width unchanged
  let rz = null, lastW = innerWidth, lastH = innerHeight;
  addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      const curW = innerWidth, curH = innerHeight;
      const widthChanged = Math.abs(curW - lastW) > 2;
      const heightDelta = Math.abs(curH - lastH);

      VP.W = curW; VP.H = curH; VP.DPR = Math.min(2, window.devicePixelRatio || 1);
      FX.resize();

      if (!widthChanged && heightDelta < 150) {
        lastH = curH;
        return;
      }
      lastW = curW; lastH = curH;
      for (const d of Object.values(App.defs)) {
        try { if (d.resize && (d === App.cur || d === App.prev)) d.resize(); } catch (e) { console.error(e); }
      }
    }, 160);
  });

  // first touch unlocks audio; once past the lock screen, music starts on any tap
  document.addEventListener('pointerdown', () => {
    Sound.unlock();
    if (App.cur && App.cur.id !== 'lock') {
      Sound.startMusic();
      if (window.requestWakeLock) window.requestWakeLock();
    }
  }, { capture: true });

  const mute = $('#muteBtn');
  mute.addEventListener('click', e => {
    e.stopPropagation();
    const m = !Sound.muted; Sound.setMute(m);
    mute.classList.toggle('muted', m);
    mute.setAttribute('aria-label', m ? 'Play music' : 'Mute music');
  });

  // Strip any hash on live site immediately on load
  const isDev = window.DEV;
  if (!isDev && location.hash) {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
  }

  // Restore last active screen or jump hash so refreshing stays on the current screen during testing
  let jump = isDev ? location.hash.slice(1) : '';
  const isDevJump = Boolean(jump && App.defs[jump] && jump !== 'lock');

  if (!jump) {
    try {
      const unlocked = sessionStorage.getItem('gift_unlocked');
      if (unlocked === '1') {
        jump = sessionStorage.getItem('last_scene');
      }
    } catch (e) {}
  }

  if (jump && App.defs[jump] && jump !== 'lock') {
    if (isDevJump) {
      App.keys = 4;
    } else {
      let savedKeys = 0;
      try {
        const k = sessionStorage.getItem('gift_keys');
        if (k != null && !isNaN(+k)) savedKeys = parseInt(k, 10);
      } catch (e) {}
      App.keys = savedKeys;
    }
    App.go(jump, { force: true });
    if (window.requestWakeLock) window.requestWakeLock();
  } else {
    // Show lock screen with loading state if assets still loading
    const lockEl = $('#sc-lock');
    if (lockEl) lockEl.classList.add('loading');
    App.go('lock', { force: true, dur: .8 });

    const fontCheck = document.fonts ? Promise.all([
      document.fonts.load('400 24px "Abril Fatface"').catch(() => {}),
      document.fonts.load('italic 16px "Cormorant Garamond"').catch(() => {})
    ]) : Promise.resolve();

    const gsapCheck = new Promise(res => {
      if (window.gsap) res();
      else {
        const chk = setInterval(() => { if (window.gsap) { clearInterval(chk); res(); } }, 40);
        setTimeout(() => { clearInterval(chk); res(); }, 3500);
      }
    });

    const maxWait = new Promise(res => setTimeout(res, 4000));

    Promise.race([Promise.all([fontCheck, gsapCheck]), maxWait]).then(() => {
      if (lockEl) {
        lockEl.classList.remove('loading');
        if (window.gsap) {
          gsap.fromTo(['.lock-title', '.lock-sub', '.code-row', '.pad'],
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: .5, stagger: .07, ease: 'power2.out' }
          );
        }
      }
    });
  }

  requestAnimationFrame(loop);

  // Warm up fonts and prepare rose in idle time
  const idle = window.requestIdleCallback || (f => setTimeout(f, 400));
  idle(() => {
    try {
      if (document.fonts && document.fonts.load) {
        const fontsToWarm = [
          '500 16px "Caveat"', '600 16px "Caveat"',
          '400 16px "Great Vibes"', '400 16px "Abril Fatface"',
          '500 16px "Cormorant Garamond"', '600 16px "Cormorant Garamond"',
          'italic 400 16px "Cormorant Garamond"', 'italic 500 16px "Cormorant Garamond"',
          '500 16px "Noto Nastaliq Urdu"'
        ];
        fontsToWarm.forEach(f => {
          try { document.fonts.load(f, f.includes('Urdu') ? 'سالگرہ مبارک' : 'Happy Birthday'); } catch (e) {}
        });
      }
    } catch (e) {}
    try { if (App.defs.rose && App.defs.rose.prepare) App.defs.rose.prepare(); } catch (e) { console.error(e); }
  });
})();
