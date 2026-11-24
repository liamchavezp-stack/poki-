// Pajarito Volador
setSize(400, 560); help('Toca, haz clic o pulsa Espacio para aletear. Pasa entre los tubos.');
let y = 250, v = 0, pipes = [], t = 1.2, sc = 0, go = false;
function flap() { go = true; v = -330; }
tap(flap); onKey(k => { if (k == 'go' || k == 'up') flap(); });
loop(dt => {
  if (go) {
    v += 1000 * dt; y += v * dt; t += dt;
    if (t > 1.5) { t = 0; pipes.push({ x: W, g: 90 + rnd(250), ok: false }); }
    pipes.forEach(p => { p.x -= 170 * dt; });
    pipes = pipes.filter(p => p.x > -70);
    for (const p of pipes) {
      if (!p.ok && p.x + 60 < 90) { p.ok = true; score(++sc); }
      if (90 + 14 > p.x && 90 - 14 < p.x + 60 && (y - 14 < p.g || y + 14 > p.g + 140)) return over('¡Pum!');
    }
    if (y > H - 54 || y < -20) return over('¡Pum!');
  }
  rect(0, 0, W, H, '#7dd3fc');
  circ(80, 90, 26, '#fff'); circ(110, 90, 20, '#fff'); circ(300, 150, 24, '#fff'); circ(328, 150, 18, '#fff');
  pipes.forEach(p => {
    rect(p.x, 0, 60, p.g, '#22c55e'); rect(p.x - 4, p.g - 22, 68, 22, '#16a34a');
    rect(p.x, p.g + 140, 60, H, '#22c55e'); rect(p.x - 4, p.g + 140, 68, 22, '#16a34a');
  });
  rect(0, H - 40, W, 40, '#d6b36a'); rect(0, H - 40, W, 8, '#65a30d');
  circ(90, y, 14, '#facc15'); circ(96, y - 4, 4, '#fff'); circ(97, y - 4, 2, '#000'); rect(100, y, 12, 5, '#f97316');
  if (!go) text('Toca para empezar', W / 2, 200, 24, '#0f172a');
});
