/* Noche en la Pizzería — script.js
   Lógica completa del juego. Original, inspirado en FNAF.
   No usa imágenes ni audio oficiales: personajes con emoji + Web Audio. */
(function () {
  "use strict";

  /* ================= 1. CONFIGURACIÓN ================= */
  var SECONDS_PER_HOUR = 35; // una noche completa dura ~3,5 minutos
  var HOURS = ["12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM"];
  var SAVE_KEY = "nochePizzeriaSaveV2";

  // Dificultad por noche: se mueven más rápido, gastan más energía, etc.
  var NIGHTS = [
    { night: 1, label: "Fácil",   moveBase: 0.14, moveEvery: 4, drain: 1.00, musicDrain: 0.45, sombra: false, desc: "Empieza suave. Aprende a vigilar." },
    { night: 2, label: "Normal",  moveBase: 0.18, moveEvery: 4, drain: 1.15, musicDrain: 0.60, sombra: false, desc: "Se mueven más y gastan más luz." },
    { night: 3, label: "Difícil", moveBase: 0.22, moveEvery: 3, drain: 1.30, musicDrain: 0.75, sombra: true,  desc: "¡Aparece Sombra! Cuida la caja de música." },
    { night: 4, label: "Muy difícil", moveBase: 0.27, moveEvery: 3, drain: 1.45, musicDrain: 0.90, sombra: true, desc: "Casi no dan descanso. Ahorra energía." },
    { night: 5, label: "Pesadilla", moveBase: 0.33, moveEvery: 2, drain: 1.60, musicDrain: 1.05, sombra: true, desc: "La noche final. Todo es más rápido." }
  ];

  // 6 cámaras: la 6 es el Almacén, donde vive la caja de música y Sombra.
  var CAMERAS = [
    { id: "cam1", name: "CAM 1 — Escenario" },
    { id: "cam2", name: "CAM 2 — Comedor" },
    { id: "cam3", name: "CAM 3 — Pasillo izquierdo" },
    { id: "cam4", name: "CAM 4 — Pasillo derecho" },
    { id: "cam5", name: "CAM 5 — Cocina" },
    { id: "cam6", name: "CAM 6 — Almacén" }
  ];

  // Cada animatrónico tiene su propio patrón: velocidad, lado y costumbre.
  // stage: 0 Escenario, 1 Comedor, 2 Pasillo, 3 Cerca de la puerta, 4 En la puerta
  function baseAnimals() {
    return [
      { key: "oso",     name: "Oso Bruno",   emoji: "🐻", side: "left",  stage: 0, atDoorTimer: 0, speed: 0.9, retreat: 0.08, path: "Escenario → Comedor → Pasillo" },
      { key: "conejo",  name: "Conejo Lalo", emoji: "🐰", side: "left",  stage: 0, atDoorTimer: 0, speed: 1.3, retreat: 0.18, path: "Rápido, pero a veces retrocede" },
      { key: "gallina", name: "Gallina Pía", emoji: "🐔", side: "right", stage: 0, atDoorTimer: 0, speed: 1.0, retreat: 0.10, path: "Pasa mucho por la Cocina" },
      { key: "zorro",   name: "Zorro Rojo",  emoji: "🦊", side: "right", stage: 0, atDoorTimer: 0, speed: 1.1, retreat: 0.05, path: "Lento... y de repente corre" },
      // Sombra solo se activa en las noches 3, 4 y 5. Empieza en el Almacén (CAM 6).
      { key: "sombra",  name: "Sombra",      emoji: "👤", side: "random", stage: -1, atDoorTimer: 0, speed: 0.7, retreat: 0.02, path: "Viene del Almacén, casi sin hacer ruido" }
    ];
  }

  /* ================= 2. GUARDADO (localStorage) ================= */
  function loadSave() {
    try {
      var raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { unlocked: 1, bestNight: 0, wins: 0, highScore: 0 };
      var s = JSON.parse(raw);
      return {
        unlocked: s.unlocked || 1,
        bestNight: s.bestNight || 0,
        wins: s.wins || 0,
        highScore: s.highScore || 0
      };
    } catch (e) { return { unlocked: 1, bestNight: 0, wins: 0, highScore: 0 }; }
  }
  function storeSave() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* si no se puede guardar, el juego sigue */ }
  }
  var save = loadSave();

  /* ================= 3. ESTADO DEL JUEGO ================= */
  var ANIMALS = baseAnimals();
  var state = {
    playing: false, paused: false, over: false,
    night: 1, hour: 0, secondInHour: 0,
    power: 100, powerOut: false, powerOutTimer: 0,
    leftClosed: false, rightClosed: false,
    leftLight: false, rightLight: false,
    camOpen: false, currentCam: "cam1",
    sound: true, moveTick: 0, score: 0,
    // Mecánica nueva 1: caja de música (0-100). Si llega a 0, Sombra se enfada.
    musicBox: 100, musicWarned: false,
    // Mecánica nueva 2: linterna con batería propia (0-100).
    flashOn: false, flashBattery: 100, windCooldown: 0,
    nightConfig: NIGHTS[0]
  };

  /* ================= 4. REFERENCIAS AL DOM ================= */
  function el(id) { return document.getElementById(id); }
  var clockEl = el("clock"), powerTextEl = el("powerText"), usageTextEl = el("usageText"),
    scoreTextEl = el("scoreText"), hudNightEl = el("hudNight"),
    powerBarEl = el("powerBar"), musicBarEl = el("musicBar"), flashBarEl = el("flashBar"),
    powerWarningEl = el("powerWarning"), officeMsgEl = el("officeMsg"),
    leftDoorVisual = el("leftDoorVisual"), rightDoorVisual = el("rightDoorVisual"),
    leftWarning = el("leftWarning"), rightWarning = el("rightWarning"),
    leftDoorBtn = el("leftDoorBtn"), rightDoorBtn = el("rightDoorBtn"),
    leftLightBtn = el("leftLightBtn"), rightLightBtn = el("rightLightBtn"),
    flashBtn = el("flashBtn"), musicBtn = el("musicBtn"),
    camPanel = el("camPanel"), camToggleBtn = el("camToggleBtn"),
    camButtonsEl = el("camButtons"), camTitleEl = el("camTitle"),
    camCharsEl = el("camChars"), camNoteEl = el("camNote"), camViewEl = el("camView"),
    gameEl = el("game");

  /* ================= 5. SONIDOS (Web Audio, opcionales) ================= */
  var audioCtx = null;
  function beep(freq, dur, type) {
    if (!state.sound) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0.08, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + dur);
    } catch (e) { /* sonido opcional */ }
  }
  function doorSound() { beep(120, 0.25, "square"); }
  function scareSound() { beep(90, 0.9, "sawtooth"); setTimeout(function () { beep(60, 0.9, "sawtooth"); }, 150); }
  function winSound() { beep(523, 0.3); setTimeout(function () { beep(659, 0.3); }, 250); setTimeout(function () { beep(784, 0.5); }, 500); }

  /* ================= 6. AYUDA: CÁMARAS Y ETAPAS ================= */
  function camForStage(a) {
    if (a.key === "sombra") {
      if (a.stage < 0) return "cam6";
      if (a.stage === 0) return "cam1";
      if (a.stage === 1) return "cam2";
      if (a.stage === 2 || a.stage === 3) return a.side === "left" ? "cam3" : "cam4";
      return null;
    }
    if (a.stage === 0) return "cam1";
    if (a.stage === 1) return "cam2";
    if (a.stage === 2 || a.stage === 3) return a.side === "left" ? "cam3" : "cam4";
    return null; // en la puerta, ya no se ve en cámaras
  }
  function stageName(a) {
    if (a.key === "sombra" && a.stage < 0) return "escondida en el Almacén";
    return ["en el Escenario", "en el Comedor", "en el Pasillo", "cerca de tu puerta", "¡EN TU PUERTA!"][a.stage] || "en algún lugar oscuro";
  }
  function activeAnimals() {
    // Sombra solo juega si la noche lo permite.
    return ANIMALS.filter(function (a) { return a.key !== "sombra" || state.nightConfig.sombra; });
  }
  function doorDanger(side) {
    return activeAnimals().some(function (a) { return a.side === side && a.stage === 4; });
  }
  function doorClosed(side) { return side === "left" ? state.leftClosed : state.rightClosed; }
  function nightConfig(n) { return NIGHTS[n - 1] || NIGHTS[0]; }

  /* ================= 7. MOSTRAR EN PANTALLA (HUD, cámaras) ================= */
  function renderCameras() {
    camButtonsEl.innerHTML = "";
    CAMERAS.forEach(function (cam) {
      var b = document.createElement("button");
      b.textContent = cam.name;
      b.className = "camBtn" + (state.currentCam === cam.id ? " active" : "");
      b.onclick = function () { state.currentCam = cam.id; beep(600, 0.08); renderCameras(); };
      camButtonsEl.appendChild(b);
    });
    var cam = null;
    CAMERAS.forEach(function (c) { if (c.id === state.currentCam) cam = c; });
    camTitleEl.textContent = cam.name;
    camViewEl.className = "";
    if (state.currentCam === "cam5") {
      camCharsEl.textContent = "🍳";
      var inKitchen = activeAnimals().filter(function (a) { return a.key === "gallina" && a.stage === 1; });
      camNoteEl.textContent = inKitchen.length
        ? "Gallina Pía está pasando por la Cocina. Se oyen ollas y platos."
        : "La cocina está vacía... solo se oyen ruidos de ollas.";
      return;
    }
    if (state.currentCam === "cam6") {
      var sombraHere = activeAnimals().filter(function (a) { return a.key === "sombra" && a.stage < 0; });
      camCharsEl.textContent = sombraHere.length ? "👤 🎵" : "🎵 📦";
      camNoteEl.textContent = "Aquí está la caja de música. Cuerda: " + Math.floor(state.musicBox) + "%. " +
        (sombraHere.length ? "Sombra está escondida entre las cajas. No la mires demasiado." : "Si la cuerda llega a 0, algo malo pasará.") +
        " Usa el botón 🎵 Dar cuerda para mantenerla.";
      return;
    }
    var here = activeAnimals().filter(function (a) { return camForStage(a) === state.currentCam; });
    if (here.length === 0) {
      camCharsEl.textContent = "—";
      camNoteEl.textContent = "No hay nadie en esta cámara." + (state.flashOn ? " Linterna encendida: se ve mejor." : "");
    } else {
      camCharsEl.textContent = here.map(function (a) { return a.emoji; }).join(" ");
      camNoteEl.textContent = here.map(function (a) { return a.name + " está " + stageName(a); }).join(". ") + "." +
        (state.flashOn ? " La linterna lo deja quieto un momento." : "");
    }
  }

  function updateHUD() {
    hudNightEl.textContent = "Noche " + state.night;
    clockEl.textContent = HOURS[state.hour];
    powerTextEl.textContent = Math.max(0, Math.floor(state.power)) + "%";
    scoreTextEl.textContent = state.score + " pts";
    var bars = 1;
    if (state.leftClosed) bars++;
    if (state.rightClosed) bars++;
    if (state.camOpen) bars++;
    if (state.leftLight || state.rightLight) bars++;
    if (state.flashOn) bars++;
    usageTextEl.textContent = bars <= 1 ? "Bajo" : bars === 2 ? "Medio" : bars === 3 ? "Alto" : "¡Muy alto!";
    powerBarEl.style.width = Math.max(0, state.power) + "%";
    powerBarEl.className = state.power < 25 ? "low" : "";
    musicBarEl.style.width = Math.max(0, state.musicBox) + "%";
    musicBarEl.className = state.musicBox < 25 ? "low" : "";
    flashBarEl.style.width = Math.max(0, state.flashBattery) + "%";
    flashBarEl.className = state.flashBattery < 25 ? "low" : "";
    // Avisos de energía
    if (state.powerOut) {
      powerWarningEl.textContent = "💀 SIN ENERGÍA — ¡Corre, ya vienen!";
    } else if (state.power <= 10) {
      powerWarningEl.textContent = "⚠️ ¡ENERGÍA AL 10%! Apaga todo lo que no uses.";
    } else if (state.power <= 20) {
      powerWarningEl.textContent = "⚠️ Energía baja (20%). Ahorra: abre puertas y apaga cámaras.";
    } else if (state.musicBox <= 0) {
      powerWarningEl.textContent = "🎵 ¡La caja de música se paró! ¡Dale cuerda ya!";
    } else if (state.musicBox <= 20) {
      powerWarningEl.textContent = "🎵 La caja de música casi se para. Dale cuerda.";
    } else {
      powerWarningEl.textContent = "";
    }
    // Puertas
    leftDoorVisual.textContent = state.leftClosed ? "🚪🔒" : "🚪";
    leftDoorVisual.className = "doorVisual" + (state.leftClosed ? " closed" : "") + (doorDanger("left") ? " danger" : "") + (state.flashOn ? " flash-on" : "");
    rightDoorVisual.textContent = state.rightClosed ? "🚪🔒" : "🚪";
    rightDoorVisual.className = "doorVisual" + (state.rightClosed ? " closed" : "") + (doorDanger("right") ? " danger" : "") + (state.flashOn ? " flash-on" : "");
    leftDoorBtn.textContent = state.leftClosed ? "Abrir puerta izq." : "Cerrar puerta izq.";
    leftDoorBtn.className = "doorBtn" + (state.leftClosed ? " closed" : "");
    rightDoorBtn.textContent = state.rightClosed ? "Abrir puerta der." : "Cerrar puerta der.";
    rightDoorBtn.className = "doorBtn" + (state.rightClosed ? " closed" : "");
    leftLightBtn.className = "lightBtn" + (state.leftLight ? " on" : "");
    rightLightBtn.className = "lightBtn" + (state.rightLight ? " on" : "");
    flashBtn.textContent = state.flashOn ? "🔦 Linterna: encendida" : "🔦 Linterna: apagada";
    flashBtn.className = "flashBtn" + (state.flashOn ? " on" : "");
    musicBtn.textContent = "🎵 Dar cuerda (" + Math.floor(state.musicBox) + "%)";
    leftWarning.textContent = doorDanger("left") ? "⚠️ ¡Alguien está en la puerta izquierda!" : (state.leftLight && !doorDanger("left") ? "No hay nadie aquí." : "");
    rightWarning.textContent = doorDanger("right") ? "⚠️ ¡Alguien está en la puerta derecha!" : (state.rightLight && !doorDanger("right") ? "No hay nadie aquí." : "");
    if (state.camOpen) renderCameras();
  }

  function renderMenu() {
    var box = el("nightButtons");
    box.innerHTML = "";
    NIGHTS.forEach(function (cfg) {
      var b = document.createElement("button");
      var locked = cfg.night > save.unlocked;
      b.className = "night-btn" + (locked ? " locked" : "");
      b.disabled = locked;
      b.innerHTML = "";
      var num = document.createElement("span"); num.className = "night-num";
      num.textContent = (locked ? "🔒 " : "🌙 ") + "Noche " + cfg.night;
      var diff = document.createElement("span"); diff.className = "night-diff";
      diff.textContent = cfg.label + " — " + cfg.desc;
      b.appendChild(num); b.appendChild(diff);
      b.onclick = function () { showNightIntro(cfg.night); };
      box.appendChild(b);
    });
    el("highScoreText").textContent = "🏆 Récord de puntos: " + save.highScore + " pts";
    el("bestNightText").textContent = "🌙 Mejor noche superada: " + (save.bestNight === 0 ? "ninguna todavía" : "Noche " + save.bestNight);
    el("winsText").textContent = "🎉 Noches ganadas en total: " + save.wins;
  }

  /* ================= 8. BUCLE PRINCIPAL (1 tick = 1 segundo) ================= */
  function tick() {
    if (!state.playing || state.over || state.paused) return;
    state.score += 2; // 2 puntos por cada segundo que sobrevives
    // Reloj
    state.secondInHour++;
    if (state.secondInHour >= SECONDS_PER_HOUR) {
      state.secondInHour = 0; state.hour++;
      state.score += 100; // bonus por cada hora
      beep(880, 0.2);
      if (state.hour >= 6) { winGame(); return; }
      officeMsgEl.textContent = "Son las " + HOURS[state.hour] + ". Siguen moviéndose...";
    }
    // --- Energía: cada sistema gasta distinto ---
    var cfg = state.nightConfig;
    var drain = 0.10 * cfg.drain;
    if (state.leftClosed) drain += 0.16 * cfg.drain;
    if (state.rightClosed) drain += 0.16 * cfg.drain;
    if (state.camOpen) drain += 0.10 * cfg.drain;
    if (state.leftLight || state.rightLight) drain += 0.05 * cfg.drain;
    if (state.flashOn) drain += 0.08 * cfg.drain;
    if (!state.powerOut) {
      state.power -= drain;
      if (state.power <= 0) {
        state.power = 0; state.powerOut = true; state.powerOutTimer = 0;
        state.leftClosed = false; state.rightClosed = false; state.camOpen = false; state.flashOn = false;
        camPanel.className = "";
        camToggleBtn.textContent = "📷 Abrir cámaras";
        officeMsgEl.textContent = "¡Se acabó la energía! Las puertas no funcionan...";
        gameEl.className = "flicker";
        setTimeout(function () { gameEl.className = ""; }, 1300);
        beep(150, 0.6, "sawtooth");
      }
    } else {
      state.powerOutTimer++;
      if (state.powerOutTimer >= 5) { jumpscare(ANIMALS[0], true); return; }
    }
    // --- Caja de música: se va parando sola ---
    state.musicBox -= cfg.musicDrain;
    if (state.musicBox < 0) state.musicBox = 0;
    if (state.musicBox <= 25 && !state.musicWarned) {
      state.musicWarned = true;
      officeMsgEl.textContent = "🎵 La caja de música se está parando. ¡Dale cuerda!";
      beep(300, 0.4, "square");
    }
    if (state.musicBox > 25) state.musicWarned = false;
    // Si la caja llega a 0, Sombra se activa y todos se ponen más agresivos.
    if (state.musicBox <= 0 && cfg.sombra) {
      var sombra = ANIMALS.filter(function (a) { return a.key === "sombra"; })[0];
      if (sombra.stage < 0) { sombra.stage = 0; sombra.side = Math.random() < 0.5 ? "left" : "right"; officeMsgEl.textContent = "👤 Sombra salió del Almacén. ¡La caja de música se paró!"; }
    }
    // --- Linterna: gasta batería encendida, se recarga apagada ---
    if (state.flashOn) {
      state.flashBattery -= 6;
      if (state.flashBattery <= 0) { state.flashBattery = 0; state.flashOn = false; officeMsgEl.textContent = "🔦 Se acabó la batería de la linterna. Espera a que se recargue."; }
    } else if (state.flashBattery < 100) {
      state.flashBattery += 3;
      if (state.flashBattery > 100) state.flashBattery = 100;
    }
    if (state.windCooldown > 0) state.windCooldown--;
    // --- Movimiento de animatrónicos ---
    state.moveTick++;
    if (state.moveTick % cfg.moveEvery === 0) moveAnimals();
    // --- Peligro en la puerta ---
    var caught = null;
    activeAnimals().forEach(function (a) {
      if (a.stage === 4) {
        if (doorClosed(a.side)) {
          a.atDoorTimer++;
          var need = a.key === "sombra" ? 6 : 4; // Sombra tarda más en irse
          if (a.atDoorTimer >= need) { a.stage = 2; a.atDoorTimer = 0; officeMsgEl.textContent = a.name + " se alejó de la puerta. ¡Uf!"; }
        } else {
          // La linterna frena un poco el ataque: cuenta más lento.
          a.atDoorTimer += state.flashOn ? 0.5 : 1;
          var limit = a.key === "zorro" ? 2 : 3; // Zorro ataca más rápido
          if (a.atDoorTimer >= limit) { caught = a; }
        }
      } else { a.atDoorTimer = 0; }
    });
    if (caught) { jumpscare(caught, false); return; }
    updateHUD();
  }

  function moveAnimals() {
    var cfg = state.nightConfig;
    activeAnimals().forEach(function (a) {
      if (a.stage >= 4) return;
      if (a.key === "sombra" && a.stage < 0) return; // aún escondida
      var chance = cfg.moveBase * a.speed * (1 + state.hour * 0.06);
      if (state.musicBox <= 0) chance *= 1.5; // caja parada = más agresivos
      if (state.camOpen && camForStage(a) === state.currentCam) chance *= 0.5; // si lo ves, se mueve menos
      if (state.flashOn && state.camOpen && camForStage(a) === state.currentCam) chance *= 0.4; // linterna lo congela
      // Zorro: a veces hace una carrera repentina
      if (a.key === "zorro" && Math.random() < 0.08) chance = 0.9;
      if (Math.random() < chance) {
        a.stage++;
        if (a.stage === 4) {
          officeMsgEl.textContent = "¡" + a.name + " llegó a la puerta " + (a.side === "left" ? "izquierda" : "derecha") + "! ¡Ciérrala!";
          beep(200, 0.4, "square");
        }
      } else if (a.stage > 0 && Math.random() < a.retreat) {
        a.stage--; // a veces retrocede
      }
    });
  }

  /* ================= 9. GANAR, PERDER Y REINICIAR ================= */
  function jumpscare(a, byPower) {
    if (state.over) return;
    state.over = true; state.playing = false;
    scareSound();
    el("jumpFace").textContent = a.emoji;
    el("jumpName").textContent = a.name;
    el("jumpscare").className = "show";
    setTimeout(function () {
      el("jumpscare").className = "";
      showEnd(false, a, byPower);
    }, 1800);
  }

  function winGame() {
    state.over = true; state.playing = false;
    // Bonus por energía y por caja de música que te quedó
    var bonus = Math.floor(state.power) * 3 + Math.floor(state.musicBox);
    state.score += bonus;
    winSound();
    // Guardar progreso: desbloquea la siguiente noche y actualiza récord
    save.wins++;
    if (state.night > save.bestNight) save.bestNight = state.night;
    if (state.night < 5 && save.unlocked < state.night + 1) save.unlocked = state.night + 1;
    if (state.score > save.highScore) save.highScore = state.score;
    storeSave();
    showEnd(true, null, false, bonus);
  }

  function showEnd(won, a, byPower, bonus) {
    var t = el("endTitle"), x = el("endText"), s = el("endScore");
    if (won) {
      t.textContent = "🎉 ¡Sobreviviste a la Noche " + state.night + "!";
      x.textContent = "Son las 6 AM. El sol salió y los animatrónicos volvieron a su lugar. ¡Buen trabajo, guardia!" +
        (state.night < 5 ? " Se desbloqueó la Noche " + (state.night + 1) + "." : " ¡Completaste las 5 noches! Eres leyenda de la pizzería.");
      s.textContent = "Puntos: " + state.score + " pts (bonus por energía y caja: +" + (bonus || 0) + "). Récord: " + save.highScore + " pts.";
    } else if (byPower || state.powerOut) {
      t.textContent = "💀 Sin energía...";
      x.textContent = "Se acabó la energía y Oso Bruno te encontró a oscuras. Intenta gastar menos: abre las puertas cuando no haya nadie y no dejes las cámaras prendidas todo el tiempo.";
      s.textContent = "Llegaste a las " + HOURS[state.hour] + " de la Noche " + state.night + ". Puntos: " + state.score + " pts.";
    } else {
      t.textContent = "💀 ¡Te atraparon!";
      x.textContent = (a ? a.name : "Un animatrónico") + " llegó a tu puerta y estaba abierta. La próxima vez, cierra la puerta en cuanto lo veas cerca. La linterna también lo frena un poco.";
      s.textContent = "Llegaste a las " + HOURS[state.hour] + " de la Noche " + state.night + ". Puntos: " + state.score + " pts.";
    }
    if (!won && state.score > save.highScore) { save.highScore = state.score; storeSave(); }
    renderMenu();
    el("endOverlay").className = "overlay";
  }

  function resetGame(night) {
    ANIMALS = baseAnimals();
    state.night = night;
    state.nightConfig = nightConfig(night);
    state.playing = false; state.paused = false; state.over = false;
    state.hour = 0; state.secondInHour = 0; state.score = 0;
    state.power = 100; state.powerOut = false; state.powerOutTimer = 0;
    state.leftClosed = false; state.rightClosed = false;
    state.leftLight = false; state.rightLight = false;
    state.camOpen = false; state.currentCam = "cam1"; state.moveTick = 0;
    state.musicBox = 100; state.musicWarned = false;
    state.flashOn = false; state.flashBattery = 100; state.windCooldown = 0;
    camPanel.className = "";
    camToggleBtn.textContent = "📷 Abrir cámaras";
    officeMsgEl.textContent = "Todo tranquilo... por ahora.";
    el("endOverlay").className = "overlay hidden";
    el("pauseOverlay").className = "overlay hidden";
    el("jumpscare").className = "";
    updateHUD(); renderCameras();
  }

  function showNightIntro(night) {
    var cfg = nightConfig(night);
    resetGame(night);
    el("menuOverlay").className = "overlay hidden";
    el("startTitle").textContent = "🌙 Noche " + night + " — " + cfg.label;
    el("startText").textContent = cfg.desc + " Sobrevive de las 12 AM a las 6 AM. " +
      (cfg.sombra ? "Sombra puede aparecer desde el Almacén. " : "") +
      "Cuida la energía, la caja de música y la batería de la linterna.";
    el("startBtn").textContent = "▶ Empezar la Noche " + night;
    el("startOverlay").className = "overlay";
  }

  function startGame() {
    el("startOverlay").className = "overlay hidden";
    state.playing = true; state.paused = false;
    officeMsgEl.textContent = "Son las 12 AM. Vigila las cámaras.";
    beep(440, 0.2);
    updateHUD();
  }

  function togglePause() {
    if (!state.playing || state.over) return;
    state.paused = !state.paused;
    el("pauseOverlay").className = state.paused ? "overlay" : "overlay hidden";
    el("pauseBtn").textContent = state.paused ? "▶ Seguir" : "⏸ Pausa";
  }

  function backToMenu() {
    state.playing = false; state.paused = false; state.over = false;
    el("endOverlay").className = "overlay hidden";
    el("pauseOverlay").className = "overlay hidden";
    el("startOverlay").className = "overlay hidden";
    renderMenu();
    el("menuOverlay").className = "overlay";
  }

  /* ================= 10. BOTONES Y TECLADO ================= */
  leftDoorBtn.onclick = function () { if (!state.playing || state.paused) return; state.leftClosed = !state.leftClosed; doorSound(); updateHUD(); };
  rightDoorBtn.onclick = function () { if (!state.playing || state.paused) return; state.rightClosed = !state.rightClosed; doorSound(); updateHUD(); };
  leftLightBtn.onclick = function () { if (!state.playing || state.paused) return; state.leftLight = !state.leftLight; state.rightLight = false; beep(700, 0.08); updateHUD(); };
  rightLightBtn.onclick = function () { if (!state.playing || state.paused) return; state.rightLight = !state.rightLight; state.leftLight = false; beep(700, 0.08); updateHUD(); };

  // Linterna: prende/apaga. Gasta batería y frena a los animatrónicos.
  flashBtn.onclick = function () {
    if (!state.playing || state.paused) return;
    if (!state.flashOn && state.flashBattery <= 5) { officeMsgEl.textContent = "🔦 La linterna casi no tiene batería. Espera a que se recargue."; return; }
    state.flashOn = !state.flashOn;
    beep(state.flashOn ? 900 : 500, 0.08);
    updateHUD();
  };

  // Caja de música: dar cuerda sube 35 puntos, con un pequeño enfriamiento.
  musicBtn.onclick = function () {
    if (!state.playing || state.paused) return;
    if (state.windCooldown > 0) return;
    state.musicBox = Math.min(100, state.musicBox + 35);
    state.windCooldown = 2;
    state.musicWarned = false;
    beep(660, 0.15); setTimeout(function () { beep(880, 0.15); }, 120);
    officeMsgEl.textContent = "🎵 Le diste cuerda a la caja de música. Sigue sonando...";
    updateHUD();
  };

  camToggleBtn.onclick = function () {
    if (!state.playing || state.paused || state.powerOut) return;
    state.camOpen = !state.camOpen;
    camPanel.className = state.camOpen ? "open" : "";
    camToggleBtn.textContent = state.camOpen ? "📷 Cerrar cámaras" : "📷 Abrir cámaras";
    beep(500, 0.08); updateHUD();
  };
  el("soundBtn").onclick = function () {
    state.sound = !state.sound;
    this.textContent = state.sound ? "🔊 Sonido: sí" : "🔇 Sonido: no";
  };
  el("pauseBtn").onclick = togglePause;
  el("resumeBtn").onclick = togglePause;
  el("restartBtn").onclick = function () { showNightIntro(state.night); };
  el("menuBtn").onclick = backToMenu;
  el("quitToMenuBtn").onclick = backToMenu;
  el("startBtn").onclick = startGame;
  el("playAgainBtn").onclick = function () { showNightIntro(state.night); };
  el("backMenuBtn").onclick = backToMenu;
  el("instructionsBtn").onclick = function () { el("instructionsOverlay").className = "overlay"; };
  el("closeInstructionsBtn").onclick = function () { el("instructionsOverlay").className = "overlay hidden"; };

  // Teclado: A/D puertas, Q/E luces, C cámaras, F linterna, M caja, P pausa
  document.addEventListener("keydown", function (e) {
    if (!state.playing) return;
    var k = (e.key || "").toLowerCase();
    if (k === "p") { togglePause(); return; }
    if (state.paused) return;
    if (k === "a") leftDoorBtn.onclick();
    else if (k === "d") rightDoorBtn.onclick();
    else if (k === "q") leftLightBtn.onclick();
    else if (k === "e") rightLightBtn.onclick();
    else if (k === "c") camToggleBtn.onclick();
    else if (k === "f") flashBtn.onclick();
    else if (k === "m") musicBtn.onclick();
    else if (k >= "1" && k <= "6") {
      if (!state.camOpen) camToggleBtn.onclick();
      state.currentCam = "cam" + k;
      renderCameras();
    }
  });

  /* ================= 11. INICIO ================= */
  renderMenu();
  renderCameras();
  updateHUD();
  setInterval(tick, 1000);
})();
