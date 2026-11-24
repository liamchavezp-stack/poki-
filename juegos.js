// LiamPlay - lista de juegos. Para agregar uno, copia una línea y cambia sus datos.
// tipo: 'canvas' (usa juegos/<id>.js), 'pagina' (se abre en un marco) o 'enlace' (se abre en pestaña nueva).
// tam: 1 = mosaico normal, 2 = destacado 2x2, 3 = destacado 3x3.
var CATEGORIAS = ['Todos', 'Clásicos', 'Ingenio', 'Acción', 'Habilidad', 'De LIAM'];
var JUEGOS = [
  { id: 'pizzeria', nombre: 'Noche en la Pizzería', emoji: '🍕', cat: 'De LIAM', c1: '#7f1d1d', c2: '#111827', tam: 3, tipo: 'pagina', url: 'liam/pizzeria/index.html', desc: 'Sobrevive cinco noches como guardia: cámaras, linterna y caja de música.' },
  { id: 'snake', nombre: 'Serpiente', emoji: '🐍', cat: 'Clásicos', c1: '#22c55e', c2: '#065f46', tam: 2, tipo: 'canvas', desc: 'Come manzanas, crece y no choques contigo.' },
  { id: 'flappy-liam', nombre: 'Flappy Bird de LIAM', emoji: '🐤', cat: 'De LIAM', c1: '#38bdf8', c2: '#facc15', tam: 2, tipo: 'enlace', url: 'https://muse.ai/s/flappy-bird-xzm6xa4bxdxaxyxexd/Wis1JqgcXFZ0HWouzoWVwlEz3-6myiTlp2xYbUQODMM', desc: 'El Flappy de LIAM con tienda de skins y MODO ANGRY. Se abre en otra pestaña.' },
  { id: '2048', nombre: '2048', emoji: '🔢', cat: 'Ingenio', c1: '#f59e0b', c2: '#b45309', tam: 1, tipo: 'canvas', desc: 'Junta fichas iguales hasta llegar a 2048.' },
  { id: 'bloques', nombre: 'Bloques', emoji: '🧱', cat: 'Clásicos', c1: '#6366f1', c2: '#312e81', tam: 2, tipo: 'canvas', desc: 'Acomoda las piezas que caen y completa líneas.' },
  { id: 'invasores', nombre: 'Invasores', emoji: '👾', cat: 'Acción', c1: '#a855f7', c2: '#1e1b4b', tam: 2, tipo: 'canvas', desc: 'Defiende la Tierra de oleadas de invasores.' },
  { id: 'ladrillos', nombre: 'Rompe Ladrillos', emoji: '🏓', cat: 'Clásicos', c1: '#f97316', c2: '#9a3412', tam: 1, tipo: 'canvas', desc: 'Rebota la pelota y rompe todos los ladrillos.' },
  { id: 'pajaro', nombre: 'Pajarito Volador', emoji: '🐦', cat: 'Habilidad', c1: '#7dd3fc', c2: '#0284c7', tam: 1, tipo: 'canvas', desc: 'Aletea y pasa entre los tubos.' },
  { id: 'dino', nombre: 'Dino Corredor', emoji: '🦖', cat: 'Habilidad', c1: '#fde68a', c2: '#d97706', tam: 1, tipo: 'canvas', desc: 'Corre por el desierto y salta los cactus.' },
  { id: 'asteroides', nombre: 'Asteroides', emoji: '🚀', cat: 'Acción', c1: '#334155', c2: '#020617', tam: 1, tipo: 'canvas', desc: 'Pilotea tu nave y rompe las rocas espaciales.' },
  { id: 'carrera', nombre: 'Carrera de 3 Carriles', emoji: '🏎️', cat: 'Acción', c1: '#ef4444', c2: '#7f1d1d', tam: 2, tipo: 'canvas', desc: 'Esquiva los coches a toda velocidad.' },
  { id: 'memorama', nombre: 'Memorama', emoji: '🃏', cat: 'Ingenio', c1: '#818cf8', c2: '#4338ca', tam: 1, tipo: 'canvas', desc: 'Encuentra todas las parejas de animales.' },
  { id: 'buscaminas', nombre: 'Buscaminas', emoji: '💣', cat: 'Ingenio', c1: '#94a3b8', c2: '#334155', tam: 1, tipo: 'canvas', desc: 'Limpia el campo sin pisar una mina.' },
  { id: 'conecta4', nombre: 'Conecta 4', emoji: '🔴', cat: 'Ingenio', c1: '#3b82f6', c2: '#1e3a8a', tam: 1, tipo: 'canvas', desc: 'Junta cuatro fichas en línea antes que la compu.' },
  { id: 'topos', nombre: 'Pégale al Topo', emoji: '🔨', cat: 'Habilidad', c1: '#84cc16', c2: '#3f6212', tam: 1, tipo: 'canvas', desc: 'Atrapa todos los topos que puedas en 30 segundos.' },
  { id: 'pong', nombre: 'Ping Pong', emoji: '🏸', cat: 'Clásicos', c1: '#06b6d4', c2: '#164e63', tam: 1, tipo: 'canvas', desc: 'Gánale a la compu en el clásico de las paletas.' },
  { id: 'simon', nombre: 'Simón Dice', emoji: '🚦', cat: 'Habilidad', c1: '#f43f5e', c2: '#4c1d95', tam: 1, tipo: 'canvas', desc: 'Repite la secuencia de colores, cada vez más larga.' },
  { id: 'gato', nombre: 'Gato', emoji: '❌', cat: 'Clásicos', c1: '#14b8a6', c2: '#134e4a', tam: 1, tipo: 'canvas', desc: 'Tres en raya contra la compu.' }
];

// Crea el mosaico de un juego (lo usan la portada y la página de jugar).
function mosaico(j, grande) {
  var a = document.createElement('a');
  a.className = 'mosaico' + (grande && j.tam > 1 ? ' t' + j.tam : '');
  a.style.background = 'linear-gradient(145deg,' + j.c1 + ',' + j.c2 + ')';
  if (j.tipo === 'enlace') { a.href = j.url; a.target = '_blank'; a.rel = 'noopener'; }
  else a.href = 'jugar.html?juego=' + encodeURIComponent(j.id);
  a.title = j.desc;
  a.setAttribute('aria-label', j.nombre);
  var e = document.createElement('span'); e.className = 'emoji'; e.textContent = j.emoji;
  var n = document.createElement('span'); n.className = 'nombre'; n.textContent = j.nombre + (j.tipo === 'enlace' ? ' ↗' : '');
  a.appendChild(e); a.appendChild(n);
  return a;
}
