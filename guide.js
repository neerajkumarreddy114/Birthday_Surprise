/* ===== Avatar guide: poses, voice, pointing at the REAL buttons, journey steps ===== */
(() => {
  const $ = s => document.querySelector(s);
  const IMG = n => `assets/avatar/${n}.png`;
  /* Messages (edit text here). Stages with no matching screen on this site (e.g. a "memories" page) are simply not used. */
  const WELCOME = "Hey Potti! ❤️ It's me! I've made a little surprise just for you. Are you ready to begin our special journey?";
  const LETTER = "Hey Potti, I have a few things I've been wanting to tell you. Open this little letter from my heart.";
  const GIFT = "Potti, there's one more special surprise waiting for you! Take a deep breath and tap the button when you're ready.";
  const FINAL = "Happy Birthday, Potti! ❤️ I made this little surprise with so much love. I hope it brings the biggest smile to your face.";
  /* screen number -> steps. t = real DOM target, pose = pose when pointing, wait = target appears later, keep = stay until screen changes */
  const STEPS = {
    1: [{ t: '#card', pose: 'welcome', say: WELCOME }],
    2: [{ t: '#pad', pose: 'think', say: 'Potti, this little lock only opens for you. Enter our special code to continue.', keep: 1 }],
    3: [{ t: '#yes', pose: 'guide', say: 'Are you excited for what comes next, Potti? Tap "Yes" and let\'s go!' }],
    4: [{ t: '#bal', pose: 'guide', say: 'Pop all four balloons, Potti. Each one hides a little word just for you.', keep: 1 }],
    5: [{ t: '#cake', pose: 'think', say: 'Close your eyes and make a wish, Potti. Then blow into the mic, or just tap the candle.' }],
    6: [{ t: '#n6', pose: 'guide', wait: 1, say: 'These roses are all for you, Potti. When you\'re ready, tap Next.' }],
    7: [{ t: '#env', pose: 'love', say: LETTER }, { t: '#n7', pose: 'guide', wait: 1, say: 'Take your time reading it, Potti. When you\'re done, tap Next.' }],
    8: [{ t: '#gift', pose: 'gift', say: GIFT }, { t: '#n8', pose: 'gift', wait: 1, say: 'Now open your surprise, Potti.' }],
    10: [{ t: '#n10', pose: 'guide', wait: 1, say: 'Look closely, Potti. Watch the pencil draw you, just for you.' }],
    9: [{ t: '.frame', pose: 'love', say: FINAL }]
  };
  const ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 9];
  let scr = 0, idx = 0, step = null, tgt = null, poseName = '', flip = false, voiceOn = true, acted = false, mini = false, lastPos = null, timer = null, text = '';
  const g = $('#guide'), card = $('#gcard'), imgs = $('#gimgs');
  if (!g) return;
  const hasTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  if (!hasTTS) { $('#gspk').style.display = $('#gmute').style.display = 'none'; }

  /* ---- poses: smooth crossfade; image failure falls back to an emoji card ---- */
  function setPose(name, fl) {
    const key = name + (fl ? '-f' : ''); if (key === poseName) return; poseName = key;
    const im = new Image(); im.className = 'gi'; im.alt = ''; im.draggable = false; im.style.scale = fl ? '-1 1' : '1 1';
    im.onerror = () => { im.remove(); g.classList.add('noimg'); };
    im.onload = () => { imgs.style.width = (im.naturalWidth / im.naturalHeight * imgs.offsetHeight) + 'px'; g.classList.remove('noimg'); setTimeout(layout, 480); };
    im.src = IMG(name); imgs.append(im);
    requestAnimationFrame(() => requestAnimationFrame(() => im.classList.add('on')));
    [...imgs.children].slice(0, -1).forEach(o => { o.classList.remove('on'); setTimeout(() => o.remove(), 500); });
  }

  /* ---- voice (Web Speech API; captions always visible) ---- */
  let voice = null;
  function pickVoice() {
    if (!hasTTS) return; const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); if (!vs.length) return;
    const sc = v => (/en[-_]IN/i.test(v.lang) ? 30 : /en[-_]GB/i.test(v.lang) ? 20 : 10) + (/female|zira|aria|jenny|samantha|heera|veena|neerja|libby|sonia|susan|hazel|karen|moira|tessa|natural/i.test(v.name) ? 25 : 0);
    voice = vs.sort((a, b) => sc(b) - sc(a))[0];
  }
  if (hasTTS) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const bgm = $('#bgm'), vid = $('#vid');
  const duck = () => { if (bgm) bgm.volume = Math.min(bgm.volume, .3); };
  const unduck = () => { if (bgm) bgm.volume = vid && !vid.paused ? .25 : .9; };
  function speak(t) {
    if (!hasTTS || !voiceOn || mini) return; speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t.replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '').replace(/\s+/g, ' ').trim());
    if (voice) { u.voice = voice; u.lang = voice.lang; } else u.lang = 'en-IN';
    u.rate = .95; u.pitch = 1.15; u.onstart = duck; u.onend = u.onerror = unduck; speechSynthesis.speak(u);
  }
  const canAuto = () => acted || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
  addEventListener('pointerdown', () => acted = true, true); addEventListener('keydown', () => acted = true, true);

  /* ---- bubble ---- */
  function say(t) {
    text = t; const b = $('#gbub'); b.classList.toggle('hide', !t); if (!t) return;
    $('#gtxt').textContent = t; $('#gspk').classList.toggle('pulse', hasTTS && !canAuto());
    g.classList.toggle('rep', scr === 9);
  }

  /* ---- movement: real element positions, never covering the target ---- */
  function layout() {
    const w = g.offsetWidth, h = g.offsetHeight, vw = innerWidth, vh = innerHeight, desk = vw >= 760 && vh >= 560, pad = 10;
    const cl = (x, y) => ({ x: Math.max(pad, Math.min(vw - w - pad, x)), y: Math.max(pad, Math.min(vh - h - pad, y)) });
    const home = cl(vw - w - (desk ? 24 : pad), vh - h - (desk ? 24 : pad));
    let pos = home, t = null;
    if (tgt && !mini && tgt.isConnected) {
      t = tgt.getBoundingClientRect(); const gap = 18, cx = t.left + t.width / 2, cy = t.top + t.height / 2;
      const below = cl(cx - w / 2, t.bottom + gap), above = cl(cx - w / 2, t.top - h - gap), right = cl(t.right + gap, cy - h / 2), left = cl(t.left - w - gap, cy - h / 2);
      const C = desk ? [right, left, below, above] : [below, above, right, left];
      C.push(home, cl(pad, vh - h - pad), cl(vw - w - pad, pad), cl(pad, pad));
      const ov = c => Math.max(0, Math.min(c.x + w, t.right + 14) - Math.max(c.x, t.left - 14)) * Math.max(0, Math.min(c.y + h, t.bottom + 14) - Math.max(c.y, t.top - 14));
      let best = C.find(c => ov(c) === 0) || C.reduce((a, c) => ov(c) < ov(a) ? c : a);
      if (lastPos && ov(lastPos) === 0 && Math.hypot(best.x - lastPos.x, best.y - lastPos.y) < 24) best = lastPos;
      pos = best;
    }
    lastPos = pos; g.style.transform = `translate(${Math.round(pos.x)}px,${Math.round(pos.y)}px)`;
    /* arrow + mirrored pointing pose, computed from the real target centre */
    if (t) {
      const ccx = pos.x + card.offsetLeft + card.offsetWidth / 2, ccy = pos.y + card.offsetTop + card.offsetHeight / 2;
      const dx = t.left + t.width / 2 - ccx, dy = t.top + t.height / 2 - ccy, a = Math.atan2(dy, dx), cw = card.offsetWidth / 2, ch = card.offsetHeight / 2;
      const r = Math.min(cw / Math.max(Math.abs(Math.cos(a)), .01), ch / Math.max(Math.abs(Math.sin(a)), .01)) + 12;
      card.style.setProperty('--a', a * 180 / Math.PI + 'deg'); card.style.setProperty('--r', r + 'px'); g.classList.add('pt');
      if (step && step.pose === 'guide' && !step.waiting) { const f = dx < 0; if (f !== flip) { flip = f; poseName = ''; setPose('guide', f); } }
    } else g.classList.remove('pt');
  }

  /* ---- steps ---- */
  const visible = el => el && el.isConnected && el.offsetParent !== null && getComputedStyle(el).display !== 'none' && el.getBoundingClientRect().width > 0;
  function clearTarget() { clearInterval(timer); if (tgt) tgt.classList.remove('gd-target'); tgt = null; g.classList.remove('pt'); }
  function run() {
    clearTarget(); step = (STEPS[scr] || [])[idx] || null;
    if (!step) { say(''); setPose('stand'); layout(); return; }
    const s = step; say(s.say); if (canAuto()) speak(s.say);
    const el = $(s.t);
    const point = () => { s.waiting = false; tgt = el; el.classList.add('gd-target'); flip = false; setPose(s.pose, false); layout(); };
    if (s.wait && !visible(el)) {
      s.waiting = true; setPose('think'); layout(); let n = 0;
      timer = setInterval(() => { if (step !== s) return clearInterval(timer); if (visible(el)) { clearInterval(timer); point(); } else if (++n > 160) clearInterval(timer); }, 300);
    } else point();
    clearInterval(rt); rt = setInterval(() => { if (tgt) layout(); }, 450);
  }
  let rt = null;
  function enter(n) {
    scr = n; idx = 0; flip = false; $('#gprog').textContent = `Your surprise · ${ORDER.indexOf(n) + 1} of ${ORDER.length}`;
    g.classList.add('on'); run();
  }
  /* the real button was pressed -> stop pointing, go to the next step (never clicks anything itself) */
  addEventListener('pointerdown', e => {
    if (!step || !tgt || !tgt.contains(e.target) || step.keep) return;
    idx++; run();
  }, true);
  addEventListener('resize', () => { lastPos = null; layout(); }); addEventListener('orientationchange', () => setTimeout(layout, 300));
  addEventListener('scroll', () => layout(), true);

  /* controls */
  $('#gspk').onclick = () => { acted = true; voiceOn = true; $('#gmute').textContent = '🔈'; $('#gspk').classList.remove('pulse'); speak(text); };
  $('#gmute').onclick = () => { voiceOn = !voiceOn; $('#gmute').textContent = voiceOn ? '🔈' : '🔇'; $('#gmute').title = voiceOn ? 'Mute voice' : 'Unmute voice'; if (!voiceOn && hasTTS) { speechSynthesis.cancel(); unduck(); } };
  $('#gmin').onclick = () => { mini = true; g.classList.add('min'); if (hasTTS) speechSynthesis.cancel(); setTimeout(layout, 50); };
  imgs.addEventListener('click', () => { if (!mini) return; mini = false; g.classList.remove('min'); setTimeout(layout, 50); });
  $('#grep').onclick = () => location.reload();
  if (vid) {
    vid.addEventListener('play', () => { if (hasTTS) speechSynthesis.cancel(); unduck(); });
    vid.addEventListener('ended', () => { say('That was all for you, Potti. Happy Birthday! ❤️ Replay the video, or tap ↻ to relive the whole journey.'); setPose('love'); });
  }
  window.GUIDE = { enter, layout };
  setTimeout(() => { if (!scr) enter(1); }, 700);
})();
