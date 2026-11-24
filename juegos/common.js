// LiamPlay - utilidades compartidas por todos los juegos (licencia MIT)
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
    function fr(t) { const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; if (!stopped) f(dt); requestAnimationFrame(fr); }
    requestAnimationFrame(fr);
  };
  window.over = function (msg) {
    if (stopped) return;
    stopped = true; tEnd = Date.now();
    ov.querySelector('h2').textContent = msg || 'Fin del juego';
    ov.querySelector('p').textContent = 'Puntos: ' + sEl.textContent + ' · Récord: ' + getBest();
    ov.classList.add('on');
  };
  document.getElementById('otra').onclick = function () { location.reload(); };
  score(0);
})();
