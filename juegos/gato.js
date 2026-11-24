// Gato (tres en raya) contra la compu
setSize(360, 360); help('Tú eres la X. Toca una casilla. Haz tres en línea antes que la compu. Cada victoria suma 1 punto.');
const L = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
let b, wins = 0, busy = false, msg = '';
function nuevo() { b = Array(9).fill(''); busy = false; msg = ''; draw(); }
function win(p) { return L.some(l => l.every(i => b[i] == p)); }
function pick(p) { for (const l of L) { const v = l.map(i => b[i]); if (v.filter(x => x == p).length == 2 && v.indexOf('') >= 0) return l[v.indexOf('')]; } return -1; }
function draw() {
  rect(0, 0, W, H, '#0f172a');
  for (let i = 1; i < 3; i++) { rect(i * 120 - 3, 10, 6, 340, '#475569'); rect(10, i * 120 - 3, 340, 6, '#475569'); }
  b.forEach((v, i) => { if (v) text(v, (i % 3) * 120 + 60, Math.floor(i / 3) * 120 + 64, 80, v == 'X' ? '#38bdf8' : '#f87171'); });
  if (msg) { rect(0, 150, W, 60, 'rgba(0,0,0,.8)'); text(msg, W / 2, 180, 22); }
}
function fin(m, lost) { msg = m; busy = true; draw(); if (lost) setTimeout(() => over('Ganó la compu'), 900); else setTimeout(nuevo, 1200); }
tap((x, y) => {
  if (busy) return;
  const i = Math.floor(y / 120) * 3 + Math.floor(x / 120);
  if (b[i] !== '') return;
  b[i] = 'X';
  if (win('X')) { score(++wins); return fin('¡Ganaste! Otra ronda…'); }
  if (b.indexOf('') < 0) return fin('Empate. Otra ronda…');
  busy = true; draw();
  setTimeout(() => {
    let m = pick('O'); if (m < 0) m = pick('X');
    if (m < 0 && Math.random() < 0.7 && b[4] === '') m = 4;
    if (m < 0) { const e = []; b.forEach((v, j) => { if (!v) e.push(j); }); m = e[rnd(e.length)]; }
    b[m] = 'O'; busy = false;
    if (win('O')) return fin('Tres en línea de la compu', true);
    if (b.indexOf('') < 0) return fin('Empate. Otra ronda…');
    draw();
  }, 400);
});
nuevo();
