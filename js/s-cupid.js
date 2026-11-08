'use strict';
/* ============ 1 · CUPID'S HEART ============ */
(() => {
  const D = App.scene('cupid', { tone: 'light' });
  const heartBtn = $('#cupHeart'), bow = $('#cupBow'), arrow = $('#cupArrow'), str = $('#cupString'), nocked = $('#cupNocked');
  let aim = -0.6, busy = false, sparkAcc = 0;
  setText($('#cupCaption'), LINES.cupid || `for ${HER}, who holds my heart`);
  setText($('#cupHint'), LINES.cupidHint || 'this heart is yours, tap it');

  function center(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; }
  function bowCenter() { const prev = bow.style.transform; bow.style.transform = 'none'; const b = center(bow); bow.style.transform = prev; return b; }
  function aimBow() {
    if (App.cur !== D) return;
    const b = bowCenter(), h = center(heartBtn);
    aim = Math.atan2(h.y - b.y, h.x - b.x);
    bow.style.setProperty('--aim', aim + 'rad');
  }
  function fire() {
    if (busy || App.cur !== D || App.busy) return;
    busy = true; Sound.startMusic();
    aimBow();
    const b = bowCenter(), k = b.w / 100, h = center(heartBtn);
    bow.classList.add('drawn'); str.setAttribute('points', '44,6 30,50 44,94');
    setTimeout(() => {
      str.setAttribute('points', '44,6 44,50 44,94'); bow.classList.remove('drawn');
      nocked.style.opacity = 0; Sound.sfx('thwip');
      const aw = 68 * k, ah = 16 * k;
      arrow.style.transition = 'none'; arrow.style.width = aw + 'px'; arrow.style.height = ah + 'px'; arrow.style.opacity = 1;
      const sx = b.x + Math.cos(aim) * 18 * k, sy = b.y + Math.sin(aim) * 18 * k;
      const ex = h.x - Math.cos(aim) * 30 * k, ey = h.y - Math.sin(aim) * 30 * k;
      const t0 = performance.now(), dur = REDUCE ? 1 : 430;
      (function fly(now) {
        const u = clamp((now - t0) / dur), e = u * u * (1.4 - .4 * u);
        const arc = Math.sin(Math.PI * u) * Math.hypot(ex - sx, ey - sy) * .05;
        const x = lerp(sx, ex, e) + Math.sin(aim) * arc, y = lerp(sy, ey, e) - Math.cos(aim) * arc;
        arrow.style.transform = `translate(${x - aw / 2}px, ${y - ah / 2}px) rotate(${aim}rad)`;
        if (Math.random() < .7) FX.add({ x, y, vx: rand(-15, 15), vy: rand(-15, 15), life: .5, size: rand(2, 4.5), color: '#ffd88a' });
        if (u < 1) requestAnimationFrame(fly); else hit(h);
      })(t0);
    }, REDUCE ? 1 : 380);
  }
  function hit(h) {
    heartBtn.classList.add('hit'); vibrate([20, 40, 60]); Sound.sfx('pop');
    burst(h.x, h.y, 26, { speed: 300, hearts: .2, g: 200 });
    setTimeout(() => { arrow.style.transition = 'opacity .25s'; arrow.style.opacity = 0; burst(h.x, h.y, 60, { speed: 560, hearts: .6 }); Sound.sfx('sparkle'); }, 190);
    setTimeout(() => App.go('rose', { type: 'heart', x: h.x, y: h.y, dur: 1.6 }), 560);
  }
  D.el.addEventListener('click', fire);

  D.enter = () => {
    busy = false;
    heartBtn.classList.remove('hit'); nocked.style.opacity = 1;
    arrow.style.transition = 'none'; arrow.style.opacity = 0;
    D.el.classList.remove('play'); void D.el.offsetWidth; D.el.classList.add('play');
    FX.ambient('hearts-rise', .5);
    setTimeout(aimBow, 60);
    if (window.preloadStoryPhotos) window.preloadStoryPhotos();
    if (App.defs.rose && App.defs.rose.prepare) App.defs.rose.prepare();
  };
  D.shown = aimBow;
  D.resize = aimBow;
  D.frame = (now, dt) => {
    if (busy || REDUCE) return;
    sparkAcc += dt;
    if (sparkAcc < .11) return;
    sparkAcc = 0;
    const h = center(heartBtn), a = Math.random() * TAU, d = h.w * (.5 + Math.random() * .9);
    FX.add({ x: h.x + Math.cos(a) * d, y: h.y + Math.sin(a) * d * .8, vx: rand(-7, 7), vy: -18 - Math.random() * 24, life: 1.6 + Math.random(), size: 2 + Math.random() * 3.5, color: Math.random() < .55 ? '#ffc96b' : '#ff8fb3', fadeIn: .4 });
  };
  D.leave = () => { D.el.classList.remove('play'); };
})();
