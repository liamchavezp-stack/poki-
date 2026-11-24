// Memorama
setSize(400, 400); help('Toca dos cartas para voltearlas. Encuentra todas las parejas en los menos intentos posibles.');
const EM = ['🐶', '🐱', '🦊', '🐸', '🐵', '🐼', '🦁', '🐙'];
let cards = EM.concat(EM).map(e => ({ e: e, up: false, ok: false })), open = [], lock = false, tries = 0, found = 0;
for (let i = cards.length - 1; i > 0; i--) { const j = rnd(i + 1); const tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp; }
function draw() {
  rect(0, 0, W, H, '#0f172a');
  cards.forEach((c, i) => {
    const x = (i % 4) * 100, y = Math.floor(i / 4) * 100;
    rect(x + 6, y + 6, 88, 88, c.ok ? '#14532d' : c.up ? '#e2e8f0' : '#6366f1');
    if (c.up || c.ok) text(c.e, x + 50, y + 54, 50); else text('?', x + 50, y + 52, 40, '#c7d2fe');
  });
  text('Intentos: ' + tries, W / 2, 0, 1, 'transparent');
}
tap((x, y) => {
  if (lock) return;
  const c = cards[Math.floor(y / 100) * 4 + Math.floor(x / 100)];
  if (!c || c.up || c.ok) return;
  c.up = true; open.push(c); draw();
  if (open.length == 2) {
    tries++; lock = true;
    const a = open[0], b = open[1]; open = [];
    setTimeout(() => {
      if (a.e == b.e) { a.ok = b.ok = true; found++; score(found * 100 - Math.max(0, tries - found) * 5 > 0 ? found * 100 - Math.max(0, tries - found) * 5 : 0); }
      a.up = b.up = false; lock = false; draw();
      if (found == 8) over('¡Lo lograste en ' + tries + ' intentos!');
    }, 650);
  }
});
draw();
