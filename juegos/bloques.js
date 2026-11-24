// Bloques (estilo Tetris)
const C = 10, R = 20, S = 24;
setSize(C * S + 120, R * S); help('◀ ▶ mover · ▲ girar · ▼ bajar rápido · Espacio: soltar de golpe.');
pad(['left', 'up', 'down', 'right', 'go']);
const SH = [[[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]], [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]], [[0, 1, 1], [1, 1, 0]], [[1, 1, 0], [0, 1, 1]]];
const CL = ['#22d3ee', '#facc15', '#a855f7', '#3b82f6', '#f97316', '#22c55e', '#ef4444'];
let b = Array.from({ length: R }, () => Array(C).fill(-1)), p, nx = rnd(7), t = 0, sc = 0, lines = 0;
function spawn() { p = { m: SH[nx], c: nx, x: 3, y: 0 }; nx = rnd(7); if (hit(p.m, p.x, p.y)) over('¡Se llenó!'); }
function hit(m, x, y) { for (let i = 0; i < m.length; i++) for (let j = 0; j < m[i].length; j++) if (m[i][j]) { const X = x + j, Y = y + i; if (X < 0 || X >= C || Y >= R || (Y >= 0 && b[Y][X] >= 0)) return true; } return false; }
function rot(m) { return m[0].map((_, j) => m.map(r => r[j]).reverse()); }
function lock() {
  p.m.forEach((r, i) => r.forEach((v, j) => { if (v && p.y + i >= 0) b[p.y + i][p.x + j] = p.c; }));
  let n = 0;
  for (let y = R - 1; y >= 0; y--) if (b[y].every(v => v >= 0)) { b.splice(y, 1); b.unshift(Array(C).fill(-1)); n++; y++; }
  if (n) { lines += n; sc += [0, 100, 300, 500, 800][n]; score(sc); }
  spawn();
}
function down() { if (hit(p.m, p.x, p.y + 1)) lock(); else p.y++; }
onKey(k => {
  if (k == 'left' && !hit(p.m, p.x - 1, p.y)) p.x--;
  if (k == 'right' && !hit(p.m, p.x + 1, p.y)) p.x++;
  if (k == 'down') { down(); t = 0; }
  if (k == 'up') { const m = rot(p.m); for (const o of [0, -1, 1, -2, 2]) if (!hit(m, p.x + o, p.y)) { p.m = m; p.x += o; break; } }
  if (k == 'go') { while (!hit(p.m, p.x, p.y + 1)) p.y++; lock(); t = 0; }
});
function sq(x, y, c) { rect(x + 1, y + 1, S - 2, S - 2, CL[c]); rect(x + 1, y + 1, S - 2, 4, 'rgba(255,255,255,.3)'); }
spawn();
loop(dt => {
  t += dt; if (t > Math.max(0.08, 0.6 - lines * 0.02)) { t = 0; down(); }
  rect(0, 0, W, H, '#0f172a'); rect(C * S, 0, 120, H, '#1e293b');
  b.forEach((r, y) => r.forEach((v, x) => { if (v >= 0) sq(x * S, y * S, v); }));
  p.m.forEach((r, i) => r.forEach((v, j) => { if (v) sq((p.x + j) * S, (p.y + i) * S, p.c); }));
  text('Sigue', C * S + 60, 30, 18);
  SH[nx].forEach((r, i) => r.forEach((v, j) => { if (v) sq(C * S + 20 + j * S, 60 + i * S, nx); }));
  text('Líneas', C * S + 60, 160, 16, '#94a3b8'); text(lines, C * S + 60, 185, 24);
});
