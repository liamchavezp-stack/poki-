// Pégale al Topo
setSize(360, 420); help('Tienes 30 segundos. Toca los topos cuando salgan (o usa las teclas 1 a 9, como en el teclado de un teléfono).');
let time = 30, sc = 0, go = false, holes = [], t = 0;
for (let i = 0; i < 9; i++) holes.push({ up: 0, hit: 0 });
function whack(i) {
  if (i < 0 || i > 8) return;
  go = true;
  const h = holes[i];
  if (h.up > 0 && h.hit <= 0) { h.hit = 0.3; h.up = 0.3; score(++sc); }
}
tap((x, y) => { if (y < 60) { go = true; return; } whack(Math.floor((y - 60) / 120) * 3 + Math.floor(x / 120)); });
onKey(k => { if (k >= '1' && k <= '9' && k.length == 1) whack(+k - 1); else if (k == 'go') go = true; });
loop(dt => {
  if (go) {
    time -= dt; t -= dt;
    holes.forEach(h => { h.up -= dt; h.hit -= dt; });
    if (t <= 0) {
      t = Math.max(0.3, 0.75 - sc * 0.012);
      const free = []; holes.forEach((h, i) => { if (h.up <= 0) free.push(i); });
      if (free.length) holes[free[rnd(free.length)]].up = Math.max(0.55, 1.1 - sc * 0.015);
    }
    if (time <= 0) return over('¡Tiempo! Atrapaste ' + sc + ' topos');
  }
  rect(0, 0, W, H, '#65a30d'); rect(0, 0, W, 60, '#3f6212');
  text('Tiempo: ' + Math.max(0, Math.ceil(time)) + ' s', W / 2, 30, 24);
  holes.forEach((h, i) => {
    const cx = (i % 3) * 120 + 60, cy = Math.floor(i / 3) * 120 + 130;
    ctx.fillStyle = '#422006'; ctx.beginPath(); ctx.ellipse(cx, cy + 22, 44, 18, 0, 0, 7); ctx.fill();
    if (h.up > 0) {
      const c = h.hit > 0 ? '#f87171' : '#a16207';
      circ(cx, cy, 30, c); rect(cx - 30, cy, 60, 24, c);
      ctx.fillStyle = '#422006'; ctx.beginPath(); ctx.ellipse(cx, cy + 24, 44, 12, 0, 0, 3.15); ctx.fill();
      circ(cx - 11, cy - 8, 4, '#000'); circ(cx + 11, cy - 8, 4, '#000'); circ(cx, cy + 3, 6, '#fda4af');
      if (h.hit > 0) text('¡Pum!', cx, cy - 44, 18, '#fff');
    }
    text(i + 1, cx - 46, cy - 40, 12, 'rgba(255,255,255,.5)');
  });
  if (!go) { rect(0, 190, W, 60, 'rgba(0,0,0,.7)'); text('Toca para empezar', W / 2, 220, 22); }
});
