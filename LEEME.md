# 🎮 LiamPlay

Portal de juegos gratis para jugar al instante en el navegador, en computadora, tableta o celular. Todos los juegos están hechos con código propio y libre (licencia MIT): HTML, CSS y JavaScript, sin instalar nada.

## Juegos

| Categoría | Juegos |
| --- | --- |
| Clásicos | Serpiente, Bloques, Rompe Ladrillos, Ping Pong, Gato |
| Ingenio | 2048, Memorama, Buscaminas, Conecta 4 |
| Acción | Armas vs Robots, Invasores, Asteroides, Carrera de 3 Carriles |
| Habilidad | Pajarito Volador, Dino Corredor, Pégale al Topo, Simón Dice |
| De LIAM | Noche en la Pizzería, Flappy Bird de LIAM (se abre en otra pestaña) |

## Controles

- **Computadora:** flechas o W, A, S, D para moverte; barra espaciadora o Enter para la acción (saltar, disparar, soltar). En Buscaminas, la tecla F cambia al modo bandera. En Pégale al Topo se usan las teclas 1 a 9.
- **Celular o tableta:** toca la pantalla, desliza el dedo o usa los botones que aparecen debajo del juego.
- Cuando termina la partida, pulsa **Jugar otra vez** (o la barra espaciadora).
- El récord de cada juego se guarda en el dispositivo donde juegas.

## Cómo verlo en tu computadora

Abre una terminal dentro de esta carpeta y escribe:

```
python3 -m http.server 8000
```

Después entra a `http://localhost:8000` en tu navegador.

## Cómo publicarlo con GitHub Pages

En el repositorio de GitHub entra a **Settings → Pages**, elige **Deploy from a branch**, la rama `main` y la carpeta `/ (root)`, y guarda. Todas las rutas son relativas, así que funciona bajo `https://<usuario>.github.io/<repositorio>/`.

## Cómo agregar un juego

1. Crea `juegos/mi-juego.js`. Ese archivo puede usar estas funciones, que vienen de `juegos/common.js`:
   - `setSize(ancho, alto)` define el tamaño del canvas; después tienes `W`, `H` y `ctx`.
   - `help('texto')` muestra las instrucciones.
   - `score(n)` actualiza los puntos y guarda el récord.
   - `rect(x, y, w, h, color)`, `circ(x, y, radio, color)` y `text(texto, x, y, tamaño, color)` dibujan.
   - `rnd(n)` da un número entero al azar de 0 a n-1.
   - `keys.left`, `keys.right`, `keys.up`, `keys.down` y `keys.go` dicen si una tecla está presionada.
   - `onKey(k => { ... })` avisa cuando se presiona una tecla (`'left'`, `'right'`, `'up'`, `'down'`, `'go'`).
   - `pad(['left', 'right', 'go'])` pone botones táctiles debajo del juego.
   - `tap((x, y) => { ... })`, `move((x, y) => { ... })` y `swipe()` sirven para el dedo o el mouse.
   - `loop(dt => { ... })` se repite en cada cuadro; `dt` son los segundos que pasaron.
   - `over('mensaje')` termina la partida.
   - `beep('punto')`, `chispas(x, y, color)` y `temblor(0.3)` agregan sonido, partículas y temblor de pantalla.
2. Agrega una línea en la lista `JUEGOS` de `juegos.js` con el mismo `id` que el nombre del archivo:

```js
{ id: 'mi-juego', nombre: 'Mi Juego', emoji: '⭐', cat: 'Acción', c1: '#22c55e', c2: '#065f46', tam: 1, tipo: 'canvas', desc: 'De qué trata.' },
```

`tam` puede ser 1 (normal), 2 (destacado 2x2) o 3 (destacado 3x3). Para un juego que es una página aparte usa `tipo: 'pagina'` con `url`, y para uno que vive en otro sitio usa `tipo: 'enlace'` con `url`.

## Sprites, sonido y efectos

- **Sprites:** los dibujos de los juegos salen de las dos hojas de sprites de LIAM. Están guardados como imágenes PNG en base64 dentro de `juegos/sprites.js`, para que el sitio siga siendo solo archivos de texto. Se usan con `SPRITES.dibuja('nombre', x, y, ancho, alto, giro, voltea, espejo)` o con `SPRITES.cabe('nombre', x, y, anchoMax, altoMax)`. Si una imagen no carga, cada juego usa su dibujo de figuras de respaldo.
- **Sonido retro:** `beep('punto')`, `beep('golpe')`, `beep('disparo')`, `beep('explota')`, `beep('salto')`, `beep('clic')`, `beep('dano')`, `beep('gana')` y `beep('fin')` suenan con WebAudio, sin archivos de audio. El botón **🔊 Sonido** de la página de jugar lo apaga o lo prende, y se recuerda en el dispositivo.
- **Efectos:** `chispas(x, y, color, cantidad)` suelta partículas y `temblor(segundos, fuerza)` sacude la pantalla un momento.
- **Sin librerías externas:** todo el código es propio (licencia MIT); no se usa ningún CDN ni código de terceros.

## Archivos

- `index.html`, `style.css`, `app.js`: la portada con la cuadrícula, el buscador y las categorías.
- `jugar.html`, `jugar.js`: la página donde se juega.
- `juegos.js`: la lista de juegos.
- `juegos/`: el código de cada juego y `common.js`, que todos comparten.
- `liam/pizzeria/`: el juego «Noche en la Pizzería» de LIAM.

## Licencia

MIT. Copyright (c) 2026 liamchavezp-stack. Consulta el archivo `LICENSE`.
