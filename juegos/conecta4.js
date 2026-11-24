// Conecta 4 contra la compu
const C = 7, R = 6, S = 60;
setSize(C * S, R * S + S); help('Tú eres las fichas rojas. Toca una columna (o usa ◀ ▶ y Espacio) para soltar tu ficha. Junta 4 en línea antes que la compu. Cada victoria suma 1 punto.');
pad(['left', 'go', 'right']);
let b, col = 3, busy = false, wins = 0, msg = '';
function nuevo() { b = Array.from({ length: R }, () => Array(C).fill(0)); busy = false; msg = ''; draw(); }
function row(c) { for (let r = R - 1; r >= 0; r--) if (!b[r][c]) return r; return -1; }
function win(p) {
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const d of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
    let n = 0;
    for (let k = 0; k < 4; k++) { const y = r + d[0] * k, x = c + d[1] * k; if (y >= 0 && y < R && x >= 0 && x < C && b[y][x] == p) n++; }
    if (n == 4) return true;
  }
  return false;
}
function full() { return b[0].every(v => v); }
function tryWin(p) { for (let c = 0; c < C; c++) { const r = row(c); if (r < 0) continue; b[r][c] = p; const w = win(p); b[r][c] = 0; if (w) return c; } return -1; }
function draw() {
  rect(0, 0, W, H, '#0f172a');
  if (!busy) circ(col * S + S / 2, S / 2, 22, '#ef4444');
  rect(0, S, W, R * S, '#1d4ed8');
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) circ(c * S + S / 2, S + r * S + S / 2, 23, b[r][c] == 1 ? '#ef4444' : b[r][c] == 2 ? '#facc15' : '#0f172a');
  if (msg) { rect(0, H / 2 - 30, W, 60, 'rgba(0,0,0,.8)'); text(msg, W / 2, H / 2, 22); }
}
function fin(m, lost) { msg = m; busy = true; draw(); if (lost) setTimeout(() => over('Ganó la compu'), 900); else setTimeout(nuevo, 1400); }
function cpu() {
  let c = tryWin(2); if (c < 0) c = tryWin(1);
  if (c < 0) { const ops = [3, 2, 4, 3, 1, 5, 2, 4, 0, 6].filter(x => row(x) >= 0); c = ops[rnd(Math.min(4, ops.length))]; }
  b[row(c)][c] = 2; busy = false;
  if (win(2)) return fin('Cuatro en línea de la compu', true);
  if (full()) return fin('Empate. Otra ronda…');
  draw();
}
function drop(c) {
  if (busy) return;
  const r = row(c); if (r < 0) return;
  col = c; b[r][c] = 1;
  if (win(1)) { score(++wins); return fin('¡Ganaste! Otra ronda…'); }
  if (full()) return fin('Empate. Otra ronda…');
  busy = true; draw(); setTimeout(cpu, 450);
}
tap(x => drop(Math.max(0, Math.min(C - 1, Math.floor(x / S)))));
onKey(k => {
  if (busy) return;
  if (k == 'left') col = Math.max(0, col - 1);
  if (k == 'right') col = Math.min(C - 1, col + 1);
  if (k == 'go' || k == 'down') return drop(col);
  draw();
});
nuevo();
