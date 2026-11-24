// Ping Pong contra la compu
setSize(560, 380); help('Mueve tu paleta (izquierda) con ▲ ▼ o con el mouse/dedo. Pierdes si la compu llega a 5.');
pad(['up', 'down']);
let py = 150, cy = 150, bx, by, vx, vy, me = 0, cpu = 0;
function serve(dir) { bx = W / 2; by = H / 2; vx = 300 * dir; vy = (Math.random() * 2 - 1) * 200; }
move((x, y) => { py = Math.max(0, Math.min(H - 80, y - 40)); });
serve(1);
loop(dt => {
  if (keys.up) py -= 380 * dt; if (keys.down) py += 380 * dt;
  py = Math.max(0, Math.min(H - 80, py));
  const tg = by - 40; cy += Math.max(-250 * dt, Math.min(250 * dt, tg - cy)); cy = Math.max(0, Math.min(H - 80, cy));
  bx += vx * dt; by += vy * dt;
  if (by < 8) { by = 8; vy = Math.abs(vy); } if (by > H - 8) { by = H - 8; vy = -Math.abs(vy); }
  if (vx < 0 && bx < 34 && bx > 14 && by > py - 8 && by < py + 88) { vx = Math.abs(vx) * 1.06; vy = (by - (py + 40)) * 7; }
  if (vx > 0 && bx > W - 34 && bx < W - 14 && by > cy - 8 && by < cy + 88) { vx = -Math.abs(vx) * 1.06; vy = (by - (cy + 40)) * 7; }
  if (bx < -20) { cpu++; if (cpu >= 5) return over('Ganó la compu'); serve(1); }
  if (bx > W + 20) { me++; score(me); serve(-1); }
  rect(0, 0, W, H, '#0f172a');
  for (let y = 0; y < H; y += 24) rect(W / 2 - 2, y, 4, 12, '#334155');
  rect(16, py, 12, 80, '#38bdf8'); rect(W - 28, cy, 12, 80, '#f87171'); circ(bx, by, 8, '#fff');
  text(me, W / 2 - 50, 40, 36, '#38bdf8'); text(cpu, W / 2 + 50, 40, 36, '#f87171');
});
