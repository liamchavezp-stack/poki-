// 2048
setSize(400, 400); help('Flechas o desliza para mover las fichas. Junta dos iguales para sumarlas y llega a 2048.');
pad(['left', 'up', 'down', 'right']); swipe();
let g = [0, 1, 2, 3].map(() => [0, 0, 0, 0]), sc = 0, won = false;
const COL = { 0: '#334155', 2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563', 32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61', 512: '#edc850', 1024: '#edc53f', 2048: '#edc22e' };
function add() { const e = []; g.forEach((r, y) => r.forEach((v, x) => { if (!v) e.push([y, x]); })); if (e.length) { const p = e[rnd(e.length)]; g[p[0]][p[1]] = Math.random() < 0.9 ? 2 : 4; } }
function cell(i, j, k) { return k == 'left' ? [i, j] : k == 'right' ? [i, 3 - j] : k == 'up' ? [j, i] : [3 - j, i]; }
function slide(r) { r = r.filter(v => v); for (let i = 0; i < r.length - 1; i++) if (r[i] == r[i + 1]) { r[i] *= 2; sc += r[i]; if (r[i] == 2048) won = true; r.splice(i + 1, 1); } while (r.length < 4) r.push(0); return r; }
function canMove() { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { if (!g[y][x]) return true; if (x < 3 && g[y][x] == g[y][x + 1]) return true; if (y < 3 && g[y][x] == g[y + 1][x]) return true; } return false; }
function draw() {
  rect(0, 0, W, H, '#1e293b');
  g.forEach((r, y) => r.forEach((v, x) => {
    rect(x * 100 + 6, y * 100 + 6, 88, 88, COL[v] || '#3c3a32');
    if (v) text(v, x * 100 + 50, y * 100 + 52, v > 999 ? 28 : v > 99 ? 34 : 42, v > 4 ? '#fff' : '#776e65');
  }));
}
onKey(k => {
  if (['left', 'right', 'up', 'down'].indexOf(k) < 0) return;
  const o = JSON.stringify(g);
  for (let i = 0; i < 4; i++) {
    let r = []; for (let j = 0; j < 4; j++) { const c = cell(i, j, k); r.push(g[c[0]][c[1]]); }
    r = slide(r);
    for (let j = 0; j < 4; j++) { const c = cell(i, j, k); g[c[0]][c[1]] = r[j]; }
  }
  if (JSON.stringify(g) != o) add();
  score(sc); draw();
  if (!canMove()) over(won ? '¡Llegaste a 2048!' : 'Sin movimientos');
});
add(); add(); draw();
