// Invasores (estilo Space Invaders)
setSize(480, 560); help('◀ ▶ para moverte y Espacio (o ●) para disparar. En celular también puedes tocar la pantalla para disparar. Tienes 3 vidas.');
pad(['left', 'go', 'right']);
const CL = ['#f472b6', '#a78bfa', '#38bdf8', '#4ade80'];
let px = 220, shots = [], bombs = [], al = [], dir = 1, sp = 30, cd = 0, sc = 0, lives = 3, wave = 1, hurt = 0;
function mk() { al = []; for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) al.push({ x: c * 48 + 30, y: r * 40 + 60, r: r }); sp = 24 + wave * 10; }
function fire() { if (cd <= 0) { shots.push({ x: px + 20, y: 496 }); cd = 0.35; } }
onKey(k => { if (k == 'go' || k == 'up') fire(); });
tap(() => fire());
mk();
loop(dt => {
  cd -= dt; hurt -= dt;
  if (keys.left) px -= 300 * dt; if (keys.right) px += 300 * dt;
  px = Math.max(0, Math.min(W - 40, px));
  if (keys.go) fire();
  let edge = false;
  al.forEach(a => { a.x += dir * sp * dt; if (a.x < 8 || a.x > W - 40) edge = true; });
  if (edge) { dir = -dir; al.forEach(a => { a.y += 16; a.x += dir * 4; }); sp += 3; }
  if (al.length && Math.random() < dt * (0.6 + wave * 0.25)) { const a = al[rnd(al.length)]; bombs.push({ x: a.x + 16, y: a.y + 24 }); }
  shots.forEach(s => { s.y -= 460 * dt; });
  bombs.forEach(b => { b.y += (170 + wave * 15) * dt; });
  for (const s of shots) {
    for (let i = 0; i < al.length; i++) {
      const a = al[i];
      if (s.x > a.x - 2 && s.x < a.x + 34 && s.y > a.y && s.y < a.y + 24) { al.splice(i, 1); s.y = -99; sc += 10 * (4 - a.r); score(sc); break; }
    }
  }
  shots = shots.filter(s => s.y > -10);
  for (const b of bombs) {
    if (b.y > 500 && b.y < 526 && b.x > px && b.x < px + 40) { b.y = 999; lives--; hurt = 0.4; if (lives <= 0) return over('Te derribaron'); }
  }
  bombs = bombs.filter(b => b.y < H);
  if (al.some(a => a.y > 470)) return over('¡Los invasores aterrizaron!');
  if (!al.length) { wave++; mk(); }
  rect(0, 0, W, H, '#0b1020');
  for (let i = 0; i < 30; i++) rect((i * 97) % W, (i * 53) % H, 2, 2, '#334155');
  al.forEach(a => {
    rect(a.x, a.y + 4, 32, 14, CL[a.r]); rect(a.x + 6, a.y, 20, 6, CL[a.r]);
    rect(a.x + 2, a.y + 18, 6, 6, CL[a.r]); rect(a.x + 24, a.y + 18, 6, 6, CL[a.r]);
    rect(a.x + 8, a.y + 8, 4, 4, '#0b1020'); rect(a.x + 20, a.y + 8, 4, 4, '#0b1020');
  });
  shots.forEach(s => rect(s.x - 2, s.y, 4, 12, '#fde047'));
  bombs.forEach(b => rect(b.x - 2, b.y, 4, 10, '#f87171'));
  const pc = hurt > 0 ? '#f87171' : '#e2e8f0';
  rect(px, 510, 40, 12, pc); rect(px + 16, 500, 8, 10, pc);
  text('Vidas: ' + '❤'.repeat(lives), 10, 20, 16, '#fff', 'left'); text('Oleada ' + wave, W - 10, 20, 16, '#fff', 'right');
});
