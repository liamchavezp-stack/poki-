// Serpiente
setSize(400, 400); help('Flechas o WASD para moverte (o desliza el dedo). Come manzanas y no choques.');
pad(['left', 'up', 'down', 'right']); swipe();
const N = 20, S = 20, SP = window.SPRITES; // SP: sprites de LIAM (si no cargan, se dibuja con figuras)
let sn = [{ x: 10, y: 10 }, { x: 9, y: 10 }], d = { x: 1, y: 0 }, nd = d, t = 0, sc = 0;
function food() { let p; do { p = { x: rnd(N), y: rnd(N) }; } while (sn.some(s => s.x == p.x && s.y == p.y)); return p; }
let f = food();
onKey(k => { const m = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] }[k]; if (m && (m[0] != -d.x || m[1] != -d.y)) nd = { x: m[0], y: m[1] }; });
loop(dt => {
  t += dt;
  if (t >= Math.max(0.06, 0.14 - sc * 0.002)) {
    t = 0; d = nd;
    const h = { x: sn[0].x + d.x, y: sn[0].y + d.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || sn.some(s => s.x == h.x && s.y == h.y)) return over('¡Chocaste!');
    sn.unshift(h);
    if (h.x == f.x && h.y == f.y) { score(++sc); beep('punto'); chispas(h.x * S + 10, h.y * S + 10, '#ef4444', 8); f = food(); } else sn.pop();
  }
  rect(0, 0, W, H, '#0f172a');
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if ((i + j) % 2) rect(i * S, j * S, S, S, '#111c33');
  if (!(SP && SP.dibuja('manzana', f.x * S + 10, f.y * S + 9, 24, 20))) circ(f.x * S + 10, f.y * S + 10, 8, '#ef4444');
  const hs = SP && SP.listo('cabeza');
  sn.forEach((s, i) => {
    if (!i && !hs) return rect(s.x * S + 1, s.y * S + 1, S - 2, S - 2, '#86efac');
    rect(s.x * S + 1, s.y * S + 1, S - 2, S - 2, '#15803d'); rect(s.x * S + 3, s.y * S + 3, S - 6, S - 6, i % 2 ? '#3fae3f' : '#4cc04c');
  });
  // cabeza girada hacia donde avanza (el sprite mira a la derecha; a la izquierda se voltea para que el ojo quede arriba)
  if (hs) SP.dibuja('cabeza', sn[0].x * S + 10 + d.x * 4, sn[0].y * S + 10 + d.y * 4, 34, 19, Math.atan2(d.y, d.x), d.x < 0);
});
