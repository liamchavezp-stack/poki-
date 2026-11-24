// Asteroides
setSize(480, 480); help('◀ ▶ giran la nave, ▲ acelera y Espacio (o ●) dispara. Rompe las rocas sin que te toquen.');
pad(['left', 'up', 'right', 'go']);
const SP = window.SPRITES; // sprites de LIAM: nave y rocas grande, mediana y chica
let x = 240, y = 240, a = -Math.PI / 2, vx = 0, vy = 0, shots = [], rocks = [], cd = 0, sc = 0, lvl = 0, safe = 2;
function wrap(o) { o.x = (o.x + W) % W; o.y = (o.y + H) % H; }
function rock(px, py, r) { const an = Math.random() * 6.28, s = 30 + Math.random() * 50 + lvl * 6; return { x: px, y: py, r: r, vx: Math.cos(an) * s, vy: Math.sin(an) * s }; }
function wave() { lvl++; safe = 2; for (let i = 0; i < 3 + lvl; i++) { const e = rnd(4); rocks.push(rock(e < 2 ? rnd(W) : (e == 2 ? 0 : W), e < 2 ? (e ? 0 : H) : rnd(H), 36)); } }
function fire() { if (cd <= 0) { shots.push({ x: x + Math.cos(a) * 14, y: y + Math.sin(a) * 14, vx: Math.cos(a) * 420 + vx, vy: Math.sin(a) * 420 + vy, t: 0.9 }); cd = 0.22; beep('disparo'); } }
onKey(k => { if (k == 'go') fire(); });
wave();
loop(dt => {
  cd -= dt; safe -= dt;
  if (keys.left) a -= 3.6 * dt; if (keys.right) a += 3.6 * dt;
  if (keys.up) { vx += Math.cos(a) * 260 * dt; vy += Math.sin(a) * 260 * dt; }
  if (keys.go) fire();
  vx *= 1 - 0.4 * dt; vy *= 1 - 0.4 * dt;
  const me = { x: x + vx * dt, y: y + vy * dt }; wrap(me); x = me.x; y = me.y;
  shots.forEach(s => { s.x += s.vx * dt; s.y += s.vy * dt; s.t -= dt; wrap(s); });
  rocks.forEach(r => { r.x += r.vx * dt; r.y += r.vy * dt; wrap(r); });
  for (const s of shots) {
    for (let i = 0; i < rocks.length; i++) {
      const r = rocks[i];
      if (Math.hypot(s.x - r.x, s.y - r.y) < r.r) {
        rocks.splice(i, 1); s.t = 0; beep('explota'); chispas(r.x, r.y, '#94a3b8', r.r > 30 ? 14 : 8); sc += r.r > 30 ? 20 : r.r > 15 ? 50 : 100; score(sc);
        if (r.r > 12) { rocks.push(rock(r.x, r.y, r.r / 2), rock(r.x, r.y, r.r / 2)); }
        break;
      }
    }
  }
  shots = shots.filter(s => s.t > 0);
  if (safe <= 0) for (const r of rocks) if (Math.hypot(x - r.x, y - r.y) < r.r + 9) return over('¡Chocaste con una roca!');
  if (!rocks.length) wave();
  rect(0, 0, W, H, '#020617');
  ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
  rocks.forEach(r => {
    r.g = (r.g || 0) + dt * (r.vg || (r.vg = Math.random() * 1.6 - 0.8)); // las rocas giran despacio
    if (SP && SP.cabe(r.r > 30 ? 'roca_g' : r.r > 15 ? 'roca_m' : 'roca_c', r.x, r.y, r.r * 2.25, r.r * 2.25, r.g)) return;
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const an = i * 0.785, rr = r.r * (i % 2 ? 0.82 : 1); ctx.lineTo(r.x + Math.cos(an) * rr, r.y + Math.sin(an) * rr); } ctx.closePath(); ctx.stroke(); });
  shots.forEach(s => circ(s.x, s.y, 3, '#fde047'));
  if (safe <= 0 || Math.floor(safe * 8) % 2) {
    if (keys.up) circ(x - Math.cos(a) * 14, y - Math.sin(a) * 14, 4 + Math.random() * 2, '#fb923c');
    // la nave del sprite apunta hacia arriba, por eso se gira a + 90°
    if (!(SP && SP.dibuja('ast_nave', x, y, 32, 28, a + Math.PI / 2))) {
    ctx.strokeStyle = '#38bdf8'; ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16);
    ctx.lineTo(x + Math.cos(a + 2.5) * 13, y + Math.sin(a + 2.5) * 13);
    ctx.lineTo(x + Math.cos(a + Math.PI) * 5, y + Math.sin(a + Math.PI) * 5);
    ctx.lineTo(x + Math.cos(a - 2.5) * 13, y + Math.sin(a - 2.5) * 13);
    ctx.closePath(); ctx.stroke();
    }
  }
  text('Nivel ' + lvl, W - 10, 20, 16, '#fff', 'right');
});
