// Dino Corredor
setSize(600, 260); help('Espacio, ▲ o toca la pantalla para saltar los cactus. Cada vez va más rápido.');
pad(['go'], { go: 'SALTAR' });
const G = 210;
let y = G, v = 0, obs = [], t = 0, next = 1, dist = 0, sp = 300, go = false, leg = 0;
function jump() { go = true; if (y >= G) v = -620; }
tap(jump); onKey(k => { if (k == 'go' || k == 'up') jump(); });
loop(dt => {
  if (go) {
    sp += 8 * dt; dist += sp * dt; leg += dt * 12;
    v += 1700 * dt; y += v * dt; if (y > G) { y = G; v = 0; }
    t += dt;
    if (t > next) { t = 0; next = 0.8 + Math.random() * 1.1; const big = Math.random() < 0.35; obs.push({ x: W + 20, w: big ? 34 : 18, h: big ? 34 : 44 }); }
    obs.forEach(o => { o.x -= sp * dt; });
    obs = obs.filter(o => o.x > -50);
    score(Math.floor(dist / 20));
    for (const o of obs) if (60 + 30 > o.x + 4 && 60 + 6 < o.x + o.w && y > G - o.h + 6) return over('¡Te espinaste!');
  }
  rect(0, 0, W, H, '#fef3c7'); circ(520, 50, 24, '#fbbf24');
  rect(0, G, W, H - G, '#d6b36a'); rect(0, G, W, 4, '#92400e');
  for (let i = 0; i < 8; i++) rect(((i * 90 - dist) % 720 + 720) % 720 - 60, G + 16 + (i % 3) * 10, 22, 3, '#b45309');
  obs.forEach(o => { rect(o.x, G - o.h, o.w, o.h, '#15803d'); rect(o.x - 6, G - o.h + 12, 6, 14, '#15803d'); rect(o.x + o.w, G - o.h + 8, 6, 14, '#15803d'); });
  const d = '#475569';
  rect(60, y - 40, 30, 28, d); rect(78, y - 54, 24, 20, d); rect(94, y - 48, 4, 4, '#fff'); rect(48, y - 34, 12, 8, d);
  const s = y >= G && go ? Math.floor(leg) % 2 : 0;
  rect(64, y - 12, 7, s ? 8 : 12, d); rect(80, y - 12, 7, s ? 12 : 8, d);
  if (!go) text('Toca o pulsa Espacio para empezar', W / 2, 90, 22, '#78350f');
});
