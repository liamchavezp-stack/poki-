// Rompe Ladrillos
setSize(480, 560); help('Mueve la barra con ◀ ▶ o con el mouse/dedo. Rompe todos los ladrillos. Tienes 3 vidas.');
pad(['left', 'right']);
const CL = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
let px = 200, pw = 80, bx, by, vx, vy, lives = 3, sc = 0, lvl = 1, br = [];
function mk() { br = []; for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) br.push({ x: c * 58 + 10, y: r * 24 + 50, c: r }); }
function reset() { bx = px + pw / 2; by = 500; const s = 260 + lvl * 30; vx = (Math.random() < 0.5 ? -1 : 1) * s * 0.6; vy = -s * 0.8; }
move(x => { px = Math.max(0, Math.min(W - pw, x - pw / 2)); });
mk(); reset();
loop(dt => {
  if (keys.left) px -= 420 * dt; if (keys.right) px += 420 * dt;
  px = Math.max(0, Math.min(W - pw, px));
  bx += vx * dt; by += vy * dt;
  if (bx < 8) { bx = 8; vx = Math.abs(vx); } if (bx > W - 8) { bx = W - 8; vx = -Math.abs(vx); }
  if (by < 8) { by = 8; vy = Math.abs(vy); }
  if (vy > 0 && by > 512 && by < 530 && bx > px - 8 && bx < px + pw + 8) { vy = -Math.abs(vy); vx = (bx - (px + pw / 2)) * 7; }
  for (let i = 0; i < br.length; i++) {
    const k = br[i];
    if (bx > k.x - 8 && bx < k.x + 60 && by > k.y - 8 && by < k.y + 28) { br.splice(i, 1); vy = -vy; sc += 10; score(sc); break; }
  }
  if (!br.length) { lvl++; mk(); reset(); }
  if (by > H + 10) { lives--; if (lives <= 0) return over('Sin vidas'); reset(); }
  rect(0, 0, W, H, '#0f172a');
  br.forEach(k => rect(k.x, k.y, 52, 20, CL[k.c]));
  rect(px, 520, pw, 12, '#e2e8f0'); circ(bx, by, 8, '#fde047');
  text('Vidas: ' + '❤'.repeat(lives), 10, 20, 16, '#fff', 'left'); text('Nivel ' + lvl, W - 10, 20, 16, '#fff', 'right');
});
