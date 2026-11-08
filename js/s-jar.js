'use strict';
/* ============ 4 · JAR OF REASONS ============ */
(() => {
  const D = App.scene('jar', { tone: 'light' });
  const jar = $('#jar'), jin = $('#jarIn'), count = $('#jarCount'), overlay = $('#reason'), card = $('#reasonCard');
  const REASONS = G.reasons && G.reasons.length ? G.reasons : ['You.'];
  const COLORS = ['#ffb3c7', '#ff9db9', '#ffd1dc', '#ffc2a8', '#f9a8c6', '#ffe0a8', '#ffb8b8', '#f7c1d9'];
  const HPATH = 'M0 .9C-.2.7-1 .25-1-.25-1-.75-.4-1 0-.5.4-1 1-.75 1-.25 1 .25.2.7 0 .9Z';
  let hearts = [], opened = 0, cardOpen = false, busy = false, lastShake = 0, motionAsked = false;

  function fillJar() {
    jin.innerHTML = ''; hearts = [];
    const N = 24;
    const baseColX = [4, 28, 52, 73];
    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / 4), col = i % 4;
      const d = document.createElement('div'); d.className = 'pheart';
      const c = pick(COLORS);
      d.innerHTML = `<svg viewBox="-1.1 -1.05 2.2 2.1"><path d="${HPATH}" fill="${c}"/><path d="M-.75 -.45 L .55 .35" stroke="rgba(255,255,255,.7)" stroke-width=".07" fill="none"/><path d="M-.2 -.55 L .7 -.1" stroke="rgba(150,60,80,.18)" stroke-width=".05" fill="none"/></svg>`;
      let x = baseColX[col] + rand(-2, 2);
      if (row === 0) {
        if (col === 0) x += 7;
        if (col === 3) x -= 7;
      }
      d.style.left = clamp(x, 2, 75) + '%';
      d.style.bottom = (2 + row * 14 + rand(-2, 2)) + '%';
      d.style.transform = `rotate(${rand(-30, 30)}deg)`;
      jin.appendChild(d); hearts.push(d);
    }
  }
  function updateCount() {
    setText(count, opened ? `${opened} unfolded · countless still inside. Open as many as you want.` : '');
  }
  function takeOne() {
    if (busy || cardOpen || App.cur !== D) return;
    if (!motionAsked) {
      motionAsked = true;
      try { if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().catch(() => { }); } catch (e) { /* ignore */ }
    }
    busy = true;
    if (!hearts.length) fillJar();
    const h = hearts.pop(), r = h.getBoundingClientRect(), jr = jar.getBoundingClientRect();
    const fly = h.cloneNode(true);
    fly.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;z-index:690;margin:0;bottom:auto;transform:${h.style.transform}`;
    document.body.appendChild(fly); h.remove();
    Sound.sfx('pop'); vibrate(15);
    gsap.to(jar, { keyframes: { rotation: [-4, 3, -2, 0] }, duration: .5, transformOrigin: '50% 90%' });
    const cx = VP.W / 2 - r.width / 2, cy = VP.H / 2 - r.height / 2;
    gsap.timeline({ onComplete: () => { fly.remove(); openCard(); } })
      .to(fly, { y: jr.top - r.top - r.height * 1.4, rotation: rand(-30, 30), duration: .5, ease: 'power2.out' })
      .to(fly, { left: cx, top: cy, y: 0, scale: 3.4, rotation: 0, duration: .5, ease: 'power2.inOut' })
      .to(fly, { scale: 4.6, opacity: 0, duration: .25 });
  }
  function openCard() {
    const i = opened % REASONS.length;
    opened++;
    setText($('#reasonNum'), `reason no. ${opened}`);
    setText($('#reasonText'), REASONS[i]);
    overlay.hidden = false; cardOpen = true; busy = false;
    Sound.sfx('paper');
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: .3 });
    gsap.fromTo(card, { scaleY: .04, scaleX: .3, rotation: -8, opacity: .4 }, { scaleY: 1, scaleX: 1, rotation: 0, opacity: 1, duration: .8, ease: 'back.out(1.4)' });
    const rr = card.getBoundingClientRect();
    glowBurst(rr.left + rr.width / 2, rr.top + rr.height / 2, 18, ['pink', 'gold', 'white'], 260, .9);
    updateCount();
    if (opened === 3) showBtn($('#jarNext'), 1.2);
  }
  function closeCard() {
    if (!cardOpen) return;
    cardOpen = false;
    gsap.to(card, { scaleY: .05, scaleX: .4, y: 80, opacity: 0, duration: .45, ease: 'power2.in' });
    gsap.to(overlay, { opacity: 0, duration: .45, delay: .1, onComplete: () => { overlay.hidden = true; gsap.set(card, { y: 0 }); } });
  }
  jar.addEventListener('click', takeOne);
  jar.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); takeOne(); } });
  overlay.addEventListener('click', closeCard);
  addEventListener('devicemotion', e => {
    if (App.cur !== D || cardOpen) return;
    const a = e.accelerationIncludingGravity || e.acceleration; if (!a) return;
    const m = Math.hypot(a.x || 0, a.y || 0, a.z || 0), now = performance.now();
    if (m > 24 && now - lastShake > 1200) { lastShake = now; takeOne(); }
  });
  $('#jarNext').addEventListener('click', e => {
    closeCard();
    const r = e.currentTarget.getBoundingClientRect();
    App.go('wish', { type: 'circle', x: r.left + r.width / 2, y: r.top + r.height / 2, dur: 1.2 });
  });

  D.enter = () => {
    opened = 0; cardOpen = false; busy = false; overlay.hidden = true;
    fillJar(); updateCount(); hideBtn($('#jarNext'));
    gsap.fromTo(['.jar-title', '#jarSub'], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 1, stagger: .2, delay: .5 });
    gsap.fromTo(jar, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, delay: .7, ease: 'back.out(1.3)' });
    FX.ambient('hearts-fall', .8);
  };
  D.leave = () => { overlay.hidden = true; };
})();
