'use strict';
/* ============ 5 · MAKE A WISH: four candles, four birthdays ============ */
(() => {
  const D = App.scene('wish', { tone: 'dark' });
  const el = D.el, cake = $('#cake'), flames = $$('.flame', cake), tilts = $$('.fl-tilt', cake);
  const memLabel = $('#memLabel'), memText = $('#memText'), memHint = $('#memHint');
  const wishReadyBtn = $('#wishReadyBtn'), blowBtn = $('#blowBtn'), nextBtn = $('#wishNext');
  const BD = G.birthdays || [];
  let lit = [false, false, false, false], phase = 'light', mic = null, blowAcc = 0, strength = 0, holdStart = 0, memTl = null, allLitReadyTime = 0;

  // split the title into letters once
  $$('#big .line').forEach((line, li) => {
    const text = line.textContent; line.textContent = ''; line.setAttribute('aria-label', text);
    [...text].forEach((c, i) => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true'); s.dataset.i = li * 5 + i; line.appendChild(s); });
  });
  setText($('#wishName'), HER);

  function say(label, text) {
    if (memTl) memTl.kill();
    memTl = gsap.timeline()
      .to([memLabel, memText], { opacity: 0, y: -6, duration: .25 })
      .add(() => { setText(memLabel, label); setText(memText, text); })
      .fromTo(memLabel, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .5 })
      .fromTo(memText, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .7 }, '-=.25');
  }
  function candlePoint(i) {
    const r = cake.getBoundingClientRect(), sx = r.width / 300, sy = r.height / 270;
    return [r.left + (105 + i * 30) * sx, r.top + 40 * sy];
  }
  function proceedToWish() {
    if (phase !== 'all_lit') return;
    phase = 'ready';
    hideBtn(wishReadyBtn);
    if (memHint) {
      gsap.to(memHint, { opacity: 0, duration: .25, onComplete: () => setText(memHint, '') });
    }
    say('Close your eyes', (window.GIFT && window.GIFT.lines && window.GIFT.lines.wishMake) || 'and make a wish.');
    showBtn(blowBtn, .8);
  }

  function light(i) {
    if (phase === 'done' || phase === 'blow') return;
    const b = BD[i] || { label: `Birthday #${i + 1}`, text: '' };
    if (lit[i]) { say(b.label, b.text); return; }
    lit[i] = true;
    flames[i].classList.add('lit');
    const [x, y] = candlePoint(i);
    glowBurst(x, y, 14, ['gold', 'amber', 'white'], 140, .7);
    Sound.sfx('chime'); vibrate(12);
    say(b.label, b.text);
    if (lit.every(Boolean) && phase === 'light') {
      phase = 'all_lit';
      allLitReadyTime = performance.now() + 500;
      setTimeout(() => {
        if (phase !== 'all_lit') return;
        if (memHint) {
          setText(memHint, 'tap to make a wish ✦');
          gsap.fromTo(memHint, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .6 });
        }
        showBtn(wishReadyBtn, .2);
      }, 700);
    }
  }
  $$('.candle-hit', cake).forEach(h => h.addEventListener('click', e => { e.stopPropagation(); light(+h.dataset.i); }));

  if (wishReadyBtn) {
    wishReadyBtn.addEventListener('click', e => {
      e.stopPropagation();
      proceedToWish();
    });
  }

  el.addEventListener('click', e => {
    if (phase !== 'all_lit') return;
    if (performance.now() < allLitReadyTime) return;
    if (e.target.closest && e.target.closest('.candle-hit')) return;
    if (e.target.closest && (e.target.closest('#blowBtn') || e.target.closest('#wishNext') || e.target.closest('#wishReadyBtn'))) return;
    proceedToWish();
  });

  async function startBlow() {
    hideBtn(blowBtn);
    phase = 'blow';
    say('Now blow', 'gently, right at your screen. Or press and hold the cake.');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('no mic');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      Sound.unlock();
      const an = Sound.ctx.createAnalyser(); an.fftSize = 1024;
      Sound.ctx.createMediaStreamSource(stream).connect(an);
      mic = { stream, an, buf: new Float32Array(an.fftSize) };
    } catch (e) {
      mic = null;
      if (phase === 'blow') say('Press and hold the cake', 'and blow your candles out. ♥');
    }
  }
  blowBtn.addEventListener('click', startBlow);
  cake.addEventListener('pointerdown', e => { if (phase === 'blow') { holdStart = performance.now(); cake.setPointerCapture(e.pointerId); } });
  const endHold = () => { holdStart = 0; };
  cake.addEventListener('pointerup', endHold); cake.addEventListener('pointercancel', endHold);

  function stopMic() { if (mic) { mic.stream.getTracks().forEach(t => t.stop()); mic = null; } }
  function blowOut() {
    phase = 'done'; stopMic(); holdStart = 0;
    Sound.sfx('puff'); vibrate([30, 40, 60]);
    flames.forEach((f, i) => setTimeout(() => {
      f.classList.remove('lit');
      const [x, y] = candlePoint(i);
      for (let k = 0; k < 7; k++) FX.add({ type: 'glow', sprite: FX.S.glow.grey, x: x + rand(-3, 3), y: y + 10, vx: rand(-8, 8), vy: rand(-40, -24), sway: rand(6, 14), swayF: rand(1, 2), life: rand(1.6, 2.6), size: rand(10, 20), alpha: .45, fadeIn: .2 });
    }, i * 90));
    setTimeout(() => {
      const r = $('#big').getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
      const orb = $('#orb');
      gsap.set(orb, { left: x, top: y, scale: 0, opacity: 1 });
      gsap.timeline().to(orb, { scale: 1.6, duration: .6, ease: 'back.out(2)' }).to(orb, { scale: Math.hypot(VP.W, VP.H) / 50, opacity: 0, duration: 1.4, ease: 'power2.in' });
      burst(x, y, 50, { speed: 520, hearts: .5, g: 260 });
      Sound.sfx('sparkle');
      if (window.confetti) {
        const colors = ['#ffd88a', '#ffffff', '#ff9db9', '#f45a8f', '#ffe2a8'];
        confetti({ particleCount: 90, spread: 70, origin: { x: .1, y: .75 }, angle: 60, colors, zIndex: 760, disableForReducedMotion: true });
        confetti({ particleCount: 90, spread: 70, origin: { x: .9, y: .75 }, angle: 120, colors, zIndex: 760, disableForReducedMotion: true });
        setTimeout(() => confetti({ particleCount: 120, spread: 120, startVelocity: 35, origin: { x: .5, y: .35 }, colors, zIndex: 760, disableForReducedMotion: true }), 500);
      }
      say('Happy Birthday', LINES.wishDone || 'I already got my wish.');
      showBtn(nextBtn, 2.4);
    }, 520);
  }
  nextBtn.addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    App.go('lily', { type: 'dip', color: '#05040a', x: r.left + r.width / 2, y: r.top, dur: 1.6 });
  });

  D.enter = () => {
    lit = [false, false, false, false]; phase = 'light'; blowAcc = 0; strength = 0; holdStart = 0; allLitReadyTime = 0;
    flames.forEach(f => f.classList.remove('lit')); tilts.forEach(t => { t.style.transform = ''; });
    hideBtn(wishReadyBtn); hideBtn(blowBtn); hideBtn(nextBtn);
    if (memHint) { setText(memHint, ''); gsap.set(memHint, { opacity: 0 }); }
    el.classList.remove('play'); void el.offsetWidth; el.classList.add('play');
    const chars = $$('#big .ch');
    gsap.fromTo(chars, { opacity: 0, y: '.4em', rotation: 4, filter: 'blur(8px)' }, { opacity: 1, y: 0, rotation: 0, filter: 'blur(0px)', clearProps: 'filter,transform', duration: .9, stagger: .07, delay: 1.1, ease: 'power3.out' });
    gsap.fromTo('#wishName', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.2, delay: 2.2 });
    gsap.fromTo(cake, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, delay: 1.8, ease: 'back.out(1.2)' });
    setText(memLabel, ''); setText(memText, '');
    setTimeout(() => { if (App.cur === D && phase === 'light' && !lit.some(Boolean)) say('Four candles', 'one for every birthday we have had together. Tap each one to light it.'); }, 2900);
    FX.ambient('dust', 3);
  };
  D.leave = () => { stopMic(); };
  D.frame = (now, dt) => {
    if (phase !== 'blow') return;
    let s = 0;
    if (mic) {
      mic.an.getFloatTimeDomainData(mic.buf);
      let sum = 0; for (let i = 0; i < mic.buf.length; i++) sum += mic.buf[i] * mic.buf[i];
      const rms = Math.sqrt(sum / mic.buf.length);
      s = clamp((rms - .02) / .12);
      if (rms > .085) blowAcc += dt; else blowAcc = Math.max(0, blowAcc - dt * .6);
      if (blowAcc > .35) { blowOut(); return; }
    }
    if (holdStart) {
      const h = clamp((now - holdStart) / 1300);
      s = Math.max(s, h);
      if (h >= 1) { blowOut(); return; }
    }
    strength = lerp(strength, s, .25);
    tilts.forEach((t, i) => { t.style.transform = `skewX(${-strength * (22 + i * 3)}deg) scaleY(${1 - strength * .35})`; });
  };
})();
