'use strict';
/* ============ 7 · THE LETTER ============ */
(() => {
  const D = App.scene('letter', { tone: 'dark' });
  const stage = $('#envStage'), env = $('#env3d'), flap = $('#envFlap'), seal = $('#envSeal'), lock = $('#envLock'), hint = $('#envHint');
  const peek = $('#letterPeek'), wrap = $('#paperWrap'), paper = $('#paper'), scroller = $('#paperScroll'), text = $('#paperText'), tipEl = $('#letterTip');
  const L = G.letter || { greeting: HER + ',', paragraphs: [] };
  let phase = 'keys', tl = null, holdUntil = 0, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function say(t) { gsap.to(hint, { opacity: 0, duration: .25, onComplete: () => { setText(hint, t); gsap.to(hint, { opacity: 1, duration: .6 }); } }); }

  function buildText() {
    text.innerHTML = '';
    const para = (str, cls) => {
      const p = document.createElement('p'); if (cls) p.className = cls;
      str.split(/\s+/).filter(Boolean).forEach((w, i, arr) => {
        const s = document.createElement('span'); s.className = 'w'; s.textContent = w; p.appendChild(s);
        if (i < arr.length - 1) p.appendChild(document.createTextNode(' '));
      });
      text.appendChild(p); return p;
    };
    para(L.greeting || HER + ',', 'greet');
    (L.paragraphs || []).forEach(s => para(s));
    if (L.closing) para(L.closing);
    if (L.urdu) { const u = document.createElement('p'); u.className = 'urdu'; u.lang = 'ur'; u.textContent = L.urdu; text.appendChild(u); }
    setText($('#signOff'), L.signoff || 'Yours, always,');
    setText($('#signName'), L.signature || G.me || '');
  }
  function follow(span) {
    if (performance.now() < holdUntil) return;
    const top = span.offsetTop + text.offsetTop;
    if (top + 40 > scroller.scrollTop + scroller.clientHeight * .78) scroller.scrollTo({ top: top - scroller.clientHeight * .45, behavior: 'smooth' });
  }
  function write() {
    phase = 'writing';
    Sound.duck(.5, 3);
    const words = $$('.w', text);
    tl = gsap.timeline({ onComplete: finish });
    let t = .6;
    for (const p of $$('p', text)) {
      if (p.classList.contains('urdu')) {
        tl.to(p, { opacity: 1, duration: 1.4, ease: 'power1.out' }, t); tl.call(follow, [p], t); t += 1.6; continue;
      }
      for (const w of $$('.w', p)) {
        tl.to(w, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power2.out', onComplete: () => { w.classList.add('done'); gsap.set(w, { clearProps: 'filter,transform' }); } }, t);
        tl.call(follow, [w], t);
        const s = w.textContent;
        t += .05 + Math.min(.12, s.length * .014);
        if (/[,;:]$/.test(s)) t += .24;
        if (/[.!?…]$/.test(s)) t += .5;
      }
      t += .7;
    }
    tl.to('#signName', { clipPath: 'inset(0 0% 0 0)', duration: 1.8, ease: 'power2.inOut' }, t);
    tl.call(() => follow($('#sign')), null, t);
    tl.to('#pressed', { opacity: .95, rotation: -8, duration: 1.4 }, t + 1);
    gsap.fromTo(tipEl, { opacity: 0 }, { opacity: 1, duration: 1, delay: 3 });
    gsap.to(tipEl, { opacity: 0, duration: 1, delay: 12 });
    return words;
  }
  function finish() {
    phase = 'done';
    Sound.duck(1, 4); Sound.sfx('soft');
    gsap.to(tipEl, { opacity: 0, duration: .5 });
    showBtn($('#letterNext'), 1.5);
  }
  paper.addEventListener('click', () => { if (phase === 'writing' && tl) { tl.timeScale(tl.timeScale() > 1 ? 1 : 5); } });
  ['wheel', 'touchstart'].forEach(ev => scroller.addEventListener(ev, () => { holdUntil = performance.now() + 4500; }, { passive: true }));

  function openSeal() {
    if (phase !== 'seal') return;
    phase = 'opening';
    seal.classList.remove('pulse');
    Sound.sfx('crack'); vibrate([30, 30, 50]);
    gsap.to('#sealL2', { x: -16, y: 14, rotation: -32, opacity: 0, duration: .9, ease: 'power2.in', transformOrigin: '50% 50%' });
    gsap.to('#sealR2', { x: 16, y: 14, rotation: 32, opacity: 0, duration: .9, ease: 'power2.in', transformOrigin: '50% 50%' });
    gsap.to(hint, { opacity: 0, duration: .4 });
    const tl2 = gsap.timeline({ delay: .5 });
    tl2.to(flap, { rotationX: 180, duration: 1.1, ease: 'power2.inOut', onUpdate() { if (this.progress() > .5) flap.style.zIndex = 1; } })
      .add(() => Sound.sfx('paper'))
      .to(peek, { yPercent: -62, duration: 1.1, ease: 'power2.out' }, '-=.15')
      .to(env, { y: VP.H * .25, opacity: 0, duration: .9, ease: 'power2.in' }, '+=.3')
      .add(() => {
        stage.hidden = true; wrap.hidden = false;
        gsap.fromTo(paper, { y: 30, scale: .92, opacity: 0, clipPath: 'inset(0% 0% 66.6% 0%)' }, { y: 0, scale: 1, opacity: 1, duration: .7, ease: 'power2.out' });
        gsap.to(paper, { clipPath: 'inset(0% 0% 33.3% 0%)', duration: .7, delay: .75, ease: 'power2.inOut', onStart: () => Sound.sfx('paper') });
        gsap.to(paper, { clipPath: 'inset(0% 0% 0% 0%)', duration: .8, delay: 1.5, ease: 'power2.inOut', onStart: () => Sound.sfx('paper') });
        gsap.fromTo('.fold', { opacity: 1 }, { opacity: .35, duration: 1.2, delay: 1.9 });
        later(write, 2600);
      });
  }
  seal.addEventListener('click', openSeal);

  function keysIn() {
    const holes = $$('circle.lk-hole', lock);
    const n = 4;
    for (let i = 0; i < n; i++) {
      later(() => {
        const h = holes[i].getBoundingClientRect();
        const k = document.createElement('div'); k.className = 'fly-key'; k.innerHTML = '<svg><use href="#keySym"/></svg>';
        document.body.appendChild(k);
        const sx = VP.W / 2 + (i - 1.5) * 64 - 29, sy = -40, ex = h.left + h.width / 2 - 52, ey = h.top + h.height / 2 - 12;
        gsap.set(k, { x: sx, y: sy, rotation: -30 });
        gsap.timeline({ onComplete: () => {
          k.remove();
          $$('.lk-hole', holes[i].parentNode).forEach(x => x.classList.add('in'));
          Sound.sfx('tick'); vibrate(10);
          const r = holes[i].getBoundingClientRect(); glowBurst(r.left + r.width / 2, r.top + r.height / 2, 8, ['gold', 'white'], 90, .6);
          if (i === n - 1) unlock();
        } })
          .to(k, { x: ex, y: ey, rotation: 0, scale: .9, duration: 1, ease: 'power3.inOut' })
          .to(k, { x: ex + 18, scale: .5, opacity: 0, duration: .25, ease: 'power2.in' });
      }, 900 + i * 520);
    }
  }
  function unlock() {
    later(() => {
      Sound.sfx('unlock'); vibrate([20, 30, 40]);
      gsap.timeline()
        .to('#lockShackle', { y: -12, duration: .35, ease: 'power2.out' })
        .to('#lockShackle', { rotation: 30, transformOrigin: '100% 100%', duration: .4, ease: 'back.out(2)' })
        .to(lock, { y: 60, rotation: 18, opacity: 0, duration: .8, ease: 'power2.in', delay: .3 })
        .add(() => { phase = 'seal'; seal.classList.add('pulse'); say((window.GIFT && window.GIFT.lines && window.GIFT.lines.letterSeal) || 'Now break the seal ♥'); });
    }, 450);
  }
  $('#letterNext').addEventListener('click', () => App.go('heart', { type: 'dip', color: '#000', dur: 1.8 }));

  D.enter = () => {
    timers.forEach(clearTimeout); timers = [];
    if (tl) { tl.kill(); tl = null; }
    phase = 'keys';
    stage.hidden = false; wrap.hidden = true;
    gsap.set(env, { y: 0, opacity: 1 });
    gsap.set(flap, { rotationX: 0 }); flap.style.zIndex = 4;
    gsap.set(peek, { yPercent: 0 });
    gsap.set(['#sealL2', '#sealR2'], { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set(lock, { y: 0, rotation: 0, opacity: 1 }); gsap.set('#lockShackle', { y: 0, rotation: 0 });
    $$('.lk-hole', lock).forEach(h => h.classList.remove('in'));
    seal.classList.remove('pulse');
    hideBtn($('#letterNext'));
    buildText(); scroller.scrollTop = 0;
    gsap.set('#signName', { clipPath: 'inset(0 100% 0 0)' }); gsap.set('#pressed', { opacity: 0, rotation: -14 });
    gsap.set(tipEl, { opacity: 0 });
    gsap.fromTo(env, { y: 50, opacity: 0, rotationX: 12 }, { y: 0, opacity: 1, rotationX: 0, duration: 1.4, delay: .4, ease: 'power3.out' });
    setText(hint, ''); later(() => say('Your four keys…'), 700);
    keysIn();
    FX.ambient('petals', .6);
  };
  D.leave = () => { timers.forEach(clearTimeout); timers = []; if (tl) tl.kill(); Sound.duck(1, 2); };
})();
