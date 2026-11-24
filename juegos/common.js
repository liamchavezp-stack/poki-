// LiamPlay - utilidades compartidas por todos los juegos (licencia MIT)
// Incluye dibujo, teclado, toques, bucle del juego, sonido retro (beep), partículas (chispas) y temblor de pantalla (temblor).
(function () {
  const id = window.GID || new URLSearchParams(location.search).get('juego') || 'x';
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const sEl = document.getElementById('pts'), bEl = document.getElementById('rec');
  const hEl = document.getElementById('ayuda'), pEl = document.getElementById('pad'), ov = document.getElementById('fin');
  let stopped = false, tEnd = 0;
  window.cv = cv; window.ctx = ctx; window.W = 0; window.H = 0;
  window.setSize = function (w, h) { cv.width = w; cv.height = h; window.W = w; window.H = h; };
  function getBest() { try { return +localStorage.getItem('rec_' + id) || 0; } catch (e) { return 0; } }
  window.score = function (n) {
    sEl.textContent = n;
    if (n > getBest()) { try { localStorage.setItem('rec_' + id, n); } catch (e) {} }
    bEl.textContent = getBest();
  };
  window.help = function (t) { hEl.textContent = t; };
  window.rnd = function (n) { return Math.floor(Math.random() * n); };
  window.rect = function (x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  window.circ = function (x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  window.text = function (s, x, y, size, c, al) {
    ctx.fillStyle = c || '#fff'; ctx.font = 'bold ' + (size || 20) + 'px system-ui,sans-serif';
    ctx.textAlign = al || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
  };
  window.keys = {};
  const hs = [];
  window.onKey = function (f) { hs.push(f); };
  const MAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down', ' ': 'go', Enter: 'go' };
  function nk(k) { return MAP[k] || MAP[k.toLowerCase()] || k.toLowerCase(); }
  function fire(k) { if (!stopped) hs.forEach(function (f) { f(k); }); }
  addEventListener('keydown', function (e) {
    const k = nk(e.key);
    if (['left', 'right', 'up', 'down', 'go'].indexOf(k) >= 0) e.preventDefault();
    if (stopped) { if (k === 'go' && !e.repeat && Date.now() - tEnd > 600) location.reload(); return; }
    keys[k] = true; fire(k);
  });
  addEventListener('keyup', function (e) { keys[nk(e.key)] = false; });
  const LBL = { left: '◀', right: '▶', up: '▲', down: '▼', go: '●' };
  window.pad = function (list, labels) {
    pEl.innerHTML = '';
    list.forEach(function (k) {
      const b = document.createElement('button');
      b.textContent = (labels && labels[k]) || LBL[k] || k;
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); keys[k] = true; fire(k); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) { b.addEventListener(ev, function () { keys[k] = false; }); });
      pEl.appendChild(b);
    });
    pEl.classList.add('on');
  };
  function pos(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
  window.tap = function (f) { cv.addEventListener('pointerdown', function (e) { if (stopped) return; e.preventDefault(); const p = pos(e); f(p[0], p[1]); }); };
  window.move = function (f) { cv.addEventListener('pointermove', function (e) { const p = pos(e); f(p[0], p[1]); }); };
  window.swipe = function () {
    let sx = null, sy = null;
    cv.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
    addEventListener('pointerup', function (e) {
      if (sx === null) return;
      const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      fire(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    });
  };
  window.loop = function (f) {
    let last = 0;
    function fr(t) {
      const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      if (!stopped) {
        const sh = shake > 0; shake -= dt;
        if (sh) { ctx.save(); ctx.translate((Math.random() - 0.5) * shakeF, (Math.random() - 0.5) * shakeF); }
        try { f(dt); if (!stopped) parts(dt); } finally { if (sh) ctx.restore(); }
      }
      requestAnimationFrame(fr);
    }
    requestAnimationFrame(fr);
  };
  window.over = function (msg) {
    if (stopped) return;
    stopped = true; tEnd = Date.now();
    beep(/ganaste|lograste/i.test(msg || '') ? 'gana' : 'fin');
    ov.querySelector('h2').textContent = msg || 'Fin del juego';
    ov.querySelector('p').textContent = 'Puntos: ' + sEl.textContent + ' · Récord: ' + getBest();
    ov.classList.add('on');
  };
  // ---------- efectos: temblor de pantalla y partículas (los dibuja loop solo) ----------
  let shake = 0, shakeF = 8, ps = [];
  window.temblor = function (seg, fuerza) { shake = Math.max(shake, seg || 0.25); shakeF = fuerza || 8; };
  window.chispas = function (x, y, color, n, vel) {
    for (let i = 0; i < (n || 8) && ps.length < 300; i++) {
      const a = Math.random() * 6.283, v = (vel || 160) * (0.3 + Math.random() * 0.7);
      ps.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 0.25 + Math.random() * 0.3, c: color || '#fde047' });
    }
  };
  function parts(dt) {
    if (!ps.length) return;
    ps.forEach(function (p) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.l -= dt; });
    ps = ps.filter(function (p) { return p.l > 0; });
    ps.forEach(function (p) { ctx.globalAlpha = Math.min(1, p.l * 4); ctx.fillStyle = p.c; ctx.fillRect(p.x - 2, p.y - 2, 4, 4); });
    ctx.globalAlpha = 1;
  }
  // ---------- sonido retro con WebAudio (sin archivos): beep('punto' | 'golpe' | 'disparo' | 'explota' | 'salto' | 'clic' | 'dano' | 'gana' | 'fin') ----------
  // Cada sonido: [onda, frecuencia inicial, frecuencia final, segundos, volumen]; varias notas = melodía.
  const SON = {
    punto: [['square', 880, 1320, 0.09, 0.10]],
    golpe: [['square', 220, 110, 0.07, 0.12]],
    disparo: [['sawtooth', 900, 180, 0.09, 0.07]],
    explota: [['sawtooth', 240, 40, 0.22, 0.14], ['square', 120, 30, 0.22, 0.10]],
    salto: [['square', 300, 640, 0.12, 0.09]],
    clic: [['triangle', 620, 620, 0.04, 0.12]],
    dano: [['sawtooth', 200, 60, 0.25, 0.16]],
    gana: [['square', 523, 523, 0.10, 0.10], ['square', 659, 659, 0.10, 0.10, 0.10], ['square', 784, 784, 0.10, 0.10, 0.20], ['square', 1047, 1047, 0.22, 0.10, 0.30]],
    fin: [['square', 392, 392, 0.14, 0.11], ['square', 311, 311, 0.14, 0.11, 0.14], ['square', 233, 180, 0.34, 0.11, 0.28]]
  };
  let ac = null, armado = false, mudo = false, ult = {};
  try { mudo = localStorage.getItem('lp_mudo') === '1'; } catch (e) {}
  window.MUDO = mudo;
  function armar() { armado = true; if (ac && ac.state === 'suspended' && ac.resume) { try { ac.resume(); } catch (e) {} } }
  addEventListener('pointerdown', armar); addEventListener('keydown', armar);
  window.beep = function (tipo) {
    try {
      if (mudo || !armado) return;
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const notas = SON[tipo] || SON.clic, ahora = Date.now();
      if (ahora - (ult[tipo] || 0) < 40) return; ult[tipo] = ahora; // no amontonar el mismo sonido
      ac = ac || new AC();
      if (ac.state === 'suspended' && ac.resume) ac.resume();
      notas.forEach(function (n) {
        const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + (n[5] || 0);
        o.type = n[0]; o.frequency.setValueAtTime(n[1], t0);
        if (n[2] !== n[1]) o.frequency.exponentialRampToValueAtTime(Math.max(1, n[2]), t0 + n[3]);
        g.gain.setValueAtTime(n[4], t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[3]);
        o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + n[3] + 0.02);
      });
    } catch (e) {}
  };
  const bS = document.getElementById('sonido');
  function pinta() { if (bS) { bS.textContent = mudo ? '🔇 Sin sonido' : '🔊 Sonido'; if (bS.setAttribute) bS.setAttribute('aria-pressed', mudo ? 'true' : 'false'); } }
  if (bS) bS.onclick = function () {
    mudo = !mudo; window.MUDO = mudo;
    try { localStorage.setItem('lp_mudo', mudo ? '1' : '0'); } catch (e) {}
    pinta(); if (!mudo) { armado = true; beep('clic'); }
    if (bS.blur) bS.blur();
  };
  pinta();
  document.getElementById('otra').onclick = function () { location.reload(); };
  score(0);
})();
