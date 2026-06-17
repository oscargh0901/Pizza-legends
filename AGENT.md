# AGENT.md — Escaneo del proyecto "Pizza Legends"

> Documento de referencia generado a partir de un escaneo completo del repositorio (código, assets, historial git). Pensado para que cualquier persona (o agente) que retome el proyecto entienda en qué estado está, qué arreglar y hacia dónde podría evolucionar.

## 1. Resumen ejecutivo

**Pizza Legends** es un prototipo muy temprano de un juego RPG estilo Pokémon/Zelda (vista cenital, movimiento por cuadrícula, NPCs, diálogos) construido en **JavaScript vanilla + Canvas 2D**, sin frameworks ni build tools.

El repo cubre la parte de **"overworld"** (mapa explorable, movimiento del héroe, NPCs con comportamiento en bucle, cutscenes de diálogo), un **sistema de batallas por turnos básico** (1 vs 1, sin equipo/colección de "pizzas" más allá de un combatiente por bando, sin menús) y ahora también **persistencia de progreso en `localStorage`** (posición del héroe y enemigos derrotados sobreviven a un recargo de página), usando los assets que ya estaban en `images/` (fondos de batalla, iconos de tipos de pizza, displays de combate) pero que hasta ahora no se usaban. Sigue siendo un proyecto **a medio terminar** (sin progresión real, sin colección de pizzas, sin recompensas), consistente con seguir un tutorial paso a paso y extenderlo con mecánicas propias.

Historial de commits (`git log`): `Initial commit` → `a` → `afinal`. Mensajes no descriptivos, típico de quien copia un tutorial sin documentar avances propios.

## 2. ¿De qué va el juego?

- El jugador controla un héroe en una sala ("DemoRoom") con vista top-down.
- Se mueve con flechas/WASD en una cuadrícula de 16px.
- Hay NPCs con rutinas de movimiento/espera en bucle (`behaviorLoop`) y diálogos al pulsar Enter si están enfrente (`talking`).
- Los diálogos se muestran como cajas de texto inferiores tipo Pokémon, con cutscenes simples (encadenar "andar", "estar quieto", "mensaje").
- La temática "pizza" (héroe, tipos de pizza: chill/fungi/spicy/veggie) tiene ahora un primer sistema de batallas por turnos: un NPC retador (`npcC`) inicia un combate 1 vs 1 con tabla de tipos (ciclo spicy→chill→fungi→veggie→spicy, con multiplicador x2/x0.5/x1), HUD con barra de HP e iconos de tipo, y selección de movimiento por botones. Es una mecánica **inventada para esta extensión** (el tutorial original no la detalla en el punto donde está el código) — todavía no hay equipo de varias pizzas, ni recompensas, ni progresión tras ganar/perder.

## 3. Tecnologías

| Capa | Tecnología | Notas |
|---|---|---|
| Lenguaje | JavaScript ES6 (clases) | Sin TypeScript, sin linter configurado |
| Render | Canvas 2D API | Sprites dibujados manualmente, sin motor (Phaser, PixiJS, etc.) |
| Módulos | **ES Modules** | `import`/`export` en `src/`, cargados vía `<script type="module">` |
| Estilos | CSS plano | `styles/global.css`, `styles/TextMessage.css`, `styles/Battle.css`, escalado por `transform: scale(3)` |
| Build / bundler | **Vite** | `package.json` + `npm run dev` / `npm run build` |
| Tests | **Playwright (E2E)** | `npm run test:e2e` — juega la partida real (mover, hablar, batalla) en un navegador headless |
| Persistencia | **`localStorage`** | `src/Storage.js` — posición del héroe y enemigos derrotados |
| Servidor | Vite dev server | `npm run dev` sirve `index.html` + `public/` en `http://localhost:5173` |

**Estructura de archivos (actualizada tras migrar a Vite + módulos ES):**
```
index.html            → un solo <script type="module" src="/src/main.js">
package.json           → scripts npm (dev/build/preview) y dependencia de Vite
src/                   → código del motor, en módulos ES (import/export)
  main.js               → punto de entrada, instancia Overworld
  Overworld.js          → bucle de juego (game loop), cámara, draw order
  OverworldMap.js       → clase del motor: paredes, cutscenes (sin datos de contenido)
  maps.js               → datos de mapas (DemoRoom, Kitchen), separados del motor
  OverworldEvent.js     → ejecuta eventos de cutscene (walk, stand, textMessage)
  GameObject.js         → clase base de entidades (posición, sprite, behaviorLoop)
  Person.js             → extiende GameObject con movimiento por input/cuadrícula
  Sprite.js             → animaciones por hoja de sprites (spritesheet)
  TextMessage.js        → caja de diálogo
  Battle.js             → motor de batalla por turnos: UI DOM, HUD, turnos, fin de combate
  Combatant.js          → clase de combatiente (hp, tipo, movimientos, isFainted)
  pizzas.js             → datos de batalla: tabla de tipos, movimientos, roster jugador/enemigo
  Storage.js             → persistencia en localStorage (posición del héroe, enemigos derrotados)
  DirectionInput.js     → input de teclado (flechas/WASD)
  KeyPressListener.js   → listener de tecla puntual (Enter)
  utils.js              → helpers de cuadrícula y eventos custom
public/                → assets servidos tal cual por Vite
  images/                → mapas, personajes, iconos de pizza, UI de batalla (ya en uso)
  styles/                → CSS (incluye Battle.css)
tests/
  battle.spec.js         → test E2E (Playwright): juega la partida real en navegador headless
playwright.config.js   → arranca el dev server y configura el navegador para el test E2E
```

## 4. Errores detectados

> Estado: los puntos 1-4 y 6 ya se corrigieron (ver "Cambios aplicados" al final). Se dejan documentados para que quede constancia de qué se encontró y por qué.

1. ~~**`KeyPressListener.unbind()` no desvincula nada — bug real.**~~ **Corregido.** (`src/KeyPressListener.js:20-23`)
   Usaba `addEventListener` en vez de `removeEventListener` en `unbind()`. Cada vez que se cerraba un `TextMessage` (que llama a `unbind()`), en lugar de quitar el listener de Enter, **se duplicaba**. Tras varios diálogos, una sola pulsación de Enter disparaba el callback múltiples veces → fuga de listeners y comportamiento errático progresivo. Era el bug más importante del repo.

2. ~~**`console.log` de depuración en código "final".**~~ **Corregido.** Se retiraron `console.log("mounting!")` (`GameObject.js`) y `console.log({ match })` (`OverworldMap.js`).

3. ~~**Typo tolerado por JS pero descuidado.**~~ **Corregido.** `hero. direction` → `hero.direction` en `OverworldMap.js`.

4. ~~**Sombra de sprite "hardcodeada".**~~ **Corregido.** `Sprite.js` ahora respeta `config.useShadow` en vez de tenerlo forzado a `true` con la opción comentada.

5. **Sin manejo de errores de carga de imágenes.** (pendiente) Todas las clases (`Sprite`, `OverworldMap`) asumen que las imágenes siempre cargan bien; si una ruta falla, el juego sigue "vivo" pero dibuja huecos sin avisar en consola de forma clara.

6. ~~**Datos de contenido mezclados con lógica de motor.**~~ **Corregido.** Los mapas (`DemoRoom`, `Kitchen`) se movieron a `src/maps.js`, separados de la clase `OverworldMap` (motor).

7. **Sin control de colisiones por mapa real ni capas de profundidad** (pendiente) más allá de un diccionario plano de paredes (`walls`) — no escala bien a mapas grandes ni a colisiones con objetos dinámicos.

8. **Sin gestión de resolución/responsive.** (pendiente) El canvas es fijo a 352×198px y se escala con `transform: scale(3)` vía CSS; no se adapta a distintos tamaños de pantalla ni a móvil.

## 5. Mejoras sugeridas (priorizadas)

**Críticas (antes de seguir construyendo encima):** ✅ hechas en esta ronda
- ~~Arreglar `KeyPressListener.unbind()` (cambiar a `removeEventListener`).~~
- ~~Quitar los `console.log` de depuración.~~
- ~~Añadir `package.json` + un bundler ligero (Vite) para poder usar módulos ES (`import`/`export`) en vez de variables globales y `<script>` en orden manual.~~
- ~~Añadir un `README.md` con instrucciones para ejecutar el proyecto.~~
- ~~Separar datos de mapas/contenido del motor (`src/maps.js`).~~
- Falta: añadir `.gitignore` con licencia explícita — el `.gitignore` ya está, la licencia sigue pendiente de decisión (ver sección 6, importante por el origen tutorial).

**Funcionales (para que sea un juego real):**
- ~~Implementar el sistema de batallas (ya hay arte preparado: `*Battle.png`, iconos chill/fungi/spicy/veggie, `SingleMemberDisplay.png`)~~ **Hecho (versión básica)**, ver sección 10. Falta: equipo de varias pizzas por bando, recompensas/consecuencias tras ganar o perder, más mapas de batalla y enemigos.
- ~~Añadir persistencia (`localStorage` o backend) para guardar progreso.~~ **Hecho**, ver sección 11. Falta: persistir también el mapa actual si se añaden más mapas jugables, y un backend si en algún momento se quiere progreso multi-dispositivo.
- Añadir un sistema de transición entre mapas (actualmente solo hay un mapa cargado, `Kitchen` está definida pero nunca se usa).
- Soporte táctil/mobile (controles en pantalla) si se apunta a web/móvil.

**Calidad de código:**
- Introducir ESLint + Prettier.
- ~~Tests mínimos~~ Hay un test E2E (Playwright, ver sección 10). Falta: tests unitarios para utils (`nextPosition`, `withGrid`, etc.) y lógica de colisiones.
- Tipado opcional con JSDoc o migración a TypeScript a medida que crezca.

## 6. Origen del proyecto y originalidad (importante)

La estructura de clases (`Overworld`, `OverworldMap`, `OverworldEvent`, `GameObject`, `Person`, `Sprite`, `DirectionInput`, `KeyPressListener`, `TextMessage`), los nombres de mapas (`DemoRoom`, `Kitchen`, `PizzaShop`, `Street`...) y los assets (iconos de tipos de pizza, displays de batalla) coinciden con la serie tutorial pública **"Pizza Legends" de Drew Conley** (YouTube), un curso público de creación de un RPG estilo Pokémon en JS vanilla. Es decir: el código base es, en gran parte, una **transcripción del tutorial**, no una base original.

**Decisión tomada:** el objetivo de este repo es portfolio personal (no publicar/monetizar el juego como producto), así que no hace falta sustituir arte ni renombrar nada. Se añadió una sección "Origen" en el `README.md` que acredita el tutorial de Drew Conley explícitamente y enumera lo añadido sobre esa base (sistema de batallas, persistencia, tests E2E, migración a Vite, bugs corregidos) — eso es justo lo que aporta valor de cara a un reclutador: ser transparente sobre el punto de partida y mostrar qué se construyó encima.

Si en el futuro la intención cambia a **publicar o monetizar el juego**, entonces sí habría que sustituir el arte (sprites, mapas, iconos) por arte propio o con licencia adecuada, y renombrar/refactorizar lo suficiente para que no sea una copia 1:1 del tutorial — el nombre "Pizza Legends" también está ligado al original y habría que cambiarlo.

## 7. Proyección de negocio

Siendo honesto sobre el estado actual: **hoy el proyecto no tiene valor comercial por sí mismo**. Es un esqueleto de movimiento + diálogos sin bucle de juego completo (sin combate, sin progresión, sin economía, sin monetización). Antes de pensar en negocio, falta completar el *core loop* (explorar → combate → progresión).

Caminos razonables si se decide invertir tiempo en convertirlo en algo con potencial:

1. **Juego indie ligero (más realista).** Terminar el sistema de batallas y publicarlo en itch.io / como PWA. Es un nicho saturado y de bajos ingresos salvo que el arte/historia destaque mucho; sirve más como **proyecto de portfolio para conseguir trabajo como dev de juegos/frontend** que como negocio en sí.
2. **"Advergame" para una marca de pizza.** La temática (pizzas, tipos como toppings) se presta a un juego promocional para una pizzería/cadena (ej. campaña de marketing, app de fidelización con minijuego). Esto sí tiene un modelo de negocio claro (cliente B2B paga por el desarrollo/personalización), pero requiere salir y conseguir ese cliente; el código actual sirve como prueba de concepto, no como producto vendible todavía.
3. **Recurso educativo.** Empaquetarlo como ejemplo didáctico (curso propio, artículos, repositorio comentado) para enseñar desarrollo de juegos en JS vanilla. Bajo techo de ingresos, pero bajo coste y reutiliza lo ya hecho.

**Recomendación calibrada:** no proyectar expectativas de negocio sobre el código tal cual está. Si el objetivo es monetizar, el camino más realista a corto plazo es la opción 2 (advergame a medida), pero exige completar el combate, sustituir el arte por algo con licencia clara/original, y conseguir un cliente — no es algo que el repo resuelva solo.

## 8. Próximos pasos sugeridos (checklist)

- [x] Arreglar bug de `KeyPressListener.unbind()`
- [x] Limpiar `console.log` de depuración
- [x] Añadir `package.json`, bundler (Vite) y módulos ES
- [x] Añadir `README.md` con instrucciones de ejecución
- [x] Separar datos de mapas de la lógica del motor
- [x] Decidir y documentar licencia / originalidad del arte y nombre (ver sección 6: portfolio + atribución en README, sin sustituir arte)
- [x] Implementar sistema de batallas (versión básica 1 vs 1, ver sección 10)
- [x] Añadir un test E2E (Playwright, ver sección 10)
- [x] Añadir persistencia de progreso (`localStorage`, ver sección 11)

## 9. Cambios aplicados en esta ronda

- `KeyPressListener.unbind()` ahora usa `removeEventListener` (antes duplicaba listeners en cada diálogo cerrado).
- Eliminados los `console.log` de depuración en `GameObject.js` y `OverworldMap.js`.
- Corregido el typo `hero. direction` → `hero.direction`.
- `Sprite.js` respeta `config.useShadow` en vez de tenerlo forzado.
- Proyecto migrado a **Vite** + **módulos ES**: `package.json`, `npm run dev`/`build`/`preview`, código movido a `src/`, assets estáticos movidos a `public/`.
- Datos de mapas (`DemoRoom`, `Kitchen`) separados del motor en `src/maps.js`; `OverworldMap.js` ahora solo contiene la clase.
- `index.html` simplificado a un único `<script type="module" src="/src/main.js">` en vez de 11 `<script>` en orden manual.
- Añadidos `README.md` y `.gitignore`.
- Verificado con `npm run build` (15 módulos transformados sin error) y con el dev server de Vite (`index.html`, `/src/main.js`, imágenes y CSS responden 200, sin errores de resolución de imports). No se pudo abrir un navegador real en este entorno (sin acceso de red para descargar el binario headless), así que falta una verificación visual manual del juego en ejecución.

Todos los puntos del checklist (sección 8) están resueltos a fecha de esta ronda.

## 10. Sistema de batallas (añadido en esta ronda)

El tutorial original no cubre el combate en el punto donde estaba el código, así que esta es una mecánica **diseñada e implementada desde cero** para esta extensión, reutilizando el arte que ya estaba en el repo sin usar.

**Diseño:**
- Tabla de tipos en ciclo de 4 (`src/pizzas.js`): `spicy` > `chill` > `fungi` > `veggie` > `spicy` (x2 si es fuerte contra el rival, x0.5 si es débil, x1 en cualquier otro caso, incluidos los movimientos de tipo `normal`).
- Cada tipo tiene un movimiento propio (power 12) más un movimiento neutral compartido "Bite" (power 8, tipo `normal`).
- `src/Combatant.js`: clase de motor con `hp`/`maxHp`, `isFainted`, `hpPercentage` y `takeDamage()`.
- `src/Battle.js`: motor de la batalla — construye la UI en el DOM (mismo patrón que `TextMessage.js`: `createElement()` + `init(container)`), turno del jugador por botones de movimiento, turno del enemigo automático (movimiento aleatorio), HUD con barra de HP e icono de tipo por combatiente, fin de combate con `onComplete(didWin)`.
- `public/styles/Battle.css`: overlay sobre `.game-container`, fondo `DemoBattle.png`, HUD basado en `SingleMemberDisplay.png`, estética pixel-art consistente con `TextMessage.css`.
- `src/OverworldEvent.js`: nuevo tipo de evento `battle` que instancia `Battle` y resuelve la cutscene cuando termina (gana o pierde).
- `src/maps.js`: nuevo NPC `npcC` en `DemoRoom` (reutiliza el sprite `npc3.png`) cuyo diálogo encadena un mensaje, el evento `battle` y un mensaje de despedida.
- Roster de demo: jugador = "Margherita" (tipo `veggie`), enemigo = "Diabla" (tipo `spicy`) — elegido a propósito para que el movimiento propio del jugador sea súper efectivo contra el enemigo y se note la mecánica de tipos en la primera partida.

**Limitaciones conocidas (a propósito, para no inventar de más):**
- Solo hay un combatiente por bando; no hay equipo/colección de varias pizzas.
- No hay recompensas tras ganar (ni XP ni objetos); solo se recuerda que `npcC` ya fue derrotado (ver sección 11) para no repetir la batalla.
- Solo hay un enemigo y un fondo de batalla (`DemoBattle.png`); los demás fondos de batalla (`KitchenBattle.png`, `StreetBattle.png`, etc.) siguen sin usarse.

## 11. Persistencia de progreso (añadido en esta ronda)

`src/Storage.js` envuelve `localStorage` en un único objeto serializado bajo la key `pizzaLegendsSave` (`JSON.parse`/`JSON.stringify`), con una API mínima: `getHeroPosition()`/`setHeroPosition(x, y)` y `isDefeated(enemyId)`/`markDefeated(enemyId)`.

**Cableado:**
- `src/Person.js`: cada vez que el héroe (`isPlayerControlled`) termina de moverse una casilla, guarda su posición.
- `src/maps.js`: al construir `DemoRoom`, si hay una posición guardada se usa como punto de partida del héroe en vez de la posición por defecto `(5,6)`.
- `src/OverworldEvent.js`: el evento `battle` comprueba `Storage.isDefeated(enemyId)` antes de lanzar la batalla — si ya fue derrotado, se resuelve la cutscene sin volver a luchar; si se gana, se marca como derrotado con `Storage.markDefeated(enemyId)`.

**Cubierto por el test E2E** (`tests/battle.spec.js`, segundo test): juega la batalla completa, comprueba el contenido de `localStorage`, recarga la página y confirma que el héroe aparece en la posición guardada y que retar a `npcC` ya no abre la pantalla de batalla.

**Limitación conocida (a propósito):** solo es progreso local al navegador/dispositivo — no hay cuenta de usuario ni backend, así que borrar el `localStorage` del navegador (o cambiar de dispositivo) reinicia el progreso.

**Verificación realizada:**
- `node --check` en todos los archivos de `src/`.
- Pruebas de lógica pura en Node (sin DOM) para `getTypeMultiplier`, `calculateDamage` y `Combatant` (multiplicadores x2/x0.5/x1, daño calculado, clamp de HP a 0, `isFainted`).
- `vite build` exitoso (18 módulos transformados).
- Test E2E real con Playwright (`tests/battle.spec.js`, `npm run test:e2e`): abre el juego en Chromium headless, mueve al héroe, habla con `npcC`, juega la batalla completa y comprueba HUD, daño, victoria y diálogo de cierre. Gracias a esta prueba se encontró y arregló un bug visual real (el HUD de batalla tapaba el nombre con la barra de HP porque `SingleMemberDisplay.png` es solo la ranura de la barra, no una placa de nombre completa).
