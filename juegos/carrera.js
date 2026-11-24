// Carrera de 3 Carriles
setSize(300, 520); help('Cambia de carril con ◀ ▶ (o toca el lado izquierdo o derecho de la pantalla) y esquiva los coches.');
pad(['left', 'right']);
const SP = window.SPRITES, CN = ['coche_rojo', 'coche_amarillo', 'coche_azul', 'coche_verde', 'coche_rojo']; // coches de LIAM, girados para ir a lo largo de la pista
const LX = [50, 150, 250], CC = ['#f87171', '#facc15', '#a78bfa', '#4ade80', '#fb923c'];
let lane = 1, x = 150, cars = [], t = 0, sp = 240, sc = 0, off = 0;
function go(d) { const l = Math.max(0, Math.min(2, lane + d)); if (l != lane) beep('clic'); lane = l; }
onKey(k => { if (k == 'left') go(-1); if (k == 'right') go(1); });
tap(px => go(px < W / 2 ? -1 : 1));
function car(cx, cy, c) {
  if (SP && (c == 'yo' ? SP.dibuja('coche_jugador', cx, cy, 42, 84) : SP.cabe(CN[Math.max(0, CC.indexOf(c))], cx, cy, 52, 80))) return;
  if (c == 'yo') c = '#38bdf8';
  rect(cx - 22, cy - 38, 44, 76, c); rect(cx - 16, cy - 24, 32, 18, '#0f172a'); rect(cx - 16, cy + 8, 32, 14, '#0f172a');
  rect(cx - 27, cy - 30, 6, 18, '#000'); rect(cx + 21, cy - 30, 6, 18, '#000'); rect(cx - 27, cy + 14, 6, 18, '#000'); rect(cx + 21, cy + 14, 6, 18, '#000');
}
loop(dt => {
  sp += 7 * dt; off = (off + sp * dt) % 60; t -= dt;
  x += (LX[lane] - x) * Math.min(1, dt * 14);
  if (t <= 0) {
    t = Math.max(0.45, 1.1 - sc * 0.012);
    const l = rnd(3); cars.push({ l: l, y: -50, c: CC[rnd(5)] });
    if (Math.random() < 0.3) cars.push({ l: (l + 1 + rnd(2)) % 3, y: -50, c: CC[rnd(5)] });
  }
  cars.forEach(c => { c.y += sp * dt; });
  for (const c of cars) if (Math.abs(LX[c.l] - x) < 40 && Math.abs(c.y - 440) < 70) return over('¡Choque!');
  const n = cars.length; cars = cars.filter(c => c.y < H + 60);
  if (cars.length < n) { sc += n - cars.length; score(sc); beep('punto'); }
  rect(0, 0, W, H, '#374151'); rect(0, 0, 6, H, '#fff'); rect(W - 6, 0, 6, H, '#fff');
  for (let yy = -60 + off; yy < H; yy += 60) { rect(98, yy, 4, 30, '#e5e7eb'); rect(198, yy, 4, 30, '#e5e7eb'); }
  cars.forEach(c => car(LX[c.l], c.y, c.c));
  car(x, 440, 'yo');
});
