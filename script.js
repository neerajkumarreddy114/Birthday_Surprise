/* ===== SETTINGS (edit here) ===== */
const NAME = "Vyshnavi", PASSCODE = "1104";
const LETTER = `Happy Birthday, Pottigaa😘

Wishing you the happiest birthday! You deserve all the happiness, love, and beautiful moments in the world. I'm really lucky to have you in my life, and I hope this year brings you everything you've been wishing for.

I wanted to give you something special this birthday — not just something that stays with you, but something that can bring happiness to someone who truly needs it.

So, I planned a little surprise for you...🎁`;
/* Pencil-sketch screen: text at the top + photo (replace assets/images/her.jpg with her photo, portrait works best) */
const SKETCH_TEXT = `Meyy Potti 😘 'Na kosam drawing geesthava🤌' annav gaaa Idhigo geesaa😁`;
const FADE_TO_PHOTO = true; /* her photo: assets/images/her.jpg (sketch strokes are in js/strokes.js) */
/* Video: change the src in index.html (<video id="vid" src="...">) */

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
$$('[data-name]').forEach(e => e.textContent = NAME);
const bgm = $('#bgm'); bgm.volume = .9;
let cur = 1, heartsOn = 16, camX = 0, busy = 0;

function go(n) {
  $('#s' + cur).classList.remove('active'); cur = n; $('#s' + n).classList.add('active');
  document.body.classList.toggle('final', n == 9);
  if (n != 5) document.body.classList.remove('dark');
  heartsOn = n == 9 ? 40 : n == 1 ? 16 : 24;
  if (n == 5) startMic(); if (n == 6) bubbles(); if (n == 9) lights(); if (n == 10) sketch();
  if (window.GUIDE) GUIDE.enter(n);
}
function burst(x, y, em) {
  for (let i = 0; i < 26; i++) {
    const c = document.createElement('i'); c.className = 'cf';
    c.style.cssText = `left:${x}px;top:${y}px;background:hsl(${Math.random() * 360},85%,65%);--x:${(Math.random() - .5) * 320}px;--y:${(Math.random() - .3) * 320}px`;
    if (em) { c.textContent = em; c.style.background = 'none'; c.style.width = c.style.height = 'auto'; }
    document.body.append(c); setTimeout(() => c.remove(), 1200);
  }
}
const mid = () => [innerWidth / 2, innerHeight / 2];

/* 1 QR heart */
$('#qr').innerHTML = Array.from({ length: 121 }, () => `<b class="${Math.random() < .5 ? 'o' : ''}"></b>`).join('');
$('#s1').onclick = () => {
  if (busy) return; busy = 1; bgm.play().catch(() => {});
  $('#card').classList.add('flip'); $('#t1').textContent = 'Opening...'; setTimeout(() => go(2), 1700);
};
/* 2 Passcode */
let pin = ''; const pins = $$('.pins i');
['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].forEach(k => {
  const b = document.createElement('button'); b.textContent = k; if (!k) b.className = 'e';
  b.onclick = () => {
    if (pin.length == 4 && k != '⌫') return;
    if (k == '⌫') pin = pin.slice(0, -1); else if (k) pin += k;
    pins.forEach((p, i) => { p.textContent = pin[i] || ''; p.classList.toggle('f', !!pin[i]); });
    if (pin.length == 4) {
      if (pin == PASSCODE) { $('#lock').textContent = '🔓'; $('#lock').classList.add('open'); setTimeout(() => go(3), 1100); }
      else { $('.pins').classList.add('shake'); setTimeout(() => { $('.pins').classList.remove('shake'); pin = ''; pins.forEach(p => { p.textContent = ''; p.classList.remove('f'); }); }, 450); }
    }
  };
  $('#pad').append(b);
});
/* 3 Greeting */
$('#yes').onclick = () => go(4);
const no = $('#no');
const run = () => { no.style.position = 'fixed'; no.style.left = Math.random() * (innerWidth - 100) + 'px'; no.style.top = Math.random() * (innerHeight - 60) + 'px'; };
no.onmouseenter = no.ontouchstart = e => { e.preventDefault(); run(); }; no.onclick = run;
/* 4 Balloons */
let popped = 0; const W = ['You', 'are', 'so', 'special'];
[0, 95, 200, 290].forEach(h => {
  const b = document.createElement('button'); b.className = 'b'; b.textContent = '🎈';
  b.style.filter = `hue-rotate(${h}deg) drop-shadow(0 8px 6px #0003)`;
  b.onclick = e => {
    b.classList.add('p'); burst(e.clientX, e.clientY);
    const s = document.createElement('span'); s.textContent = W[popped++]; $('#words').append(s);
    $('#cnt').textContent = popped + '/4 POPPED'; if (popped == 4) setTimeout(() => go(5), 2200);
  };
  $('#bal').append(b);
});
/* 5 Candle */
let out = 0;
function blow() {
  if (out) return; out = 1; $('#s5').classList.add('out'); document.body.classList.add('dark');
  $('#wish').classList.add('show'); $('#hint').style.display = $('#ct').style.display = 'none';
  burst(...mid()); setTimeout(() => burst(...mid()), 600); setTimeout(() => go(6), 4200);
}
$('#cake').onclick = blow;
async function startMic() {
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ac = new AudioContext(), an = ac.createAnalyser(); ac.createMediaStreamSource(st).connect(an);
    const d = new Uint8Array(an.fftSize);
    (function t() {
      if (out) return st.getTracks().forEach(x => x.stop());
      an.getByteTimeDomainData(d); let m = 0; d.forEach(v => m = Math.max(m, Math.abs(v - 128)));
      m > 70 ? blow() : requestAnimationFrame(t);
    })();
  } catch (e) { /* mic denied: tap the cake instead */ }
}
/* 6 Bouquet */
function bubbles() {
  const T = ['Forever yours 🤍', 'You make my world beautiful', 'You are my sunshine ☀️', 'Happy Birthday, ' + NAME + ' 💗', "I'm lucky to have you", 'My favorite person 💕'],
    P = [[2, 2], [2, 2], [0, 34], [0, 34], [2, 66], [2, 66]];
  T.forEach((t, i) => {
    const b = document.createElement('div'); b.className = 'bub'; b.textContent = t;
    b.style.cssText = `${i % 2 ? 'right' : 'left'}:${P[i][0]}%;top:${P[i][1]}%;max-width:36%;animation-delay:${i * .7}s`; $('#bw').append(b);
  });
  setTimeout(() => $('#n6').classList.add('show'), 5200);
}
$('#n6').onclick = () => go(7);
/* 7 Letter */
$('#env').onclick = () => {
  $('#env').classList.add('open'); burst(...mid(), '🌹'); setTimeout(() => burst(...mid(), '💗'), 250);
  setTimeout(() => {
    $('#env').style.display = $('#t7').style.display = 'none'; $('#paper').classList.add('show');
    const A = [...LETTER]; let i = 0;
    (function t() { $('#letter').textContent = A.slice(0, ++i).join(''); i < A.length ? setTimeout(t, 24) : $('#n7').classList.add('show'); })();
  }, 900);
};
$('#n7').onclick = () => go(8);
/* 8 Gift */
$('#gift').onclick = e => {
  $('#gift').classList.add('pop'); $('#t8').style.display = 'none'; burst(e.clientX, e.clientY); burst(...mid());
  setTimeout(() => { $('#gift').style.display = 'none'; $('#gcard').classList.add('show'); setTimeout(() => $('#n8').classList.add('show'), 1500); }, 500);
};
$('#n8').onclick = () => go(10);
$('#n10').onclick = () => go(9);
/* 8b Pencil sketch: strokes precomputed from her photo (js/strokes.js + assets/sketch/tone.png) */
let sketched = 0;
function sketch() {
  if (sketched) return; sketched = 1;
  const T = $('#sktxt'); T.textContent = SKETCH_TEXT; T.style.animation = 'in 1.2s both';
  const cx = $('#sk').getContext('2d'), pen = $('#pencil'), D = window.SKETCH;
  if (!D) return go(9);
  cx.lineCap = cx.lineJoin = 'round';
  const len = s => { let l = 0; for (let i = 2; i < s.length; i += 2) l += Math.hypot(s[i] - s[i - 2], s[i + 1] - s[i - 1]); return l; };
  D.layers.forEach(L => L.len = L.s.reduce((a, s) => a + len(s), 0) + 1);
  let li = 0, si = 0, last = performance.now();
  const finish = () => { pen.style.display = 'none'; $('#tone').style.opacity = 1; if (FADE_TO_PHOTO) setTimeout(() => $('#skimg').style.opacity = 1, 2400); setTimeout(() => $('#n10').classList.add('show'), FADE_TO_PHOTO ? 6000 : 2800); };
  (function f(t) {
    const L = D.layers[li]; if (!L) return finish();
    let b = L.len / L.d * Math.min(80, t - last) / 1000; last = t;
    cx.strokeStyle = `rgba(38,28,34,${L.a})`; cx.lineWidth = L.w;
    while (b > 0 && si < L.s.length) {
      const s = L.s[si++]; cx.beginPath(); cx.moveTo(s[0], s[1]); for (let i = 2; i < s.length; i += 2) cx.lineTo(s[i], s[i + 1]); cx.stroke(); b -= len(s);
      pen.style.transform = `translate(${s[s.length - 2] / 2 - 4}px,${s[s.length - 1] / 2 - 26}px)`;
    }
    if (si >= L.s.length) { li++; si = 0; }
    requestAnimationFrame(f);
  })(last);
}
/* 9 Final video */
const v = $('#vid'), fr = $('.frame');
function lights() {
  const L = $('#lights'); if (L.children.length) return;
  for (let i = 0; i < 14; i++) { const e = document.createElement('i'), s = 30 + Math.random() * 70; e.style.cssText = `width:${s}px;height:${s}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 3}s`; L.append(e); }
  for (let i = 0; i < 14; i++) { const e = document.createElement('i'); e.className = 's'; e.style.cssText = `left:${i * 7.6}%;top:${24 + Math.sin(i) * 8 + (i % 2) * 6}px;animation-delay:${i * .2}s`; L.append(e); }
}
v.onerror = () => fr.classList.add('err');
v.onloadedmetadata = () => { /* any ratio: 16:9, 9:16, 1:1, 4:5 ... fits without cropping */
  const r = v.videoWidth / v.videoHeight, st = $('#s9').style; if (!r) return;
  st.setProperty('--ar', r);
  st.setProperty('--fw', r >= 1 ? 'min(88vw,440px)' : `min(78vw,300px,${(innerHeight < 700 ? 34 : 42) * r}vh)`);
};
$('#play').onclick = () => v.play();
v.onplay = () => { $('#play').style.display = 'none'; bgm.volume = .25; };
v.onpause = () => { if (!v.ended) $('#play').style.display = ''; };
v.onclick = () => v.paused ? v.play() : v.pause();
v.ontimeupdate = () => $('#prog').style.width = (v.currentTime / v.duration * 100 || 0) + '%';
v.onended = () => {
  bgm.volume = .9; $('#s9').classList.add('done'); $('#end').classList.add('show');
  const r = fr.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, '💖');
  setTimeout(() => burst(...mid(), '💗'), 300); $('#play').style.display = '';
};
$('#replay').onclick = () => { $('#end').classList.remove('show'); $('#s9').classList.remove('done'); v.currentTime = 0; v.play(); };
$('.bar').onclick = e => { const r = e.currentTarget.getBoundingClientRect(); v.currentTime = (e.clientX - r.left) / r.width * v.duration || 0; };
/* Desktop: keyboard + cursor sparkles */
addEventListener('keydown', e => {
  if (cur == 2) { const k = e.key == 'Backspace' ? '⌫' : e.key; $$('#pad button').find(b => b.textContent == k && /^(\d|⌫)$/.test(k))?.click(); }
  else if (cur == 1 && (e.key == 'Enter' || e.key == ' ')) $('#s1').click();
});
let lastSp = 0;
addEventListener('pointermove', e => {
  if (e.pointerType != 'mouse' || performance.now() - lastSp < 70) return; lastSp = performance.now();
  const s = document.createElement('i'); s.className = 'sp'; s.textContent = ['💗', '✨', '🌸'][Math.random() * 3 | 0];
  s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px`; document.body.append(s); setTimeout(() => s.remove(), 1100);
});
/* if the browser paused the music, any later tap restarts it */
addEventListener('pointerdown', () => { if (busy && bgm.paused && !bgm.muted) bgm.play().catch(() => {}); });
/* Tools + tilt */
$('#mute').onclick = e => { bgm.muted = !bgm.muted; e.target.textContent = bgm.muted ? '🔇' : '🔊'; };
$('#fs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
addEventListener('pointermove', e => {
  const s = document.documentElement.style;
  s.setProperty('--ry', (e.clientX / innerWidth - .5) * 16); s.setProperty('--rx', -(e.clientY / innerHeight - .5) * 16);
  camX = (e.clientX / innerWidth - .5) * 2;
});
addEventListener('deviceorientation', e => { camX = Math.max(-1, Math.min(1, (e.gamma || 0) / 30)); });

/* ===== 3D hearts + rose petals (Three.js) ===== */
if (window.THREE) {
  const R = new THREE.WebGLRenderer({ canvas: $('#gl'), alpha: true, antialias: true }); R.setPixelRatio(Math.min(devicePixelRatio, 2));
  const S = new THREE.Scene(), C = new THREE.PerspectiveCamera(50, 1, .1, 50); C.position.z = 10;
  const rs = () => { R.setSize(innerWidth, innerHeight, false); C.aspect = innerWidth / innerHeight; C.updateProjectionMatrix(); }; rs(); addEventListener('resize', rs);
  S.add(new THREE.AmbientLight(0xffffff, .7));
  const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(3, 5, 8); S.add(dl);
  const pl = new THREE.PointLight(0xff6fa5, 1.2, 30); pl.position.set(-4, -2, 6); S.add(pl);
  const sh = new THREE.Shape(), x = 0, y = 0;
  sh.moveTo(x + .25, y + .25); sh.bezierCurveTo(x + .25, y + .25, x + .2, y, x, y); sh.bezierCurveTo(x - .3, y, x - .3, y + .35, x - .3, y + .35);
  sh.bezierCurveTo(x - .3, y + .55, x - .1, y + .77, x + .25, y + .95); sh.bezierCurveTo(x + .6, y + .77, x + .8, y + .55, x + .8, y + .35);
  sh.bezierCurveTo(x + .8, y + .35, x + .8, y, x + .5, y); sh.bezierCurveTo(x + .35, y, x + .25, y + .25, x + .25, y + .25);
  const g = new THREE.ExtrudeGeometry(sh, { depth: .3, bevelEnabled: true, bevelSize: .08, bevelThickness: .08, bevelSegments: 4 }); g.center();
  const cols = [0xff4d88, 0xe91e63, 0xd32f2f, 0xffb3c8, 0xf2b8a0], rnd = (a, b) => a + Math.random() * (b - a), H = [], P = [];
  for (let i = 0; i < 64; i++) {
    const m = new THREE.Mesh(g, new THREE.MeshPhongMaterial({ color: cols[i % 5], shininess: 120, specular: 0xffffff }));
    m.position.set(0, rnd(-6.5, 6.5), rnd(-4, 2)); m.scale.setScalar(rnd(.5, 1.1)); m.userData = { v: rnd(.01, .03), r: rnd(.005, .02), nx: rnd(-1, 1) }; S.add(m); H.push(m);
  }
  for (let i = 0; i < 18; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(.3, .42), new THREE.MeshPhongMaterial({ color: 0xe0245e, side: THREE.DoubleSide }));
    m.position.set(0, rnd(-6.5, 6.5), rnd(-3, 2)); m.userData = { v: rnd(.01, .025), r: rnd(.02, .05), nx: rnd(-1, 1) }; S.add(m); P.push(m);
  }
  (function loop() {
    requestAnimationFrame(loop);
    H.forEach((m, i) => { m.visible = i < heartsOn * (C.aspect > 1 ? 1.6 : 1); m.position.x = m.userData.nx * (10 - m.position.z) * .42 * C.aspect; m.position.y += m.userData.v; m.rotation.y += m.userData.r; m.rotation.x = Math.sin(m.position.y) * .3; if (m.position.y > 6.5) m.position.y = -6.5; });
    P.forEach(m => { m.position.y -= m.userData.v; m.position.x = m.userData.nx * (10 - m.position.z) * .42 * C.aspect + Math.sin(m.position.y * 2) * .3; m.rotation.x += m.userData.r; m.rotation.z += m.userData.r; if (m.position.y < -6.5) m.position.y = 6.5; });
    C.position.x += (camX * 1.5 - C.position.x) * .05; C.lookAt(0, 0, 0); R.render(S, C);
  })();
}
