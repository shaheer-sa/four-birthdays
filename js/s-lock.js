'use strict';
/* ============ 0 · LOCK: she types the code ============ */
(() => {
  const D = App.scene('lock', { tone: 'dark' });
  const dots = $('#codeDots'), slots = $('#codeSlots'), msg = $('#lockMsg');
  const CODE = String(G.code || '1234').replace(/\D/g, '');
  const FIRST = G.lockFirst || ['Not quite.', 'See those little hearts? One number in each.'];
  const HINTS = G.lockHints || ['Three days that matter. Yours, mine, and ours.'];
  let val = '', fails = 0, slotsOn = false, done = false, sayTl = null, revealTimer = null;

  slots.innerHTML = CODE.split('').map(() => '<span class="slot"><svg viewBox="-1.1 -1.05 2.2 2.1"><path d="M0 .9C-.2.7-1 .25-1-.25-1-.75-.4-1 0-.5.4-1 1-.75 1-.25 1 .25.2.7 0 .9Z"/></svg></span>').join('');
  const slotEls = $$('.slot', slots);

  function say(t, delay = 0) {
    if (sayTl) sayTl.kill();
    sayTl = gsap.timeline({ delay })
      .to(msg, { opacity: 0, y: -4, duration: .2 })
      .add(() => setText(msg, t))
      .to(msg, { opacity: 1, y: 0, duration: .45, ease: 'power2.out' });
  }
  function render(added) {
    if (slotsOn) {
      slotEls.forEach((s, i) => s.classList.toggle('on', i < val.length));
      if (added && val.length) gsap.fromTo(slotEls[val.length - 1], { scale: .55 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
      return;
    }
    while (dots.children.length > val.length) dots.lastChild.remove();
    while (dots.children.length < val.length) {
      const s = document.createElement('span'); s.className = 'dot'; s.textContent = '♥'; dots.appendChild(s);
      gsap.fromTo(s, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .35, ease: 'back.out(3)' });
    }
  }
  function press(k) {
    if (done) return;
    Sound.unlock(); Sound.sfx('tick'); vibrate(6);
    if (k === 'ok') { submit(); return; }
    if (k === 'del') val = val.slice(0, -1);
    else { const max = slotsOn ? CODE.length : 10; if (val.length >= max) return; val += k; }
    render(k !== 'del');
    if (slotsOn && val.length === CODE.length) setTimeout(submit, 280);
  }
  function submit() {
    if (done) return;
    if (!val) { say(G.lockEmpty || 'Type the numbers first.'); return; }
    if (val === CODE) { success(); return; }
    wrong();
  }
  function wrong() {
    fails++;
    Sound.sfx('wrong'); vibrate([30, 50, 30]);
    const target = slotsOn ? slots : dots;
    gsap.to(target, { keyframes: { x: [-10, 9, -7, 5, -2, 0] }, duration: .5, ease: 'none' });
    setTimeout(() => { val = ''; render(false); }, 420);
    if (fails === 1) {
      say(FIRST[0]);
      clearTimeout(revealTimer);
      revealTimer = setTimeout(() => {
        slotsOn = true; dots.hidden = true; slots.hidden = false; val = ''; render(false);
        gsap.fromTo(slotEls, { scale: 0, opacity: 0, y: 8 }, { scale: 1, opacity: 1, y: 0, duration: .6, stagger: .09, ease: 'back.out(2.4)' });
        say(FIRST[1] || '');
        Sound.sfx('soft');
      }, 2300);
    } else {
      say(HINTS[Math.min(fails - 2, HINTS.length - 1)]);
    }
  }
  function success() {
    done = true;
    try {
      sessionStorage.setItem('gift_unlocked', '1');
      sessionStorage.setItem('gift_keys', '0');
      history.pushState({ gift_guard: 1 }, '', location.pathname + location.search);
    } catch (e) {}
    if (window.requestWakeLock) window.requestWakeLock();
    if (window.preloadStoryPhotos) window.preloadStoryPhotos();
    if (!slotsOn) { slotsOn = true; dots.hidden = true; slots.hidden = false; }
    slotEls.forEach(s => s.classList.add('on', 'gold'));
    gsap.fromTo(slotEls, { scale: 1 }, { scale: 1.25, duration: .25, yoyo: true, repeat: 1, stagger: .05 });
    say('There you are. ♥');
    Sound.startMusic(); vibrate(40);
    setTimeout(() => {
      Sound.sfx('crack');
      gsap.to('#sealL1', { x: -16, y: 10, rotation: -28, opacity: 0, duration: 1.1, ease: 'power2.in', transformOrigin: '50% 50%' });
      gsap.to('#sealR1', { x: 16, y: 10, rotation: 28, opacity: 0, duration: 1.1, ease: 'power2.in', transformOrigin: '50% 50%' });
      gsap.to('#lockGlow', { scale: 3.2, opacity: 1, duration: 1.6, ease: 'power2.in' });
      const r = $('.lock-env').getBoundingClientRect();
      glowBurst(r.left + r.width / 2, r.top + r.height * .55, 40, ['gold', 'white', 'pink'], 320, 1.4);
    }, 700);
    setTimeout(() => App.go('cupid', { type: 'dip', color: '#fff4e6', dur: 2 }), 1700);
  }

  $('#lockPad').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) press(b.dataset.k); });
  document.addEventListener('keydown', e => {
    if (!App.cur || App.cur.id !== 'lock') return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
    else if (e.key === 'Enter') press('ok');
  });

  D.enter = () => { FX.ambient('dust', 5); };
  D.leave = () => { FX.ambient(null); };
})();
