// Buscaminas
const N = 9, S = 44, M = 10;
setSize(N * S, N * S + 50); help('Toca una casilla para abrirla. Los números dicen cuántas minas hay alrededor. Usa el botón de abajo (o la tecla F) para poner banderas.');
const SP = window.SPRITES; // sprites de LIAM: mina y bandera
let g = [], first = true, flag = false, left = N * N - M;
for (let i = 0; i < N * N; i++) g.push({ m: false, o: false, f: false, n: 0 });
function nb(i) { const x = i % N, y = Math.floor(i / N), r = []; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if ((dx || dy) && X >= 0 && Y >= 0 && X < N && Y < N) r.push(Y * N + X); } return r; }
function plant(safe) { let k = 0; while (k < M) { const i = rnd(N * N); if (!g[i].m && i != safe && nb(safe).indexOf(i) < 0) { g[i].m = true; k++; } } g.forEach((c, i) => { c.n = nb(i).filter(j => g[j].m).length; }); }
function openC(i) { const c = g[i]; if (c.o || c.f) return; c.o = true; left--; if (!c.n && !c.m) nb(i).forEach(openC); }
const NC = ['', '#60a5fa', '#4ade80', '#f87171', '#c084fc', '#fb923c', '#22d3ee', '#fff', '#94a3b8'];
function draw(all) {
  rect(0, 0, W, H, '#0f172a');
  g.forEach((c, i) => {
    const x = (i % N) * S, y = Math.floor(i / N) * S;
    rect(x + 2, y + 2, S - 4, S - 4, c.o ? '#1e293b' : '#475569');
    if (c.o && c.m || all && c.m) { if (!(SP && SP.cabe('mina', x + S / 2, y + S / 2, 34, 34))) text('💣', x + S / 2, y + S / 2 + 2, 24); }
    else if (c.o && c.n) text(c.n, x + S / 2, y + S / 2 + 2, 24, NC[c.n]);
    else if (c.f) { if (!(SP && SP.cabe('bandera', x + S / 2 + 3, y + S / 2, 30, 32))) text('🚩', x + S / 2, y + S / 2 + 2, 22); }
  });
  rect(8, N * S + 8, W - 16, 34, flag ? '#dc2626' : '#334155');
  text(flag ? '🚩 Modo bandera: ACTIVADO' : '🚩 Modo bandera: apagado', W / 2, N * S + 26, 16);
}
function tog() { flag = !flag; draw(); }
onKey(k => { if (k == 'f') tog(); });
tap((x, y) => {
  if (y > N * S) return tog();
  const i = Math.floor(y / S) * N + Math.floor(x / S), c = g[i];
  if (!c || c.o) return;
  if (flag) { c.f = !c.f; beep('clic'); return draw(); }
  if (c.f) return;
  if (first) { first = false; plant(i); }
  if (c.m) { c.o = true; beep('explota'); draw(true); return over('¡Boom! Pisaste una mina'); }
  openC(i); beep('clic'); score((N * N - M - left) * 10); draw();
  if (left == 0) { draw(true); over('¡Ganaste! Campo limpio'); }
});
draw();
if (SP && SP.alCargar) SP.alCargar(() => { if (left > 0 && !g.some(c => c.o && c.m)) draw(); });
