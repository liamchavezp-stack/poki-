// LiamPlay - portada: cuadrícula, buscador y categorías
(function () {
  var grid = document.getElementById('cuadricula'), cats = document.getElementById('categorias');
  var buscar = document.getElementById('buscar'), vacio = document.getElementById('vacio');
  var cat = 'Todos';
  function limpio(s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
  function pintar() {
    var q = limpio(buscar.value.trim()), filtrando = q !== '' || cat !== 'Todos', n = 0;
    Array.prototype.slice.call(grid.querySelectorAll('.mosaico')).forEach(function (m) { m.remove(); });
    JUEGOS.forEach(function (j) {
      if (cat !== 'Todos' && j.cat !== cat) return;
      if (q && limpio(j.nombre + ' ' + j.cat + ' ' + j.desc).indexOf(q) < 0) return;
      grid.appendChild(mosaico(j, !filtrando)); n++;
    });
    vacio.hidden = n > 0;
    Array.prototype.slice.call(cats.children).forEach(function (b) { b.classList.toggle('activa', b.dataset.cat === cat); });
  }
  CATEGORIAS.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.cat = c;
    var n = c === 'Todos' ? JUEGOS.length : JUEGOS.filter(function (j) { return j.cat === c; }).length;
    b.textContent = c + ' (' + n + ')';
    b.addEventListener('click', function () { cat = c; pintar(); });
    cats.appendChild(b);
  });
  buscar.addEventListener('input', pintar);
  document.getElementById('total').textContent = JUEGOS.length;
  pintar();
})();
