// Simón Dice
setSize(360, 360); help('Mira la secuencia de colores y repítela tocando los colores (o con las flechas ▲ ▶ ▼ ◀). Cada ronda agrega un color.');
pad(['left', 'up', 'down', 'right']);
const DIR = ['up', 'right', 'down', 'left'], OFF = ['#166534', '#991b1b', '#1e40af', '#a16207'], ON = ['#4ade80', '#f87171', '#60a5fa', '#fde047'], FQ = [330, 262, 392, 494];
let seq = [], i = 0, phase = 'wait', t = 0, lit = -1, litT = 0, sc = 0, ac = null;
function beep(n) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = FQ[n]; g.gain.value = 0.08; o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.22);
  } catch (e) {}
}
function flash(n) { lit = n; litT = 0.3; beep(n); }
function round() { seq.push(rnd(4)); i = 0; phase = 'show'; t = 0.7; }
function press(n) {
  if (phase == 'wait') return round();
  if (phase != 'input') return;
  flash(n);
  if (n != seq[i]) { phase = 'end'; return setTimeout(() => over('Color equivocado'), 500); }
  i++;
  if (i == seq.length) { score(++sc); i = 0; phase = 'pause'; t = 0.9; }
}
onKey(k => { const n = DIR.indexOf(k); if (n >= 0) press(n); else if (k == 'go' && phase == 'wait') round(); });
tap((x, y) => {
  const dx = x - W / 2, dy = y - H / 2;
  if (Math.hypot(dx, dy) < 46) { if (phase == 'wait') round(); return; }
  press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0));
});
function tri(n, c) {
  const P = [[0, 0], [W, 0], [W, H], [0, H]], a = P[n], b = P[(n + 1) % 4];
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.closePath(); ctx.fill();
}
loop(dt => {
  litT -= dt; if (litT <= 0) lit = -1;
  if (phase == 'show' || phase == 'pause') {
    t -= dt;
    if (t <= 0) {
      if (phase == 'pause') round();
      else if (i < seq.length) { flash(seq[i]); i++; t = Math.max(0.32, 0.6 - seq.length * 0.02); }
      else { i = 0; phase = 'input'; }
    }
  }
  rect(0, 0, W, H, '#0f172a');
  for (let n = 0; n < 4; n++) tri(n, lit == n ? ON[n] : OFF[n]);
  ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, H); ctx.moveTo(W, 0); ctx.lineTo(0, H); ctx.stroke();
  circ(W / 2, H / 2, 46, '#0f172a');
  text(phase == 'wait' ? 'Empezar' : phase == 'input' ? 'Tu turno' : phase == 'end' ? '✖' : 'Mira…', W / 2, H / 2, 16);
});
