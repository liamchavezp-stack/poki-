// Armas vs Robots: disparos vista desde arriba con 3 armas
setSize(560, 420);
help('Muévete con WASD o las flechas. Apunta con el mouse y haz clic para disparar, o mantén Espacio (●) para disparar al robot más cercano. Cambia de arma con 1, 2, 3 o Q. La Escopeta se desbloquea con 100 puntos y la Metralleta con 250.');
pad(['left', 'up', 'down', 'right', 'go', 'q'], { q: 'Arma' });
const SP = window.SPRITES; // sprites de LIAM: soldado de pie (al moverse) y agachado (quieto)
const WP = [
  { n: 'Pistola', cd: 0.35, b: 1, sp: 0, need: 0, c: '#fde047' },
  { n: 'Escopeta', cd: 0.7, b: 5, sp: 0.5, need: 100, c: '#fb923c' },
  { n: 'Metralleta', cd: 0.09, b: 1, sp: 0.14, need: 250, c: '#38bdf8' }
];
let p = { x: 280, y: 210 }, hp = 5, w = 0, cd = 0, sc = 0, bs = [], en = [], fx = [], t = 0, ax = 420, ay = 210, down = false, hurt = 0, msg = '', msgT = 0;
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function unlocked(i) { return sc >= WP[i].need; }
move((x, y) => { ax = x; ay = y; });
tap((x, y) => { ax = x; ay = y; down = true; });
addEventListener('pointerup', () => { down = false; });
onKey(k => {
  if (k == '1' || k == '2' || k == '3') { const i = +k - 1; if (unlocked(i)) w = i; }
  if (k == 'q') { do { w = (w + 1) % 3; } while (!unlocked(w)); }
});
function near() { let b = null, d = 1e9; en.forEach(e => { const q = Math.hypot(e.x - p.x, e.y - p.y); if (q < d) { d = q; b = e; } }); return b; }
function shoot(a) {
  const g = WP[w]; if (cd > 0) return; cd = g.cd;
  for (let i = 0; i < g.b; i++) { const an = a + (Math.random() - 0.5) * g.sp; bs.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, vx: Math.cos(an) * 520, vy: Math.sin(an) * 520, l: 0.8, c: g.c }); }
}
function spawn() {
  const s = rnd(4); let x, y;
  if (s == 0) { x = -20; y = rnd(H); } else if (s == 1) { x = W + 20; y = rnd(H); } else if (s == 2) { x = rnd(W); y = -20; } else { x = rnd(W); y = H + 20; }
  const big = sc > 80 && Math.random() < 0.18;
  en.push({ x: x, y: y, hp: big ? 4 : 1, r: big ? 20 : 13, sp: (big ? 45 : 70) + Math.min(80, sc * 0.15), big: big });
}
function addScore(n) {
  const before = sc; sc += n; score(sc);
  WP.forEach(g => { if (g.need && before < g.need && sc >= g.need) { msg = '¡Nueva arma: ' + g.n + '!'; msgT = 2.5; w = WP.indexOf(g); } });
}
loop(dt => {
  cd -= dt; hurt -= dt; t += dt; msgT -= dt;
  const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0), dy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0), m = Math.hypot(dx, dy) || 1;
  p.x = clamp(p.x + dx / m * 210 * dt, 14, W - 14); p.y = clamp(p.y + dy / m * 210 * dt, 14, H - 14);
  let ang = Math.atan2(ay - p.y, ax - p.x);
  if (keys.go) { const n = near(); if (n) { ang = Math.atan2(n.y - p.y, n.x - p.x); ax = n.x; ay = n.y; } shoot(ang); }
  else if (down) shoot(ang);
  if (t > Math.max(0.3, 1.1 - sc * 0.002)) { t = 0; spawn(); }
  bs.forEach(b => { b.x += b.vx * dt; b.y += b.vy * dt; b.l -= dt; });
  for (const b of bs) for (const e of en) {
    if (b.l > 0 && e.hp > 0 && Math.hypot(b.x - e.x, b.y - e.y) < e.r + 4) {
      b.l = 0; e.hp--;
      if (e.hp <= 0) { addScore(e.big ? 30 : 10); for (let i = 0; i < 6; i++) fx.push({ x: e.x, y: e.y, vx: (Math.random() - 0.5) * 240, vy: (Math.random() - 0.5) * 240, l: 0.4 }); }
    }
  }
  bs = bs.filter(b => b.l > 0 && b.x > -10 && b.x < W + 10 && b.y > -10 && b.y < H + 10);
  for (const e of en) {
    const a = Math.atan2(p.y - e.y, p.x - e.x); e.x += Math.cos(a) * e.sp * dt; e.y += Math.sin(a) * e.sp * dt;
    if (e.hp > 0 && Math.hypot(p.x - e.x, p.y - e.y) < e.r + 12) { e.hp = 0; hp--; hurt = 0.35; if (hp <= 0) return over('Los robots te atraparon'); }
  }
  en = en.filter(e => e.hp > 0);
  fx.forEach(f => { f.x += f.vx * dt; f.y += f.vy * dt; f.l -= dt; }); fx = fx.filter(f => f.l > 0);
  // dibujo
  rect(0, 0, W, H, hurt > 0 ? '#3f1d1d' : '#14261b');
  for (let x = 0; x < W; x += 40) rect(x, 0, 1, H, 'rgba(255,255,255,.05)');
  for (let y = 0; y < H; y += 40) rect(0, y, W, 1, 'rgba(255,255,255,.05)');
  fx.forEach(f => rect(f.x - 2, f.y - 2, 4, 4, '#fca5a5'));
  en.forEach(e => {
    rect(e.x - e.r, e.y - e.r, e.r * 2, e.r * 2, e.big ? '#7c3aed' : '#dc2626');
    rect(e.x - e.r * 0.6, e.y - e.r * 0.4, e.r * 0.4, e.r * 0.4, '#fff'); rect(e.x + e.r * 0.2, e.y - e.r * 0.4, e.r * 0.4, e.r * 0.4, '#fff');
    rect(e.x - e.r * 0.5, e.y + e.r * 0.3, e.r, 3, '#111');
  });
  bs.forEach(b => circ(b.x, b.y, 3, b.c));
  // soldado girado hacia donde apunta (el sprite mira a la derecha; al apuntar a la izquierda se voltea para no quedar de cabeza)
  const mv = dx || dy, izq = Math.cos(ang) < 0;
  if (SP && SP.listo(mv ? 'soldado' : 'agachado')) {
    circ(p.x, p.y, 13, 'rgba(56,189,248,.22)');
    if (mv) SP.dibuja('soldado', p.x, p.y, 27, 45, ang, izq); else SP.dibuja('agachado', p.x, p.y, 38, 34, ang, izq);
  } else {
    ctx.strokeStyle = WP[w].c; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(ang) * 22, p.y + Math.sin(ang) * 22); ctx.stroke();
    circ(p.x, p.y, 12, '#38bdf8'); circ(p.x, p.y, 6, '#e0f2fe');
  }
  text('❤'.repeat(hp), 10, 18, 16, '#f87171', 'left');
  text('Arma: ' + WP[w].n, W - 10, 18, 16, WP[w].c, 'right');
  const nx = WP.find(g => !unlocked(WP.indexOf(g)));
  if (nx) text(nx.n + ' a los ' + nx.need + ' pts', W - 10, 38, 12, '#94a3b8', 'right');
  if (msgT > 0) text(msg, W / 2, 70, 22, '#fde047');
});
