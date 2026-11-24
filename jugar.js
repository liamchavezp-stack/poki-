// LiamPlay - página de jugar: carga el juego pedido en ?juego=<id>
(function () {
  var id = new URLSearchParams(location.search).get('juego') || '';
  var j = null;
  JUEGOS.forEach(function (x) { if (x.id === id) j = x; });
  var marco = document.getElementById('marco'), zc = document.getElementById('zona-canvas'), zo = document.getElementById('zona-otra');
  var cv = document.getElementById('c');

  function aviso(emoji, titulo, texto, enlace, etiqueta, nueva) {
    var d = document.createElement('div'); d.className = 'aviso';
    var e = document.createElement('span'); e.className = 'emoji'; e.textContent = emoji;
    var h = document.createElement('h2'); h.textContent = titulo;
    var p = document.createElement('p'); p.textContent = texto;
    var a = document.createElement('a'); a.className = 'boton'; a.href = enlace; a.textContent = etiqueta;
    if (nueva) { a.target = '_blank'; a.rel = 'noopener'; }
    d.appendChild(e); d.appendChild(h); d.appendChild(p); d.appendChild(a); zo.appendChild(d);
  }

  // Ajusta el tamaño del canvas a la pantalla sin deformarlo.
  function ajustar() {
    if (!cv.width) return;
    var full = document.fullscreenElement === marco;
    var anchoMax = marco.clientWidth - 24;
    var altoMax = Math.max(220, window.innerHeight * (full ? 0.72 : 0.68));
    var k = Math.min(anchoMax / cv.width, altoMax / cv.height, 2);
    cv.style.width = Math.max(120, Math.floor(cv.width * k)) + 'px';
    cv.style.height = 'auto';
  }

  if (!j) {
    document.getElementById('titulo').textContent = 'Juego no encontrado';
    document.title = 'Juego no encontrado - LiamPlay';
    aviso('🤔', 'No encontré ese juego', 'Puede que el enlace esté mal escrito. Abajo hay más juegos para elegir.', 'index.html', 'Ver todos los juegos');
  } else {
    document.getElementById('titulo').textContent = j.emoji + ' ' + j.nombre;
    document.title = j.nombre + ' - LiamPlay';
    document.getElementById('desc').textContent = j.desc;
    if (j.tipo === 'canvas') {
      zc.hidden = false;
      document.getElementById('sonido').hidden = false; // el botón de sonido solo sirve en los juegos de canvas
      window.GID = j.id;
      var s1 = document.createElement('script');
      s1.src = 'juegos/common.js';
      s1.onload = function () {
        // sprites.js va antes del juego; si no carga, el juego usa su dibujo de respaldo
        var s0 = document.createElement('script');
        s0.src = 'juegos/sprites.js';
        s0.onload = s0.onerror = function () {
          var s2 = document.createElement('script');
          s2.src = 'juegos/' + j.id + '.js';
          s2.onload = function () { ajustar(); };
          document.body.appendChild(s2);
        };
        document.body.appendChild(s0);
      };
      document.body.appendChild(s1);
      window.addEventListener('resize', ajustar);
      document.addEventListener('fullscreenchange', ajustar);
    } else if (j.tipo === 'pagina') {
      var f = document.createElement('iframe');
      f.src = j.url; f.title = j.nombre; f.setAttribute('allow', 'fullscreen; autoplay');
      zo.appendChild(f);
    } else {
      aviso(j.emoji, j.nombre, 'Este juego vive en otra página y se abre en una pestaña nueva.', j.url, 'Abrir ' + j.nombre + ' ↗', true);
    }
  }

  document.getElementById('completa').addEventListener('click', function () {
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    var pedir = marco.requestFullscreen || marco.webkitRequestFullscreen;
    if (pedir) { try { var r = pedir.call(marco); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
  });

  var mas = document.getElementById('mas');
  JUEGOS.forEach(function (x) { if (x.id !== id) mas.appendChild(mosaico(x, false)); });
})();
